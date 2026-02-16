"use client";

import { Modal, Card, Stack, Group, Text, Button, useMantineColorScheme, Box } from "@mantine/core";
import { IconBrandGithub, IconCalendar } from "@tabler/icons-react";
import { ProjectWithSkills } from "@/entities/project";
import { useTranslations } from "next-intl";
import { SkillPill } from "@/shared/ui/SkillPill";

interface ProjectDetailsModalProps {
    project: ProjectWithSkills;
    opened: boolean;
    onClose: () => void;
    topLanguages: { name: string; percentage: string }[];
    dateRange: string;
    getStatusClass: (status: string) => string;
    getLanguageClass: (language: string) => string;
}

export default function ProjectDetailsModal({
                                                project,
                                                opened,
                                                onClose,
                                                topLanguages,
                                                dateRange,
                                                getStatusClass,
                                                getLanguageClass,
                                            }: ProjectDetailsModalProps) {
    const t = useTranslations("projects.projectCard");
    const { colorScheme } = useMantineColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={<Text fw={700} size="lg">{project.title}</Text>}
            size="lg"
            centered
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
            styles={{
                content: {
                    backgroundColor: 'transparent',
                },
                header: {
                    backgroundColor: 'transparent',
                },
                body: {
                    padding: 0,
                    overflow: 'hidden',
                },
            }}
        >
            <Box className={`glowWrapper ${theme}`}>
                <Card className={`glassCard ${theme}`} p="xl" radius="md">
                    <Stack gap="md">
                        <Box>
                            <Group gap={6} mb="xs">
                                <Text size="xs" className={`statusBadge ${getStatusClass(project.status)}`}>
                                    {project.status}
                                </Text>
                                <IconCalendar size={13} color="var(--mantine-color-gray-5)" stroke={1.5} />
                                <Text size="xs" c="gray.5">
                                    {dateRange}
                                </Text>
                            </Group>
                        </Box>

                        <Box>
                            <Text size="sm" fw={600} mb="xs">{t('description')}</Text>
                            <Text size="sm" c="gray.6">
                                {project.description}
                            </Text>
                        </Box>

                        {topLanguages.length > 0 && (
                            <Box>
                                <Text size="sm" fw={600} mb="xs">{t('languages')}</Text>
                                <Group gap={8}>
                                    {topLanguages.map((lang) => (
                                        <Group gap={4} key={lang.name}>
                                            <Box className={`languageDot ${getLanguageClass(lang.name)}`} />
                                            <Text size="xs" c="gray.6">
                                                {lang.name} {lang.percentage}%
                                            </Text>
                                        </Group>
                                    ))}
                                </Group>
                            </Box>
                        )}

                        {project.skills && project.skills.length > 0 && (
                            <Box>
                                <Text size="sm" fw={600} mb="xs">{t('skills')}</Text>
                                <Group gap={6}>
                                    {project.skills.map((skill) => (
                                        <SkillPill key={skill.id} skill={skill} size="sm" />
                                    ))}
                                </Group>
                            </Box>
                        )}

                        <Button
                            component="a"
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="md"
                            variant="default"
                            leftSection={<IconBrandGithub size={20} />}
                            radius="md"
                            className={`glassButton ${theme}`}
                            fullWidth
                        >
                            {t('github')}
                        </Button>
                    </Stack>
                </Card>
            </Box>
        </Modal>
    );
}