"use client";

import { ActionIcon, Card, Group, Stack, Text, Tooltip, Button, useMantineColorScheme } from "@mantine/core";
import { IconEdit, IconTrash, IconBrandGithub, IconCalendar } from "@tabler/icons-react";
import { ProjectWithSkills } from "@/entities/project";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { SkillPill } from "@/shared/ui/SkillPill";

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

const getStatusClass = (status: string): string => {
    const statusMap: { [key: string]: string } = {
        'ACTIVE': 'active',
        'INACTIVE': 'inactive',
        'COMPLETED': 'completed',
    };
    return statusMap[status] || 'inactive';
};

const getLanguageClass = (language: string): string => {
    const languageMap: { [key: string]: string } = {
        'JavaScript': 'javascript',
        'TypeScript': 'typescript',
        'Python': 'python',
        'Java': 'java',
        'C#': 'csharp',
        'C++': 'cpp',
        'C': 'c',
        'Go': 'go',
        'Rust': 'rust',
        'Ruby': 'ruby',
        'PHP': 'php',
        'Swift': 'swift',
        'Kotlin': 'kotlin',
        'HTML': 'html',
        'CSS': 'css',
        'HLSL': 'hlsl',
        'ShaderLab': 'shaderlab',
        'Shell': 'shell',
        'Dart': 'dart',
        'R': 'r',
        'Scala': 'scala',
        'Vue': 'vue',
    };
    return languageMap[language] || 'default';
};

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
    const t = useTranslations("projects.projectCard");
    const locale = useLocale();
    const { colorScheme } = useMantineColorScheme();
    const [languages, setLanguages] = useState<LanguageStats | null>(null);

    const theme = colorScheme === 'dark' ? 'dark' : 'light';

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

    const showActions = onEdit || onDelete;

    return (
        <div className={`glowWrapper glowWrapperSmall ${theme} projectCardWrapper`}>
            <Card
                shadow="sm"
                radius="lg"
                withBorder
                p="md"
                className={`glassCard ${theme} projectCard`}
            >
                <Stack gap="sm" justify="space-between" style={{ flex: 1 }}>
                    {/* Title + status + date range */}
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Text size="md" fw={700} c="gray.8" lineClamp={2} style={{ flex: 1, minWidth: 0 }}>
                            {project.title}
                        </Text>
                        <Group gap={6} align="center" style={{ flexShrink: 0, marginLeft: 8 }}>
                            <Text size="xs" className={`statusBadge ${getStatusClass(project.status)}`}>
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
                                {t('languages')}
                            </Text>
                            <Group gap={8}>
                                {topLanguages.map((lang) => (
                                    <Group gap={4} key={lang.name}>
                                        <div className={`languageDot ${getLanguageClass(lang.name)}`} />
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
                                {t('skills')}
                            </Text>
                            <Group gap={6}>
                                {project.skills.map((skill) => (
                                    <SkillPill key={skill.id} skill={skill} size="xs" />
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
                            variant="default"
                            leftSection={<IconBrandGithub size={16} />}
                            radius="md"
                            className={`glassButton ${theme}`}
                        >
                            {t('github')}
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
        </div>
    );
}