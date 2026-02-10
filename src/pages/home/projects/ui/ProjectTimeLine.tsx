"use client";

import { Stack, Text, Box } from "@mantine/core";
import { IconCircleFilled } from "@tabler/icons-react";
import { Project } from "@/entities/project";
import { useTranslations } from "next-intl";
import ProjectCard from "@/shared/ui/ProjectCard";

interface ProjectTimelineProps {
    projects: Project[];
}

export default function ProjectTimeline({ projects }: ProjectTimelineProps) {
    // Sort projects by start date (most recent first)
    const sortedProjects = [...projects].sort((a, b) => {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    return (
        <Box py="xl" px="xl">
            <Stack gap="xl" align="center">
                {/* Timeline - Desktop (2-sided) */}
                <Box
                    style={{ position: "relative", width: "100%", maxWidth: "1200px" }}
                    visibleFrom="md"
                >
                    {/* Center Line */}
                    <Box
                        style={{
                            position: "absolute",
                            left: "50%",
                            top: 0,
                            bottom: 0,
                            width: "2px",
                            backgroundColor: "var(--mantine-color-gray-3)",
                            transform: "translateX(-50%)",
                            zIndex: 0,
                        }}
                    />

                    {/* Timeline Items */}
                    <Stack gap={60}>
                        {sortedProjects.map((project, index) => {
                            const isLeft = index % 2 === 0;

                            return (
                                <Box
                                    key={project.id}
                                    style={{
                                        position: "relative",
                                        minHeight: "200px",
                                    }}
                                >
                                    {/* Timeline Dot */}
                                    <Box
                                        style={{
                                            position: "absolute",
                                            left: "50%",
                                            top: "50%",
                                            transform: "translate(-50%, -50%)",
                                            zIndex: 2,
                                        }}
                                    >
                                        <IconCircleFilled
                                            size={16}
                                            color="var(--mantine-color-blue-6)"
                                        />
                                    </Box>

                                    {/* Horizontal Line to Card */}
                                    <Box
                                        style={{
                                            position: "absolute",
                                            left: isLeft ? "calc(50% - 32px)" : "calc(50% + 8px)",
                                            right: isLeft ? "auto" : "calc(50% - 32px)",
                                            top: "50%",
                                            width: "24px",
                                            height: "2px",
                                            backgroundColor: "var(--mantine-color-gray-3)",
                                            transform: "translateY(-50%)",
                                            zIndex: 1,
                                        }}
                                    />

                                    {/* Project Card */}
                                    <Box
                                        style={{
                                            width: "500px",
                                            position: "absolute",
                                            top: 0,
                                            ...(isLeft
                                                    ? { right: "calc(50% - 60px)" }
                                                    : { left: "calc(50% + 40px)" }
                                            ),
                                            zIndex: 2,
                                        }}
                                    >
                                        <ProjectCard
                                            project={project}
                                        />
                                    </Box>
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>

                {/* Timeline - Mobile (single column) */}
                <Box
                    style={{ position: "relative", width: "100%" }}
                    hiddenFrom="md"
                >
                    {/* Left Line */}
                    <Box
                        style={{
                            position: "absolute",
                            left: "20px",
                            top: 0,
                            bottom: 0,
                            width: "2px",
                            backgroundColor: "var(--mantine-color-gray-3)",
                            zIndex: 0,
                        }}
                    />

                    {/* Timeline Items */}
                    <Stack gap={40} pl="60px">
                        {sortedProjects.map((project) => (
                            <Box
                                key={project.id}
                                style={{
                                    position: "relative",
                                }}
                            >
                                {/* Timeline Dot */}
                                <Box
                                    style={{
                                        position: "absolute",
                                        left: "-48px",
                                        top: "20px",
                                        zIndex: 2,
                                    }}
                                >
                                    <IconCircleFilled
                                        size={16}
                                        color="var(--mantine-color-blue-6)"
                                    />
                                </Box>

                                {/* Horizontal Line to Card */}
                                <Box
                                    style={{
                                        position: "absolute",
                                        left: "-40px",
                                        top: "28px",
                                        width: "40px",
                                        height: "2px",
                                        backgroundColor: "var(--mantine-color-gray-3)",
                                        zIndex: 1,
                                    }}
                                />

                                {/* Project Card */}
                                <ProjectCard
                                    project={project}
                                />
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
}