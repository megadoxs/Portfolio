import { Button, Group, Select, Stack, Switch } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import { UseFormReturnType } from "@mantine/form";
import { ProjectRequestModel, ProjectStatus } from "@/entities/project";

interface SettingsStepProps {
    form: UseFormReturnType<ProjectRequestModel & { active: boolean }>;
    isLoading: boolean;
    locale: string;
    t: (key: string) => string;
    onBack: () => void;
    onCancel: () => void;
    onSubmit: () => void;
}

export default function SettingsStep({
                                         form,
                                         isLoading,
                                         locale,
                                         t,
                                         onBack,
                                         onCancel,
                                         onSubmit,
                                     }: SettingsStepProps) {
    const statusOptions = [
        { value: ProjectStatus.ACTIVE, label: t("status.active") },
        { value: ProjectStatus.INACTIVE, label: t("status.inactive") },
        { value: ProjectStatus.COMPLETED, label: t("status.completed") },
    ];

    const dateFormat = locale === 'fr' ? 'D MMMM YYYY' : 'MMMM D, YYYY';

    return (
        <Stack gap="md">
            <Group grow gap="md">
                <DateInput
                    label={t("fields.startDate.label")}
                    placeholder={t("fields.startDate.placeholder")}
                    radius="xl"
                    valueFormat={dateFormat}
                    leftSection={<IconCalendar size={16} stroke={1.5} />}
                    leftSectionPointerEvents="none"
                    {...form.getInputProps("startDate")}
                    styles={{
                        input: { border: "1px solid var(--mantine-color-gray-3)" },
                    }}
                    locale={locale}
                />

                <DateInput
                    label={t("fields.endDate.label")}
                    placeholder={form.values.status === ProjectStatus.COMPLETED ? t("fields.endDate.placeholderCompleted") : t("fields.endDate.placeholder")}
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

            <Select
                label={t("fields.status.label")}
                placeholder={t("fields.status.placeholder")}
                data={statusOptions}
                {...form.getInputProps("status")}
                radius="xl"
                styles={{
                    input: { border: "1px solid var(--mantine-color-gray-3)" },
                }}
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
                    {t("buttons.create")}
                </Button>
            </Group>
        </Stack>
    );
}