"use client";

import { Paper, Text, Group, ActionIcon, Menu, Stack, Box, useMantineColorScheme } from "@mantine/core";
import { IconTrash, IconDots, IconEdit, IconSchool, IconCertificate, IconBook } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { Education } from "@/entities/education";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import "dayjs/locale/en";

interface EducationCardProps {
    education: Education;
    onDelete?: (education: Education) => void;
    onEdit?: (education: Education) => void;
}

const getEducationIcon = (iconType: string) => {
    const icons = {
        university: IconSchool,
        college: IconCertificate,
        school: IconBook,
    };
    const Icon = icons[iconType as keyof typeof icons] || IconSchool;
    return <Icon size={28} />;
};

const formatMonthYear = (monthString: string, locale: string) => {
    dayjs.locale(locale);
    return dayjs(monthString, "YYYY-MM").format("MMM YYYY");
};

export default function EducationCard({ education, onDelete, onEdit }: EducationCardProps) {
    const t = useTranslations("education");
    const locale = useLocale();
    const { colorScheme } = useMantineColorScheme();
    const theme = colorScheme === "dark" ? "dark" : "light";
    const showActions = onDelete || onEdit;

    const degree = locale === "fr" ? education.degree_fr : education.degree_en;
    const fieldOfStudy = locale === "fr" ? education.fieldOfStudy_fr : education.fieldOfStudy_en;

    return (
        <Box className={`glowWrapper glowWrapperSmall ${theme}`} style={{ minWidth: '450px' }}>
            <Paper className={`glassCard ${theme}`} p="xl" radius="md" h="100%">
                <Stack gap="md">
                    <Group gap="md" align="flex-start" justify="space-between" wrap="wrap" style={{ gap: '12px' }}>
                        <Group gap="md" align="flex-start" style={{ flex: '1 1 auto', minWidth: '200px' }}>
                            <Box style={{ flexShrink: 0 }}>
                                {getEducationIcon(education.iconType)}
                            </Box>
                            <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
                                <Text fw={700} size="lg" lineClamp={2}>{education.institution}</Text>
                                {degree && (
                                    <Text size="md" c="dimmed" lineClamp={1} fw={500}>{degree}</Text>
                                )}
                                {fieldOfStudy && (
                                    <Text size="sm" c="dimmed" lineClamp={1}>{fieldOfStudy}</Text>
                                )}
                            </Stack>
                        </Group>

                        <Group gap="xs" align="flex-start" wrap="nowrap" style={{ flexShrink: 0 }}>
                            <Text size="sm" c="dimmed">
                                {formatMonthYear(education.startDate, locale)} - {formatMonthYear(education.endDate, locale)}
                            </Text>
                            {showActions && (
                                <Menu shadow="md" width={200} position="bottom-end">
                                    <Menu.Target>
                                        <ActionIcon variant="subtle" color="gray" aria-label="Options">
                                            <IconDots size={18} />
                                        </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        {onEdit && (
                                            <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => onEdit(education)}>
                                                {t("editButton")}
                                            </Menu.Item>
                                        )}
                                        {onDelete && (
                                            <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={() => onDelete(education)}>
                                                {t("deleteButton")}
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