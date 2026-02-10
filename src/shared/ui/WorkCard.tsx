"use client";

import {Paper, Stack, Group, Text, Badge, ActionIcon, Menu, Card} from "@mantine/core";
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
        <Card shadow="sm" padding="md" radius="md" withBorder>
            <Stack gap="xs">
                <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" style={{ flex: 1 }}>
                        <IconBriefcase size={24} />
                        <Stack gap={2} style={{ flex: 1 }}>
                            <Group gap="xs">
                                <Text size="sm" fw={600}>
                                    {work.position}
                                </Text>
                                {isCurrent && (
                                    <Badge size="xs" variant="dot" color="green">
                                        {t("current")}
                                    </Badge>
                                )}
                            </Group>
                            <Text size="sm" c="dimmed">
                                {work.company}
                            </Text>
                            <Text size="xs" c="dimmed">
                                {formatDate(work.startDate)} - {formatDate(work.endDate)}
                            </Text>
                        </Stack>
                    </Group>
                    {showActions && (
                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                                <ActionIcon variant="subtle" color="gray">
                                    <IconDots size={16} />
                                </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                                {onUpdate && (
                                    <Menu.Item
                                        leftSection={<IconEdit size={14} />}
                                        onClick={() => onUpdate(work)}
                                    >
                                        {t("update")}
                                    </Menu.Item>
                                )}
                                {onDelete && (
                                    <Menu.Item
                                        leftSection={<IconTrash size={14} />}
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
            </Stack>
        </Card>
    );
}