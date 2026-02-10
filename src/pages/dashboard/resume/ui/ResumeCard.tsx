"use client";

import { Paper, Stack, Group, Text, Badge, ActionIcon, Menu } from "@mantine/core";
import { IconFileText, IconTrash, IconExternalLink, IconDots, IconCheck } from "@tabler/icons-react";
import {useLocale, useTranslations} from "next-intl";
import { Resume } from "@/entities/resume";

interface ResumeCardProps {
    resume: Resume;
    onDelete: (resume: Resume) => void;
    onActivate: (resumeId: string) => void;
}

export default function ResumeCard({ resume, onDelete, onActivate }: ResumeCardProps) {
    const t = useTranslations("resumes");
    const local = useLocale();

    return (
        <Paper p="md" radius="md" withBorder>
            <Stack gap="xs">
                <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm">
                        <IconFileText size={24} />
                        <Stack gap={2}>
                            <Group gap="xs">
                                <Text size="sm" fw={600}>
                                    {resume.name}
                                </Text>
                                <Badge size="xs" variant="dot" color={resume.active ? "green" : "gray"}>
                                    {resume.active ? t("current") : t("archived")}
                                </Badge>
                            </Group>
                            <Text size="xs" c="dimmed">
                                {new Date(resume.createdAt).toLocaleDateString(local, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Text>
                        </Stack>
                    </Group>
                    <Menu shadow="md" width={200}>
                        <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                                <IconDots size={16} />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconExternalLink size={14} />}
                                component="a"
                                href={resume.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {t("openResume")}
                            </Menu.Item>
                            {!resume.active && (
                                <Menu.Item
                                    leftSection={<IconCheck size={14} />}
                                    onClick={() => onActivate(resume.id)}
                                >
                                    {t("activate")}
                                </Menu.Item>
                            )}
                            <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={() => onDelete(resume)}
                            >
                                {t("delete")}
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Stack>
        </Paper>
    );
}