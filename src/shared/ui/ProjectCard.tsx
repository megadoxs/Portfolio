"use client";

import { ActionIcon, Card, Group, Stack, Text, Tooltip, Badge, Button } from "@mantine/core";
import { IconEdit, IconTrash, IconBrandGithub, IconCalendar } from "@tabler/icons-react";
import { ProjectWithSkills } from "@/entities/project";
import {useLocale, useTranslations} from "next-intl";
import { useEffect, useState } from "react";

interface ProjectCardProps {
    project: ProjectWithSkills;
    onEdit?: (project: ProjectWithSkills) => void;
    onDelete?: (project: ProjectWithSkills) => void;
}

interface LanguageStats {
    [key: string]: number;
}

function formatMonth(date: string | Date, locale: string): string {
    return new Date(date).toLocaleDateString(locale, {
        month: "short",
        year: "numeric",
    });
}

// Status color mapping
const getStatusColor = (status: string): string => {
    const statusColors: { [key: string]: string } = {
        'ACTIVE': '#22c55e',      // Green
        'INACTIVE': '#94a3b8',    // Gray
        'COMPLETED': '#3b82f6',   // Blue
    };
    return statusColors[status] || '#94a3b8';
};

// Language color mapping (GitHub-style colors)
const getLanguageColor = (language: string): string => {
    const languageColors: { [key: string]: string } = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#3178c6',
        'Python': '#3572A5',
        'Java': '#b07219',
        'C#': '#178600',
        'C++': '#f34b7d',
        'C': '#555555',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Ruby': '#701516',
        'PHP': '#4F5D95',
        'Swift': '#F05138',
        'Kotlin': '#A97BFF',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'HLSL': '#aace60',
        'ShaderLab': '#222c37',
        'Shell': '#89e051',
        'Dart': '#00B4AB',
        'R': '#198CE7',
        'Scala': '#c22d40',
        'Vue': '#41b883',
    };
    return languageColors[language] || '#858585';
};

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
    const t = useTranslations("projects.projectCard");
    const locale = useLocale();
    const [languages, setLanguages] = useState<LanguageStats | null>(null);

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const url = new URL(project.githubUrl);
                const pathParts = url.pathname.split('/').filter(part => part.length > 0);

                if (pathParts.length < 2) return;

                const [owner, repo] = pathParts;
                const repoName = repo.replace(/\.git$/, '');

                const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/languages`);

                if (response.ok) {
                    const data = await response.json();
                    setLanguages(data);
                }
            } catch (error) {
                console.error("Failed to fetch language stats:", error);
            }
        };

        fetchLanguages();
    }, [project.githubUrl]);

    // Get top 3 languages by percentage
    const getTopLanguages = () => {
        if (!languages) return [];

        const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);

        return Object.entries(languages)
            .map(([name, bytes]) => ({
                name,
                percentage: ((bytes / total) * 100).toFixed(1),
            }))
            .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))
            .slice(0, 3);
    };

    const topLanguages = getTopLanguages();
    const startLabel = formatMonth(project.startDate, locale);
    const endLabel = project.endDate ? formatMonth(project.endDate, locale) : t('present');
    const dateRange = `${startLabel} – ${endLabel}`;

    // Check if any action buttons should be shown
    const showActions = onEdit || onDelete;

    return (
        <Card
            shadow="sm"
            radius="lg"
            withBorder
            p="md"
            style={{
                transition: "box-shadow 150ms ease, transform 150ms ease",
                cursor: "default",
                height: "260px",
                width: "100%",
                maxWidth: "400px",
                display: "flex",
                flexDirection: "column",
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 4px 16px rgba(0,0,0,0.1)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
            }}
        >
            <Stack gap="sm" justify="space-between" style={{ flex: 1 }}>
                {/* Title + status + date range on the same row */}
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Text size="md" fw={700} c="gray.8" lineClamp={2} style={{ flex: 1, minWidth: 0 }}>
                        {project.title}
                    </Text>
                    <Group gap={6} align="center" style={{ flexShrink: 0, marginLeft: 8 }}>
                        <Text
                            size="xs"
                            fw={600}
                            style={{
                                color: getStatusColor(project.status),
                                whiteSpace: "nowrap"
                            }}
                        >
                            {project.status}
                        </Text>
                        <IconCalendar size={13} color="var(--mantine-color-gray-5)" stroke={1.5} />
                        <Text size="xs" c="gray.5" style={{ whiteSpace: "nowrap" }}>
                            {dateRange}
                        </Text>
                    </Group>
                </Group>

                {/* Description */}
                <Text size="sm" c="gray.6" lineClamp={2}>
                    {project.description}
                </Text>

                {/* Language Stats */}
                {topLanguages.length > 0 && (
                    <Stack gap={6}>
                        <Text size="xs" fw={600} c="gray.7">
                            Languages
                        </Text>
                        <Group gap={8}>
                            {topLanguages.map((lang) => (
                                <Group gap={4} key={lang.name}>
                                    <div
                                        style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: '50%',
                                            backgroundColor: getLanguageColor(lang.name),
                                        }}
                                    />
                                    <Text size="xs" c="gray.6">
                                        {lang.name} {lang.percentage}%
                                    </Text>
                                </Group>
                            ))}
                        </Group>
                    </Stack>
                )}

                {/* Skills */}
                {project.skills && project.skills.length > 0 && (
                    <Stack gap={6}>
                        <Text size="xs" fw={600} c="gray.7">
                            Skills
                        </Text>
                        <Group gap={6}>
                            {project.skills.map((skill) => (
                                <Badge
                                    key={skill.id}
                                    size="sm"
                                    variant="dot"
                                    radius="sm"
                                    color="gray"
                                    styles={{
                                        root: {
                                            textTransform: 'none',
                                        }
                                    }}
                                >
                                    {skill.name}
                                </Badge>
                            ))}
                        </Group>
                    </Stack>
                )}

                {/* Footer: GitHub button and actions */}
                <Group justify="space-between" align="center" mt="auto" pt="xs">
                    <Button
                        component="a"
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="xs"
                        variant="light"
                        leftSection={<IconBrandGithub size={16} />}
                        radius="md"
                    >
                        View on GitHub
                    </Button>

                    {showActions && (
                        <Group gap={4}>
                            {onEdit && (
                                <Tooltip label={t('edit')} withArrow position="bottom">
                                    <ActionIcon
                                        variant="subtle"
                                        radius="md"
                                        size="sm"
                                        color="gray.6"
                                        onClick={() => onEdit(project)}
                                    >
                                        <IconEdit size={15} stroke={1.5} />
                                    </ActionIcon>
                                </Tooltip>
                            )}

                            {onDelete && (
                                <Tooltip label={t('delete')} withArrow position="bottom">
                                    <ActionIcon
                                        variant="subtle"
                                        radius="md"
                                        size="sm"
                                        color="red.5"
                                        onClick={() => onDelete(project)}
                                    >
                                        <IconTrash size={15} stroke={1.5} />
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </Group>
                    )}
                </Group>
            </Stack>
        </Card>
    );
}