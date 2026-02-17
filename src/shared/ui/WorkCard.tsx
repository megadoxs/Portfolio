"use client";

import { Paper, Stack, Group, Text, Badge, ActionIcon, Menu, Box, useMantineColorScheme } from "@mantine/core";
import { IconBriefcase, IconTrash, IconDots, IconEdit } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { Work } from "@/entities/work";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import "dayjs/locale/en";

interface WorkCardProps {
    work: Work;
    onDelete?: (work: Work) => void;
    onUpdate?: (work: Work) => void;
}

const formatMonthYear = (monthString: string, locale: string) => {
    dayjs.locale(locale);
    const date = dayjs(monthString, "YYYY-MM");
    return date.format("MMM YYYY");
};

export default function WorkCard({ work, onDelete, onUpdate }: WorkCardProps) {
    const t = useTranslations("work");
    const locale = useLocale();
    const { colorScheme } = useMantineColorScheme();
    const theme = colorScheme === "dark" ? "dark" : "light";
    const showActions = onDelete || onUpdate;

    const formatDate = (date: string | null) => {
        if (!date) return t("present");
        return formatMonthYear(date, locale);
    };

    const isCurrent = work.endDate === null;
    const position = locale === "fr" ? work.position_fr : work.position_en;

    return (
        <Box className={`glowWrapper glowWrapperSmall ${theme}`} style={{ minWidth: '520px' }}>
            <Paper className={`glassCard ${theme}`} p="xl" radius="md" h="100%">
                <Stack gap="md" h="100%">
                    <Group gap="md" align="flex-start" justify="space-between" wrap="wrap" style={{ gap: '12px' }}>
                        <Group gap="md" align="flex-start" style={{ flex: '1 1 auto', minWidth: '200px' }}>
                            <Box style={{ flexShrink: 0 }}>
                                <IconBriefcase size={28} />
                            </Box>
                            <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
                                <Group gap="xs" wrap="wrap">
                                    <Text fw={700} size="lg">{position}</Text>
                                    {isCurrent && (
                                        <Badge size="sm" variant="dot" color="green">
                                            {t("current")}
                                        </Badge>
                                    )}
                                </Group>
                                <Text size="md" c="dimmed" fw={500}>{work.company}</Text>
                            </Stack>
                        </Group>
                        <Group gap="xs" align="flex-start" wrap="nowrap" style={{ flexShrink: 0 }}>
                            <Text size="sm" c="dimmed">
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