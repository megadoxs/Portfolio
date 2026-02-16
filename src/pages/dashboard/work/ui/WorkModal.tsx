"use client";

import { Modal, Stack, Button, Group, TextInput, Box, Card, Text } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useLocale, useTranslations } from "next-intl";
import { Work, WorkRequestModel } from "@/entities/work";
import { IconCalendar } from "@tabler/icons-react";
import { useEffect } from "react";
import { useMantineColorScheme } from "@mantine/core";
import 'dayjs/locale/fr';

interface WorkModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (work: WorkRequestModel) => Promise<void>;
    isLoading?: boolean;
    editWork?: Work | null;
}

export default function WorkModal({ opened, onClose, onSubmit, isLoading, editWork }: WorkModalProps) {
    const t = useTranslations("work");
    const locale = useLocale();
    const { colorScheme } = useMantineColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    const form = useForm<WorkRequestModel>({
        initialValues: {
            company: "",
            position: "",
            startDate: new Date(),
            endDate: null,
        },
        validate: {
            company: (value) => (!value?.trim() ? t("companyRequired") : null),
            position: (value) => (!value?.trim() ? t("positionRequired") : null),
            startDate: (value) => {
                if (!value) return t("startDateRequired");
                if (value > new Date()) return t("startDateFuture");
                return null;
            },
            endDate: (value, values) => {
                if (value && value < values.startDate) return t("endDateBeforeStart");
                return null;
            },
        },
    });

    useEffect(() => {
        if (opened) {
            if (editWork) {
                form.setValues({
                    company: editWork.company,
                    position: editWork.position,
                    startDate: new Date(editWork.startDate),
                    endDate: editWork.endDate ? new Date(editWork.endDate) : null,
                });
            } else {
                form.reset();
            }
        }
    }, [opened, editWork]);

    const handleSubmit = async (values: WorkRequestModel) => {
        await onSubmit(values);
        handleClose();
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    const dateFormat = locale === 'fr' ? 'D MMMM YYYY' : 'MMMM D, YYYY';

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
                                <DateInput
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
                                    required
                                />

                                <DateInput
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
                                />
                            </Group>

                            <Group justify="flex-end" mt="md">
                                <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
                                    {t("cancelButton")}
                                </Button>
                                <Button
                                    type="submit"
                                    loading={isLoading}
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