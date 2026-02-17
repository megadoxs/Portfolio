import { Button, Group, Select, Stack, Switch } from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import { UseFormReturnType } from "@mantine/form";
import {ProjectFormValues, ProjectStatus} from "@/entities/project";
import dayjs from "dayjs";
import { useEffect } from "react";

interface SettingsStepProps {
    form: UseFormReturnType<ProjectFormValues & { active: boolean }>;
    isLoading: boolean;
    locale: string;
    t: (key: string) => string;
    onBack: () => void;
    onCancel: () => void;
    onSubmit: () => void;
    mode: 'add' | 'update';
}

const stringToDate = (dateString: string | null | undefined): Date | null => {
    if (!dateString || dateString === "") return null;
    const parsed = dayjs(dateString, 'YYYY-MM');
    return parsed.isValid() ? parsed.toDate() : null;
};

export default function SettingsStep({
                                         form,
                                         isLoading,
                                         locale,
                                         t,
                                         onBack,
                                         onCancel,
                                         onSubmit,
                                         mode,
                                     }: SettingsStepProps) {
    const statusOptions = [
        { value: ProjectStatus.ACTIVE, label: t("status.active") },
        { value: ProjectStatus.INACTIVE, label: t("status.inactive") },
        { value: ProjectStatus.COMPLETED, label: t("status.completed") },
    ];

    const dateFormat = locale === 'fr' ? 'MMMM YYYY' : 'MMMM YYYY';

    useEffect(() => {
        if (form.values.startDate && form.values.endDate) {
            if (dayjs(form.values.endDate, 'YYYY-MM').isBefore(dayjs(form.values.startDate, 'YYYY-MM'))) {
                form.setFieldValue('endDate', null);
            }
        }
    }, [form.values.startDate]);

    useEffect(() => {
        if (form.values.status !== ProjectStatus.COMPLETED) {
            if (form.values.endDate) {
                form.setFieldValue('endDate', null);
            }
        }
    }, [form.values.status]);

    const startDateValue = stringToDate(form.values.startDate);
    const endDateValue = stringToDate(form.values.endDate);
    const minEndDate: Date | undefined = startDateValue ? startDateValue : undefined;

    return (
        <Stack gap="md">
            <Group grow gap="md">
                <MonthPickerInput
                    label={t("fields.startDate.label")}
                    placeholder={t("fields.startDate.placeholder")}
                    radius="xl"
                    valueFormat={dateFormat}
                    leftSection={<IconCalendar size={16} stroke={1.5} />}
                    leftSectionPointerEvents="none"
                    value={startDateValue}
                    onChange={(date) => {
                        if (date) {
                            form.setFieldValue('startDate', dayjs(date).format('YYYY-MM'));
                        } else {
                            form.setFieldValue('startDate', '');
                        }
                    }}
                    error={form.errors.startDate}
                    styles={{
                        input: { border: "1px solid var(--mantine-color-gray-3)" },
                    }}
                    locale={locale}
                    maxDate={dayjs().endOf('month').toDate()}
                    required
                />

                <MonthPickerInput
                    label={t("fields.endDate.label")}
                    placeholder={form.values.status === ProjectStatus.COMPLETED ? t("fields.endDate.placeholderCompleted") : t("fields.endDate.placeholder")}
                    radius="xl"
                    valueFormat={dateFormat}
                    clearable
                    leftSection={<IconCalendar size={16} stroke={1.5} />}
                    leftSectionPointerEvents="none"
                    value={endDateValue}
                    onChange={(date) => {
                        if (date) {
                            form.setFieldValue('endDate', dayjs(date).format('YYYY-MM'));
                        } else {
                            form.setFieldValue('endDate', null);
                        }
                    }}
                    error={form.errors.endDate}
                    styles={{
                        input: { border: "1px solid var(--mantine-color-gray-3)" },
                    }}
                    locale={locale}
                    minDate={minEndDate}
                    maxDate={dayjs().endOf('month').toDate()}
                    disabled={form.values.status !== ProjectStatus.COMPLETED}
                    required={form.values.status === ProjectStatus.COMPLETED}
                />
            </Group>

            <Select
                label={t("fields.status.label")}
                placeholder={t("fields.status.placeholder")}
                data={statusOptions}
                value={form.values.status}
                onChange={(value) => {
                    if (value) {
                        form.setFieldValue('status', value as ProjectStatus);
                    }
                }}
                error={form.errors.status}
                radius="xl"
                styles={{
                    input: { border: "1px solid var(--mantine-color-gray-3)" },
                }}
                allowDeselect={false}
                required
            />

            <Switch
                label={t("fields.active.label")}
                description={form.values.active ? t("fields.active.descriptionActive") : t("fields.active.descriptionInactive")}
                {...form.getInputProps("active", { type: "checkbox" })}
            />

            <Group justify="flex-end" gap="sm" mt="md">
                <Button
                    variant="subtle"
                    radius="xl"
                    onClick={onBack}
                    disabled={isLoading}
                >
                    {t("buttons.back")}
                </Button>
                <Button
                    variant="subtle"
                    radius="xl"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    {t("buttons.cancel")}
                </Button>
                <Button
                    type="submit"
                    variant="filled"
                    radius="xl"
                    loading={isLoading}
                    onClick={onSubmit}
                >
                    {mode === 'update' ? t("buttons.update") : t("buttons.create")}
                </Button>
            </Group>
        </Stack>
    );
}