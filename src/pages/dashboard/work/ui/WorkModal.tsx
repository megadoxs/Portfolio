"use client";

import { Modal, Stack, Button, Group, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useLocale, useTranslations } from "next-intl";
import { Work, WorkRequestModel } from "@/entities/work";
import { IconCalendar } from "@tabler/icons-react";
import { useEffect } from "react";
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
            title={editWork ? t("modalTitleEdit") : t("modalTitleAdd")}
            size="lg"
        >
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
                            label={t("fields.startDate.label")}
                            placeholder={t("fields.startDate.placeholder")}
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
                            required
                        />

                        <DateInput
                            label={t("fields.endDate.label")}
                            placeholder={t("fields.endDate.placeholder")}
                            radius="xl"
                            valueFormat={dateFormat}
                            clearable
                            leftSection={<IconCalendar size={16} stroke={1.5} />}
                            leftSectionPointerEvents="none"
                            value={form.values.endDate}
                            onChange={(value) => {
                                form.setFieldValue('endDate', value ? new Date(value) : null);
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
                        <Button
                            type="submit"
                            loading={isLoading}
                        >
                            {editWork ? t("updateButton") : t("submitButton")}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}