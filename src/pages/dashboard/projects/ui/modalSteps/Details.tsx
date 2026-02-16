import { Button, Group, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { UseFormReturnType } from "@mantine/form";
import { ProjectRequestModel } from "@/entities/project";

interface GitHubRepoDetails {
    name: string;
    description: string;
    full_name: string;
}

interface DetailsStepProps {
    form: UseFormReturnType<ProjectRequestModel & { active: boolean }>;
    repoDetails: GitHubRepoDetails | null;
    t: (key: string, values?: Record<string, string | number | Date>) => string;
    onNext: () => void;
    onBack: () => void;
    onCancel: () => void;
    showBackButton?: boolean;
}

export default function DetailsStep({
                                        form,
                                        repoDetails,
                                        t,
                                        onNext,
                                        onBack,
                                        onCancel,
                                        showBackButton = true,
                                    }: DetailsStepProps) {
    return (
        <Stack gap="md">
            {repoDetails && (
                <Group gap="xs" mb="xs">
                    <IconCheck size={18} stroke={1.5} style={{ color: 'var(--mantine-color-green-6)' }} />
                    <Text size="sm" c="dimmed">
                        {t("messages.repoDetailsLoaded", { repo: repoDetails.full_name })}
                    </Text>
                </Group>
            )}

            <TextInput
                label={t("fields.title.label")}
                placeholder={t("fields.title.placeholder")}
                radius="xl"
                {...form.getInputProps("title")}
                styles={{
                    input: { border: "1px solid var(--mantine-color-gray-3)" },
                }}
            />

            <Textarea
                label={t("fields.description.label")}
                placeholder={t("fields.description.placeholder")}
                radius="xl"
                autosize
                minRows={3}
                maxRows={6}
                {...form.getInputProps("description")}
                styles={{
                    input: { border: "1px solid var(--mantine-color-gray-3)" },
                }}
            />

            <Group justify="flex-end" gap="sm" mt="sm">
                {showBackButton && (
                    <Button
                        variant="subtle"
                        radius="xl"
                        onClick={onBack}
                    >
                        {t("buttons.back")}
                    </Button>
                )}
                <Button
                    variant="subtle"
                    radius="xl"
                    onClick={onCancel}
                >
                    {t("buttons.cancel")}
                </Button>
                <Button
                    variant="filled"
                    radius="xl"
                    onClick={onNext}
                >
                    {t("buttons.next")}
                </Button>
            </Group>
        </Stack>
    );
}