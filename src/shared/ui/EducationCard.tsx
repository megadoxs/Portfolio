"use client";

import { Card, Text, Group, ActionIcon, Menu, Stack } from "@mantine/core";
import {IconTrash, IconDots, IconEdit, IconSchool, IconCertificate, IconBook} from "@tabler/icons-react";
import {useLocale, useTranslations} from "next-intl";
import { Education } from "@/entities/education";

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
    return <Icon size={32} />;
};

const formatDate = (date: Date, local: string) => {
    return new Date(date).toLocaleDateString(local, { month: 'short', year: 'numeric' });
};

export default function EducationCard({ education, onDelete, onEdit }: EducationCardProps) {
    const t = useTranslations("education");
    const locale = useLocale();
    const showActions = onDelete || onEdit;

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="sm">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Group gap="md" wrap="nowrap" align="flex-start" style={{ flex: 1 }}>
                        {getEducationIcon(education.iconType)}
                        <Stack gap={4} style={{ flex: 1 }}>
                            <Text fw={600} size="md" lineClamp={1}>
                                {education.institution}
                            </Text>
                            {education.degree && (
                                <Text size="sm" c="dimmed" lineClamp={1}>
                                    {education.degree}
                                </Text>
                            )}
                            {education.fieldOfStudy && (
                                <Text size="sm" c="dimmed" lineClamp={1}>
                                    {education.fieldOfStudy}
                                </Text>
                            )}
                        </Stack>
                    </Group>

                    <Group gap="xs" wrap="nowrap" align="flex-start">
                        <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                            {formatDate(education.startDate, locale)} - {formatDate(education.endDate, locale)}
                        </Text>
                        {showActions && (
                            <Menu shadow="md" width={200} position="bottom-end">
                                <Menu.Target>
                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        aria-label="Options"
                                    >
                                        <IconDots size={18} />
                                    </ActionIcon>
                                </Menu.Target>

                                <Menu.Dropdown>
                                    {onEdit && (
                                        <Menu.Item
                                            leftSection={<IconEdit size={16} />}
                                            onClick={() => onEdit(education)}
                                        >
                                            {t("editButton")}
                                        </Menu.Item>
                                    )}
                                    {onDelete && (
                                        <Menu.Item
                                            color="red"
                                            leftSection={<IconTrash size={16} />}
                                            onClick={() => onDelete(education)}
                                        >
                                            {t("deleteButton")}
                                        </Menu.Item>
                                    )}
                                </Menu.Dropdown>
                            </Menu>
                        )}
                    </Group>
                </Group>
            </Stack>
        </Card>
    );
}