"use client";

import { Paper, Stack, Group, Text, Badge, ActionIcon, Menu, Box, useMantineColorScheme } from "@mantine/core";
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
    const { colorScheme } = useMantineColorScheme();
    const theme = colorScheme === "dark" ? "dark" : "light";

    return (
        <Box className={`glowWrapper glowWrapperSmall ${theme}`}>
            <Paper className={`glassCard ${theme}`} p="xl" radius="md">
                <Stack gap="md">
                    <Group justify="space-between" wrap="nowrap" align="flex-start">
                        <Group gap="md" align="flex-start" style={{ flex: 1 }}>
                            <IconFileText size={28} style={{ flexShrink: 0 }} />
                            <Stack gap={6} style={{ flex: 1 }}>
                                <Group gap="xs" wrap="wrap">
                                    <Text fw={700} size="lg">
                                        {resume.name}
                                    </Text>
                                    <Badge size="sm" variant="dot" color={resume.active ? "green" : "gray"}>
                                        {resume.active ? t("current") : t("archived")}
                                    </Badge>
                                </Group>
                                <Text size="sm" c="dimmed">
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
                        <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <ActionIcon variant="subtle" color="gray" aria-label="Options">
                                    <IconDots size={18} />
                                </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item
                                    leftSection={<IconExternalLink size={16} />}
                                    component="a"
                                    href={resume.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {t("openResume")}
                                </Menu.Item>
                                {!resume.active && (
                                    <Menu.Item
                                        leftSection={<IconCheck size={16} />}
                                        onClick={() => onActivate(resume.id)}
                                    >
                                        {t("activate")}
                                    </Menu.Item>
                                )}
                                <Menu.Item
                                    leftSection={<IconTrash size={16} />}
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
        </Box>
    );
}