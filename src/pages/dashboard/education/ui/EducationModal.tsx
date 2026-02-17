"use client";

import { Modal, TextInput, Button, Stack, Group, Text, rem, Combobox, InputBase, useCombobox, Box, Card } from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useLocale, useTranslations } from "next-intl";
import { IconSchool, IconCertificate, IconBook, IconChevronDown, IconCalendar } from "@tabler/icons-react";
import { Education, EducationRequestModel } from "@/entities/education";
import { useMantineColorScheme } from "@mantine/core";
import { useEffect } from "react";
import 'dayjs/locale/fr';
import dayjs from 'dayjs';
import {useTranslate} from "@/shared/lib/translate/useTranslate";

interface EducationModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (data: EducationRequestModel) => void;
    isLoading: boolean;
    initialData?: Education | null;
}

const dateToMonthString = (date: Date): string => {
    return dayjs(date).format('YYYY-MM');
};

const monthStringToDate = (monthString: string): Date => {
    return dayjs(monthString, 'YYYY-MM').toDate();
};

export default function EducationModal({ opened, onClose, onSubmit, isLoading, initialData }: EducationModalProps) {
    const t = useTranslations("education");
    const locale = useLocale();
    const { colorScheme } = useMantineColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';
    const { translateFields, isTranslating } = useTranslate();
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const form = useForm<{
        institution: string;
        degree: string;
        fieldOfStudy: string;
        startDate: Date | null;
        endDate: Date | null;
        iconType: string;
    }>({
        initialValues: {
            institution: "",
            degree: "",
            fieldOfStudy: "",
            startDate: null,
            endDate: null,
            iconType: "university",
        },
        validate: {
            institution: (value) => (!value ? t("institutionRequired") : null),
            iconType: (value) => (!value ? t("iconRequired") : null),
            startDate: (value) => {
                if (!value) return t("startDateRequired");
                const now = dayjs().endOf('month');
                if (dayjs(value).isAfter(now)) return t("startDateFuture");
                return null;
            },
            endDate: (value, values) => {
                if (!value) return t("endDateRequired");
                if (values.startDate && dayjs(value).isBefore(dayjs(values.startDate))) {
                    return t("endDateBeforeStart");
                }
                return null;
            },
        },
    });

    useEffect(() => {
        if (opened) {
            if (initialData) {
                form.setValues({
                    institution: initialData.institution,
                    degree: initialData.degree_en || "",
                    fieldOfStudy: initialData.fieldOfStudy_en || "",
                    startDate: monthStringToDate(initialData.startDate),
                    endDate: monthStringToDate(initialData.endDate),
                    iconType: initialData.iconType,
                });
            } else {
                form.reset();
            }
        }
    }, [opened, initialData]);

    useEffect(() => {
        if (form.values.startDate && form.values.endDate) {
            if (dayjs(form.values.endDate).isBefore(dayjs(form.values.startDate))) {
                form.setFieldValue('endDate', null);
            }
        }
    }, [form.values.startDate]);

    const handleSubmit = async (values: typeof form.values) => {
        const fieldsToTranslate: Record<string, string | null> = {};
        if (values.degree) fieldsToTranslate.degree = values.degree;
        if (values.fieldOfStudy) fieldsToTranslate.fieldOfStudy = values.fieldOfStudy;

        const translated = Object.keys(fieldsToTranslate).length > 0
            ? await translateFields(fieldsToTranslate)
            : {};

        const educationData: EducationRequestModel = {
            institution: values.institution,
            degree_en: (translated.degree_en as string) ?? null,
            degree_fr: (translated.degree_fr as string) ?? null,
            fieldOfStudy_en: (translated.fieldOfStudy_en as string) ?? null,
            fieldOfStudy_fr: (translated.fieldOfStudy_fr as string) ?? null,
            iconType: values.iconType,
            startDate: values.startDate ? dateToMonthString(values.startDate) : "",
            endDate: values.endDate ? dateToMonthString(values.endDate) : "",
        };

        onSubmit(educationData);
        handleClose();
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    const iconOptions = [
        { value: "university", label: t("iconUniversity") },
        { value: "college", label: t("iconCollege") },
        { value: "school", label: t("iconSchool") },
    ];

    const selectedOption = iconOptions.find((option) => option.value === form.values.iconType);

    const getIconForValue = (value: string) => {
        switch (value) {
            case "university": return <IconSchool style={{ width: rem(16), height: rem(16) }} />;
            case "college": return <IconCertificate style={{ width: rem(16), height: rem(16) }} />;
            case "school": return <IconBook style={{ width: rem(16), height: rem(16) }} />;
            default: return <IconSchool style={{ width: rem(16), height: rem(16) }} />;
        }
    };

    const options = iconOptions.map((item) => (
        <Combobox.Option value={item.value} key={item.value}>
            <Group gap="sm">
                {getIconForValue(item.value)}
                <Text size="sm">{item.label}</Text>
            </Group>
        </Combobox.Option>
    ));

    const dateFormat = locale === 'fr' ? 'MMMM YYYY' : 'MMMM YYYY';
    const isBusy = isLoading || isTranslating;

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={<Text fw={700} size="lg">{initialData ? t("editTitle") : t("addTitle")}</Text>}
            size="md"
            centered
            overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
            styles={{
                content: { backgroundColor: 'transparent' },
                header: { backgroundColor: 'transparent' },
                body: { padding: 0, overflow: 'hidden' },
            }}
        >
            <Box className={`glowWrapper ${theme}`}>
                <Card className={`glassCard ${theme}`} p="xl" radius="md">
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Stack gap="md">
                            <Combobox
                                store={combobox}
                                onOptionSubmit={(val) => {
                                    form.setFieldValue("iconType", val);
                                    combobox.closeDropdown();
                                }}
                            >
                                <Combobox.Target>
                                    <InputBase
                                        component="button"
                                        type="button"
                                        pointer
                                        label={t("iconLabel")}
                                        rightSection={<IconChevronDown size={16} />}
                                        onClick={() => combobox.toggleDropdown()}
                                        rightSectionPointerEvents="none"
                                        error={form.errors.iconType}
                                        required
                                    >
                                        {selectedOption ? (
                                            <Group gap="sm">
                                                {getIconForValue(selectedOption.value)}
                                                <Text size="sm">{selectedOption.label}</Text>
                                            </Group>
                                        ) : (
                                            <Text size="sm" c="dimmed">{t("iconPlaceholder")}</Text>
                                        )}
                                    </InputBase>
                                </Combobox.Target>
                                <Combobox.Dropdown>
                                    <Combobox.Options>{options}</Combobox.Options>
                                </Combobox.Dropdown>
                            </Combobox>

                            <TextInput
                                label={t("institutionLabel")}
                                placeholder={t("institutionPlaceholder")}
                                {...form.getInputProps("institution")}
                                required
                            />

                            <TextInput
                                label={t("degreeLabel")}
                                placeholder={t("degreePlaceholder")}
                                {...form.getInputProps("degree")}
                            />

                            <TextInput
                                label={t("fieldOfStudyLabel")}
                                placeholder={t("fieldOfStudyPlaceholder")}
                                {...form.getInputProps("fieldOfStudy")}
                            />

                            <Group grow align="flex-start">
                                <MonthPickerInput
                                    label={t("startDateLabel")}
                                    placeholder={t("startDatePlaceholder")}
                                    radius="xl"
                                    valueFormat={dateFormat}
                                    leftSection={<IconCalendar size={16} stroke={1.5} />}
                                    leftSectionPointerEvents="none"
                                    {...form.getInputProps("startDate")}
                                    styles={{ input: { border: "1px solid var(--mantine-color-gray-3)" } }}
                                    locale={locale}
                                    maxDate={dayjs().endOf('month').toDate()}
                                    required
                                />
                                <MonthPickerInput
                                    label={t("endDateLabel")}
                                    placeholder={t("endDatePlaceholder")}
                                    radius="xl"
                                    valueFormat={dateFormat}
                                    clearable
                                    leftSection={<IconCalendar size={16} stroke={1.5} />}
                                    leftSectionPointerEvents="none"
                                    {...form.getInputProps("endDate")}
                                    styles={{ input: { border: "1px solid var(--mantine-color-gray-3)" } }}
                                    locale={locale}
                                    minDate={form.values.startDate || undefined}
                                    required
                                />
                            </Group>

                            <Group justify="flex-end" mt="md">
                                <Button variant="subtle" onClick={handleClose} disabled={isBusy}>
                                    {t("cancelButton")}
                                </Button>
                                <Button type="submit" loading={isBusy}>
                                    {initialData ? t("updateButton") : t("saveButton")}
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                </Card>
            </Box>
        </Modal>
    );
}