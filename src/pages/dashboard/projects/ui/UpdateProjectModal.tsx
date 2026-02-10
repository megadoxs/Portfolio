"use client";

import {Button, Group, Modal, Stack, Textarea, TextInput, Select, Switch} from "@mantine/core";
import {DateInput} from "@mantine/dates";
import {IconCalendar} from "@tabler/icons-react";
import {useForm} from "@mantine/form";
import {useEffect} from "react";
import {Project, ProjectRequestModel, ProjectStatus} from "@/entities/project";
import {useTranslations} from "next-intl";

interface UpdateProjectModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: ProjectRequestModel) => Promise<void>;
    project: Project | null;
    isLoading?: boolean;
}

export default function UpdateProjectModal({
                                               opened,
                                               onClose,
                                               onSubmit,
                                               project,
                                               isLoading = false
                                           }: UpdateProjectModalProps) {
    const t = useTranslations("project.updateModal");

    const form = useForm<ProjectRequestModel & { active: boolean }>({
        initialValues: {
            title: "",
            description: "",
            githubUrl: "",
            status: ProjectStatus.ACTIVE,
            active: true,
            startDate: new Date(),
            endDate: null,
        },
        validate: {
            title: (value) => (!value.trim() ? t("validation.titleRequired") : null),
            description: (value) => (!value.trim() ? t("validation.descriptionRequired") : null),
            githubUrl: (value) => {
                if (!value.trim()) return t("validation.githubUrlRequired");

                try {
                    const url = new URL(value);

                    if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') {
                        return t("validation.validGithubUrl");
                    }

                    const pathParts = url.pathname.split('/').filter(part => part.length > 0);

                    if (pathParts.length < 2) {
                        return t("validation.validRepoUrl");
                    }

                    const [username, repo] = pathParts;
                    if (!username || !repo) {
                        return t("validation.validRepoUrl");
                    }

                    return null;
                } catch {
                    return t("validation.validUrl");
                }
            },
            startDate: (value) => (!value ? t("validation.startDateRequired") : null),
            endDate: (value, values) => {
                if (!value) {
                    // If status is COMPLETED, endDate is required
                    if (values.status === ProjectStatus.COMPLETED) {
                        return t("validation.endDateRequiredCompleted");
                    }
                    return null;
                }
                if (values.startDate && value < values.startDate) {
                    return t("validation.endDateBeforeStart");
                }
                return null;
            },
        },
    });

    useEffect(() => {
        if (opened && project) {
            form.setValues({
                title: project.title,
                description: project.description,
                githubUrl: project.githubUrl,
                startDate: project.startDate,
                endDate: project.endDate,
                status: project.status,
                active: project.active,
            });
        }
    }, [opened, project]);

    const handleSubmit = async () => {
        const validationResult = form.validate();
        if (validationResult.hasErrors) {
            return;
        }

        await onSubmit(form.values);
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    const statusOptions = [
        { value: ProjectStatus.ACTIVE, label: t("status.active") },
        { value: ProjectStatus.INACTIVE, label: t("status.inactive") },
        { value: ProjectStatus.COMPLETED, label: t("status.completed") },
    ];

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={t("title")}
            centered
            size="xl"
            radius="lg"
            withCloseButton={!isLoading}
            closeOnEscape={!isLoading}
        >
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}>
                <Stack gap="md">
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

                    <TextInput
                        label={t("fields.githubUrl.label")}
                        placeholder={t("fields.githubUrl.placeholder")}
                        radius="xl"
                        {...form.getInputProps("githubUrl")}
                        styles={{
                            input: { border: "1px solid var(--mantine-color-gray-3)" },
                        }}
                    />

                    <Group grow gap="md">
                        <DateInput
                            label={t("fields.startDate.label")}
                            placeholder={t("fields.startDate.placeholder")}
                            radius="xl"
                            valueFormat="MMM DD, YYYY"
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
                        />

                        <DateInput
                            label={t("fields.endDate.label")}
                            placeholder={form.values.status === ProjectStatus.COMPLETED ? t("fields.endDate.placeholderCompleted") : t("fields.endDate.placeholder")}
                            radius="xl"
                            valueFormat="MMM DD, YYYY"
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
                        />
                    </Group>

                    <Select
                        label={t("fields.status.label")}
                        placeholder={t("fields.status.placeholder")}
                        data={statusOptions}
                        value={form.values.status}
                        onChange={(value) => form.setFieldValue('status', value as ProjectStatus)}
                        radius="xl"
                        styles={{
                            input: { border: "1px solid var(--mantine-color-gray-3)" },
                        }}
                    />

                    <Switch
                        label={t("fields.active.label")}
                        description={form.values.active ? t("fields.active.descriptionActive") : t("fields.active.descriptionInactive")}
                        checked={form.values.active}
                        onChange={(event) => form.setFieldValue('active', event.currentTarget.checked)}
                    />

                    <Group justify="flex-end" gap="sm" mt="md">
                        <Button
                            variant="subtle"
                            radius="xl"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            {t("buttons.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            variant="filled"
                            radius="xl"
                            loading={isLoading}
                        >
                            {t("buttons.save")}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}