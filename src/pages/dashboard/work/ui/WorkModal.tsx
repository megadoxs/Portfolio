"use client";

import { Modal, Stack, Button, Group, TextInput, Box, Card, Text } from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useLocale, useTranslations } from "next-intl";
import { Work, WorkRequestModel } from "@/entities/work";
import { IconCalendar } from "@tabler/icons-react";
import { useEffect } from "react";
import { useMantineColorScheme } from "@mantine/core";
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import {useTranslate} from "@/shared/lib/translate/useTranslate";

interface WorkModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (work: WorkRequestModel) => Promise<void>;
    isLoading?: boolean;
    editWork?: Work | null;
}

const dateToMonthString = (date: Date): string => {
    return dayjs(date).format('YYYY-MM');
};

const monthStringToDate = (monthString: string): Date => {
    return dayjs(monthString, 'YYYY-MM').toDate();
};

export default function WorkModal({ opened, onClose, onSubmit, isLoading, editWork }: WorkModalProps) {
    const t = useTranslations("work");
    const locale = useLocale();
    const { colorScheme } = useMantineColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';
    const { translateFields, isTranslating } = useTranslate();

    const form = useForm<{
        company: string;
        position: string;
        startDate: Date | null;
        endDate: Date | null;
    }>({
        initialValues: {
            company: "",
            position: "",
            startDate: null,
            endDate: null,
        },
        validate: {
            company: (value) => (!value?.trim() ? t("companyRequired") : null),
            position: (value) => (!value?.trim() ? t("positionRequired") : null),
            startDate: (value) => {
                if (!value) return t("startDateRequired");
                const now = dayjs().endOf('month');
                if (dayjs(value).isAfter(now)) return t("startDateFuture");
                return null;
            },
            endDate: (value, values) => {
                if (!value) return null;
                const now = dayjs().endOf('month');
                if (dayjs(value).isAfter(now)) return t("endDateFuture");
                if (values.startDate && dayjs(value).isBefore(dayjs(values.startDate))) {
                    return t("endDateBeforeStart");
                }
                return null;
            },
        },
    });

    useEffect(() => {
        if (opened) {
            if (editWork) {
                form.setValues({
                    company: editWork.company,
                    position: editWork.position_en, // prefill with EN for editing
                    startDate: monthStringToDate(editWork.startDate),
                    endDate: editWork.endDate ? monthStringToDate(editWork.endDate) : null,
                });
            } else {
                form.reset();
            }
        }
    }, [opened, editWork]);

    useEffect(() => {
        if (form.values.startDate && form.values.endDate) {
            if (dayjs(form.values.endDate).isBefore(dayjs(form.values.startDate))) {
                form.setFieldValue('endDate', null);
            }
        }
    }, [form.values.startDate]);

    const handleSubmit = async (values: typeof form.values) => {
        const translated = await translateFields({
            position: values.position,
        });

        const workData: WorkRequestModel = {
            company: values.company,
            position_en: translated.position_en as string,
            position_fr: translated.position_fr as string,
            startDate: values.startDate ? dateToMonthString(values.startDate) : "",
            endDate: values.endDate ? dateToMonthString(values.endDate) : null,
        };

        await onSubmit(workData);
        handleClose();
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    const dateFormat = locale === 'fr' ? 'MMMM YYYY' : 'MMMM YYYY';
    const isBusy = isLoading || isTranslating;

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={<Text fw={700} size="lg">{editWork ? t("modalTitleEdit") : t("modalTitleAdd")}</Text>}
            size="lg"
            centered
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
            styles={{
                content: {
                    backgroundColor: 'transparent',
                },
                header: {
                    backgroundColor: 'transparent',
                },
                body: {
                    padding: 0,
                    overflow: 'hidden',
                },
            }}
        >
            <Box className={`glowWrapper ${theme}`}>
                <Card className={`glassCard ${theme}`} p="xl" radius="md">
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Stack gap="md">
                            <TextInput
                                label={t("companyLabel")}
                                placeholder={t("companyPlaceholder")}
                                {...form.getInputProps("company")}
                                required
                            />

                            <TextInput
                                label={t("positionLabel")}
                                placeholder={t("positionPlaceholder")}
                                {...form.getInputProps("position")}
                                required
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
                                    styles={{
                                        input: { border: "1px solid var(--mantine-color-gray-3)" },
                                    }}
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
                                    styles={{
                                        input: { border: "1px solid var(--mantine-color-gray-3)" },
                                    }}
                                    locale={locale}
                                    minDate={form.values.startDate || undefined}
                                    maxDate={dayjs().endOf('month').toDate()}
                                />
                            </Group>

                            <Group justify="flex-end" mt="md">
                                <Button variant="subtle" onClick={handleClose} disabled={isBusy}>
                                    {t("cancelButton")}
                                </Button>
                                <Button
                                    type="submit"
                                    loading={isBusy}
                                >
                                    {editWork ? t("updateButton") : t("submitButton")}
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                </Card>
            </Box>
        </Modal>
    );
}