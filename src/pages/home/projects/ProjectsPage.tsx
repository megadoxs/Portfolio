"use client";

import { Loader, Stack, Grid, Text, Group, Box, Divider, useMantineColorScheme } from "@mantine/core";
import { useState, useEffect } from "react";
import { IconCode, IconSchool, IconBriefcase, IconHeart } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import EmptyState from "@/shared/ui/EmptyState";
import { getAllProjects, ProjectWithSkills } from "@/entities/project";
import ProjectTimeline from "@/pages/home/projects/ui/ProjectTimeLine";
import { getAllWork, Work } from "@/entities/work";
import { Education, getAllEducation } from "@/entities/education";
import { getAllHobbies, Hobby } from "@/entities/hobby";
import EducationCard from "@/shared/ui/EducationCard";
import WorkCard from "@/shared/ui/WorkCard";
import HobbyCard from "@/shared/ui/HobbyCard";

export default function ProjectTimelinePage() {
    const t = useTranslations("projects");
    const { colorScheme } = useMantineColorScheme();
    const [projects, setProjects] = useState<ProjectWithSkills[]>([]);
    const [education, setEducation] = useState<Education[]>([]);
    const [work, setWork] = useState<Work[]>([]);
    const [hobbies, setHobbies] = useState<Hobby[]>([]);
    const [isFetching, setIsFetching] = useState(true);

    // Theme-aware colors
    const borderColor = colorScheme === 'dark' ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)';
    const headerBgColor = colorScheme === 'dark' ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsFetching(true);
        try {
            const [projectsResult, educationResult, workResult, hobbiesResult] = await Promise.all([
                getAllProjects(),
                getAllEducation(),
                getAllWork(),
                getAllHobbies(),
            ]);
            setProjects(projectsResult);
            setEducation(educationResult);
            setWork(workResult);
            setHobbies(hobbiesResult);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsFetching(false);
        }
    };

    if (isFetching) {
        return (
            <Stack align="center" justify="center" h={300}>
                <Loader />
            </Stack>
        );
    }

    if (projects.length === 0) {
        return (
            <EmptyState
                icon={<IconCode size={48} />}
                title={t("emptyTitle")}
                description={t("emptyDesc")}
            />
        );
    }

    return (
        <Grid gutter="xl" style={{ overflowX: 'clip' }}>
            {/* Left side - Project Timeline */}
            <Grid.Col span={{ base: 12 }}> {/*md: 9*/}
                <ProjectTimeline projects={projects} />
            </Grid.Col>

            {/*/!* Right side - Bordered Column with Education, Work, Hobbies *!/*/}
            {/*<Grid.Col span={{ base: 12, md: 3 }}>*/}
            {/*    <Box*/}
            {/*        style={{*/}
            {/*            border: `1px solid ${borderColor}`,*/}
            {/*            borderRadius: 'var(--mantine-radius-md)',*/}
            {/*            overflow: 'hidden',*/}
            {/*            transition: 'border-color 0.3s ease',*/}
            {/*        }}*/}
            {/*    >*/}
            {/*        /!* Education Section *!/*/}
            {/*        {education.length > 0 && (*/}
            {/*            <>*/}
            {/*                <Box*/}
            {/*                    p="lg"*/}
            {/*                    style={{*/}
            {/*                        backgroundColor: headerBgColor,*/}
            {/*                        transition: 'background-color 0.3s ease',*/}
            {/*                    }}*/}
            {/*                >*/}
            {/*                    <Group gap="xs">*/}
            {/*                        <IconSchool size={20} color="var(--mantine-color-blue-6)" />*/}
            {/*                        <Text size="lg" fw={600}>*/}
            {/*                            Education*/}
            {/*                        </Text>*/}
            {/*                    </Group>*/}
            {/*                </Box>*/}
            {/*                <Stack gap="md" p="lg">*/}
            {/*                    {education.map((edu) => (*/}
            {/*                        <EducationCard key={edu.id} education={edu} />*/}
            {/*                    ))}*/}
            {/*                </Stack>*/}
            {/*                {(work.length > 0 || hobbies.length > 0) && <Divider />}*/}
            {/*            </>*/}
            {/*        )}*/}

            {/*        /!* Work Experience Section *!/*/}
            {/*        {work.length > 0 && (*/}
            {/*            <>*/}
            {/*                <Box*/}
            {/*                    p="lg"*/}
            {/*                    style={{*/}
            {/*                        backgroundColor: headerBgColor,*/}
            {/*                        transition: 'background-color 0.3s ease',*/}
            {/*                    }}*/}
            {/*                >*/}
            {/*                    <Group gap="xs">*/}
            {/*                        <IconBriefcase size={20} color="var(--mantine-color-green-6)" />*/}
            {/*                        <Text size="lg" fw={600}>*/}
            {/*                            Work Experience*/}
            {/*                        </Text>*/}
            {/*                    </Group>*/}
            {/*                </Box>*/}
            {/*                <Stack gap="md" p="lg">*/}
            {/*                    {work.map((w) => (*/}
            {/*                        <WorkCard key={w.id} work={w} />*/}
            {/*                    ))}*/}
            {/*                </Stack>*/}
            {/*                {hobbies.length > 0 && <Divider />}*/}
            {/*            </>*/}
            {/*        )}*/}

            {/*        /!* Hobbies Section *!/*/}
            {/*        {hobbies.length > 0 && (*/}
            {/*            <>*/}
            {/*                <Box*/}
            {/*                    p="lg"*/}
            {/*                    style={{*/}
            {/*                        backgroundColor: headerBgColor,*/}
            {/*                        transition: 'background-color 0.3s ease',*/}
            {/*                    }}*/}
            {/*                >*/}
            {/*                    <Group gap="xs">*/}
            {/*                        <IconHeart size={20} color="var(--mantine-color-pink-6)" />*/}
            {/*                        <Text size="lg" fw={600}>*/}
            {/*                            Hobbies*/}
            {/*                        </Text>*/}
            {/*                    </Group>*/}
            {/*                </Box>*/}
            {/*                <Stack gap="md" p="lg">*/}
            {/*                    {hobbies.map((hobby) => (*/}
            {/*                        <HobbyCard key={hobby.id} hobby={hobby} />*/}
            {/*                    ))}*/}
            {/*                </Stack>*/}
            {/*            </>*/}
            {/*        )}*/}
            {/*    </Box>*/}
            {/*</Grid.Col>*/}
        </Grid>
    );
}