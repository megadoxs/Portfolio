"use client";

import { ActionIcon, Card, Group, Text, Tooltip, Button, useMantineColorScheme } from "@mantine/core";
import { IconEdit, IconTrash, IconBrandGithub, IconCalendar, IconInfoCircle } from "@tabler/icons-react";
import { ProjectWithSkills } from "@/entities/project";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { SkillPill } from "@/shared/ui/SkillPill";
import ProjectDetailsModal from "@/pages/dashboard/projects/ui/ProjectDetailsModal";
import dayjs from "dayjs";

interface ProjectCardProps {
    project: ProjectWithSkills;
    onEdit?: (project: ProjectWithSkills) => void;
    onDelete?: (project: ProjectWithSkills) => void;
}

interface LanguageStats {
    [key: string]: number;
}

function formatMonth(dateString: string, locale: string): string {
    dayjs.locale(locale);
    return dayjs(dateString, "YYYY-MM").format("MMM YYYY");
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
    const [modalOpened, setModalOpened] = useState(false);

    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    const description = locale === "fr" ? project.description_fr : project.description_en;

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
    const maxVisibleSkills = 6;
    const hasMoreSkills = project.skills && project.skills.length > maxVisibleSkills;
    const visibleSkills = hasMoreSkills ? project.skills.slice(0, maxVisibleSkills - 1) : project.skills;

    return (
        <>
            <div className={`glowWrapper glowWrapperSmall ${theme} projectCardWrapper`} style={{ height: '100%', minWidth: '360px' }}>
                <Card
                    shadow="sm"
                    radius="lg"
                    withBorder
                    p="md"
                    className={`glassCard ${theme} projectCard`}
                    style={{ height: '100%' }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Group justify="space-between" align="flex-start" wrap="wrap" mb="sm" style={{ gap: '8px' }}>
                            <Text size="md" fw={700} lineClamp={2} style={{ flex: '1 1 auto', minWidth: '150px' }}>
                                {project.title}
                            </Text>
                            <Group gap={6} align="center" style={{ flexShrink: 0, flexWrap: 'wrap' }}>
                                <Text size="xs" className={`statusBadge ${getStatusClass(project.status)}`}>
                                    {t(`status.${project.status}`)}
                                </Text>
                                <Group gap={4} style={{ flexWrap: 'nowrap' }}>
                                    <IconCalendar size={13} color="var(--mantine-color-gray-5)" stroke={1.5} />
                                    <Text size="xs" c="gray.5" style={{ whiteSpace: "nowrap" }}>
                                        {dateRange}
                                    </Text>
                                </Group>
                            </Group>
                        </Group>

                        <Text size="sm" c="gray.6" lineClamp={2} style={{ minHeight: '2.8em' }} mb="sm">
                            {description}
                        </Text>

                        {topLanguages.length > 0 && (
                            <div style={{ marginBottom: '0.5rem' }}>
                                <Text size="xs" fw={600} c="gray.7" mb={6}>{t('languages')}</Text>
                                <Group gap={8} style={{ flexWrap: 'wrap' }}>
                                    {topLanguages.map((lang) => (
                                        <Group gap={4} key={lang.name} style={{ flexWrap: 'nowrap' }}>
                                            <div className={`languageDot ${getLanguageClass(lang.name)}`} />
                                            <Text size="xs" c="gray.6" style={{ whiteSpace: 'nowrap' }}>
                                                {lang.name} {lang.percentage}%
                                            </Text>
                                        </Group>
                                    ))}
                                </Group>
                            </div>
                        )}

                        {project.skills && project.skills.length > 0 && (
                            <div style={{ marginBottom: '0.5rem' }}>
                                <Text size="xs" fw={600} c="gray.7" mb={6}>{t('skills')}</Text>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '6px',
                                    maxHeight: '44px',
                                    overflow: 'hidden',
                                }}>
                                    {visibleSkills?.map((skill) => (
                                        <SkillPill key={skill.id} skill={skill} size="xs" />
                                    ))}
                                    {hasMoreSkills && (
                                        <Tooltip label={t('viewAll')} withArrow>
                                            <div
                                                onClick={() => setModalOpened(true)}
                                                style={{
                                                    cursor: 'pointer',
                                                    backgroundColor: 'var(--mantine-color-default)',
                                                    border: '1px solid var(--mantine-color-default-border)',
                                                    borderRadius: 'var(--mantine-radius-xl)',
                                                    padding: '2px 10px',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    height: '22px',
                                                    transition: 'background-color 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'var(--mantine-color-default-hover)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'var(--mantine-color-default)';
                                                }}
                                            >
                                                +{project.skills.length - visibleSkills.length}
                                            </div>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                        )}

                        <div style={{ flexGrow: 1 }} />

                        <Group justify="space-between" align="center" pt="xs" style={{ flexWrap: 'wrap', gap: '8px' }}>
                            <Group gap="xs" style={{ flexWrap: 'wrap' }}>
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
                                <Tooltip label={t('details')} withArrow>
                                    <ActionIcon variant="subtle" radius="md" size="sm" color="gray.6" onClick={() => setModalOpened(true)}>
                                        <IconInfoCircle size={16} stroke={1.5} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>

                            {showActions && (
                                <Group gap={4}>
                                    {onEdit && (
                                        <Tooltip label={t('edit')} withArrow position="bottom">
                                            <ActionIcon variant="subtle" radius="md" size="sm" color="gray.6" onClick={() => onEdit(project)}>
                                                <IconEdit size={15} stroke={1.5} />
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                    {onDelete && (
                                        <Tooltip label={t('delete')} withArrow position="bottom">
                                            <ActionIcon variant="subtle" radius="md" size="sm" color="red.5" onClick={() => onDelete(project)}>
                                                <IconTrash size={15} stroke={1.5} />
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                </Group>
                            )}
                        </Group>
                    </div>
                </Card>
            </div>

            <ProjectDetailsModal
                project={project}
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                topLanguages={topLanguages}
                dateRange={dateRange}
                getStatusClass={getStatusClass}
                getLanguageClass={getLanguageClass}
            />
        </>
    );
}