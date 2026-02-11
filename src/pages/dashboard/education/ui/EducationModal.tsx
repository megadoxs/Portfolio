"use client";

import { Modal, TextInput, Button, Stack, Group, Text, rem, Combobox, InputBase, useCombobox } from "@mantine/core";
import {DateInput} from "@mantine/dates";
import { useForm } from "@mantine/form";
import {useLocale, useTranslations} from "next-intl";
import {IconSchool, IconCertificate, IconBook, IconChevronDown, IconCalendar} from "@tabler/icons-react";
import { Education, EducationRequestModel } from "@/entities/education";
import { useEffect } from "react";
import 'dayjs/locale/fr';

interface EducationModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (data: EducationRequestModel) => void;
    isLoading: boolean;
    initialData?: Education | null;
}

export default function EducationModal({ opened, onClose, onSubmit, isLoading, initialData }: EducationModalProps) {
    const t = useTranslations("education");
    const locale = useLocale();
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const form = useForm<EducationRequestModel>({
        initialValues: {
            institution: "",
            degree: "",
            fieldOfStudy: "",
            startDate: new Date(),
            endDate: new Date(),
            iconType: "university",
        },
        validate: {
            institution: (value) => (!value ? t("institutionRequired") : null),
            iconType: (value) => (!value ? t("iconRequired") : null),
            startDate: (value) => {
                if (!value) return t("startDateRequired");
                if (value > new Date()) return t("startDateFuture");
                return null;
            },
            endDate: (value, values) => {
                if (!value) return t("endDateRequired");
                if (value < values.startDate) return t("endDateBeforeStart");
                return null;
            },
        },
    });

    useEffect(() => {
        if (opened) {
            if (initialData) {
                form.setValues({
                    institution: initialData.institution,
                    degree: initialData.degree || "",
                    fieldOfStudy: initialData.fieldOfStudy || "",
                    startDate: new Date(initialData.startDate),
                    endDate: new Date(initialData.endDate),
                    iconType: initialData.iconType,
                });
            } else {
                form.reset();
            }
        }
    }, [opened, initialData]);

    const handleSubmit = (values: EducationRequestModel) => {
        onSubmit(values);
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    const iconOptions = [
        {
            value: "university",
            label: t("iconUniversity"),
        },
        {
            value: "college",
            label: t("iconCollege"),
        },
        {
            value: "school",
            label: t("iconSchool"),
        },
    ];

    const selectedOption = iconOptions.find((option) => option.value === form.values.iconType);

    const getIconForValue = (value: string) => {
        switch (value) {
            case "university":
                return <IconSchool style={{ width: rem(16), height: rem(16) }} />;
            case "college":
                return <IconCertificate style={{ width: rem(16), height: rem(16) }} />;
            case "school":
                return <IconBook style={{ width: rem(16), height: rem(16) }} />;
            default:
                return <IconSchool style={{ width: rem(16), height: rem(16) }} />;
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

    // Date format based on locale
    const dateFormat = locale === 'fr' ? 'D MMMM YYYY' : 'MMMM D, YYYY';

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={initialData ? t("editTitle") : t("addTitle")}
            size="md"
        >
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
                        <DateInput
                            label={t("startDateLabel")}
                            placeholder={t("startDatePlaceholder")}
                            radius="xl"
                            valueFormat={dateFormat}
                            leftSection={<IconCalendar size={16} stroke={1.5} />}
                            leftSectionPointerEvents="none"
                            value={form.values.startDate}
                            onChange={(value) => {
                                form.setFieldValue('startDate', value ? new Date(value) : new Date());
                            }}
                            error={form.errors.startDate}
                            styles={{
                                input: { border: "1px solid var(--mantine-color-gray-3)" },
                            }}
                            locale={locale}
                        />

                        <DateInput
                            label={t("endDateLabel")}
                            placeholder={t("endDatePlaceholder")}
                            radius="xl"
                            valueFormat={dateFormat}
                            clearable
                            leftSection={<IconCalendar size={16} stroke={1.5} />}
                            leftSectionPointerEvents="none"
                            value={form.values.endDate}
                            onChange={(value) => {
                                form.setFieldValue('endDate', value ? new Date(value) : new Date());
                            }}
                            error={form.errors.endDate}
                            styles={{
                                input: { border: "1px solid var(--mantine-color-gray-3)" },
                            }}
                            locale={locale}
                        />
                    </Group>

                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
                            {t("cancelButton")}
                        </Button>
                        <Button type="submit" loading={isLoading}>
                            {initialData ? t("updateButton") : t("saveButton")}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}