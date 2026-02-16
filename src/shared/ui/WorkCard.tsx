"use client";

import { Paper, Stack, Group, Text, Badge, ActionIcon, Menu, Box, useMantineColorScheme } from "@mantine/core";
import { IconBriefcase, IconTrash, IconDots, IconEdit } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { Work } from "@/entities/work";

interface WorkCardProps {
    work: Work;
    onDelete?: (work: Work) => void;
    onUpdate?: (work: Work) => void;
}

export default function WorkCard({ work, onDelete, onUpdate }: WorkCardProps) {
    const t = useTranslations("work");
    const locale = useLocale();
    const { colorScheme } = useMantineColorScheme();
    const theme = colorScheme === "dark" ? "dark" : "light";
    const showActions = onDelete || onUpdate;

    const formatDate = (date: Date | null) => {
        if (!date) return t("present");
        return new Date(date).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
        });
    };

    const isCurrent = work.endDate === null;

    return (
        <Box className={`glowWrapper glowWrapperSmall ${theme}`}>
            <Paper className={`glassCard ${theme}`} p="xl" radius="md" h="100%">
                <Stack gap="md" h="100%">
                    <Group gap="md" align="flex-start" justify="space-between" wrap="nowrap">
                        <Group gap="md" align="flex-start" style={{ flex: 1 }}>
                            <IconBriefcase size={28} style={{ flexShrink: 0 }} />
                            <Stack gap={6} style={{ flex: 1 }}>
                                <Group gap="xs" wrap="wrap">
                                    <Text fw={700} size="lg">{work.position}</Text>
                                    {isCurrent && (
                                        <Badge size="sm" variant="dot" color="green">
                                            {t("current")}
                                        </Badge>
                                    )}
                                </Group>
                                <Text size="md" c="dimmed" fw={500}>{work.company}</Text>
                            </Stack>
                        </Group>
                        <Group gap="xs" align="flex-start" wrap="nowrap">
                            <Text size="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                                {formatDate(work.startDate)} - {formatDate(work.endDate)}
                            </Text>
                            {showActions && (
                                <Menu shadow="md" width={200} position="bottom-end">
                                    <Menu.Target>
                                        <ActionIcon variant="subtle" color="gray" aria-label="Options">
                                            <IconDots size={18} />
                                        </ActionIcon>
                                    </Menu.Target>

                                    <Menu.Dropdown>
                                        {onUpdate && (
                                            <Menu.Item
                                                leftSection={<IconEdit size={16} />}
                                                onClick={() => onUpdate(work)}
                                            >
                                                {t("update")}
                                            </Menu.Item>
                                        )}
                                        {onDelete && (
                                            <Menu.Item
                                                leftSection={<IconTrash size={16} />}
                                                color="red"
                                                onClick={() => onDelete(work)}
                                            >
                                                {t("delete")}
                                            </Menu.Item>
                                        )}
                                    </Menu.Dropdown>
                                </Menu>
                            )}
                        </Group>
                    </Group>
                </Stack>
            </Paper>
        </Box>
    );
}