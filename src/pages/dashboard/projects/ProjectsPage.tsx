"use client";

import {Button, Container, Grid, Group, Loader, Stack, Text, useMantineColorScheme} from "@mantine/core";
import {useState, useEffect} from "react";
import {useTranslations} from "next-intl";
import {IconCode, IconPlus} from "@tabler/icons-react";

import ProjectCard from "@/shared/ui/ProjectCard";
import AddProjectModal from "./ui/AddProjectModal";
import EmptyState from "@/shared/ui/EmptyState";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import {
    addProject,
    deleteProject,
    Project,
    ProjectRequestModel,
    updateProject,
    getAllProjects,
    ProjectWithSkills
} from "@/entities/project";

export default function ProjectsPage() {
    const t = useTranslations("projects");
    const { colorScheme } = useMantineColorScheme();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
    const [projects, setProjects] = useState<ProjectWithSkills[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setIsFetching(true);
        try {
            const data = await getAllProjects();
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleAdd = () => {
        setEditingProject(null);
        setModalOpen(true);
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setModalOpen(true);
    };

    const handleModalSubmit = async (project: ProjectRequestModel) => {
        try {
            if (editingProject) {
                setIsUpdating(true);
                await updateProject(editingProject.id, project);
            } else {
                setIsCreating(true);
                await addProject(project);
            }
            await fetchProjects();
            setModalOpen(false);
        } catch (error) {
            console.error("Failed to save project:", error);
        } finally {
            setIsCreating(false);
            setIsUpdating(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (deleteTarget) {
            setIsDeleting(true);
            try {
                await deleteProject(deleteTarget.id);
                await fetchProjects();
                setDeleteTarget(null);
            } catch (error) {
                console.error("Failed to delete project:", error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    if (isFetching) {
        return (
            <Container size="100%" py="xl" px="xl">
                <Stack align="center" justify="center" h={300}>
                    <Loader />
                </Stack>
            </Container>
        );
    }

    return (
        <Container size="100%" py="xl" px="xl">
            <Stack gap="lg">
                <Group justify="space-between" align="center">
                    <Text size="xl" fw={800} c="gray.8">
                        {t("title")}
                    </Text>
                    <Button
                        size="sm"
                        variant="filled"
                        radius="xl"
                        leftSection={<IconPlus size={14} stroke={2} />}
                        onClick={handleAdd}
                        className={`glassButton ${theme}`}
                    >
                        {t("addButton")}
                    </Button>
                </Group>

                {projects.length === 0 ? (
                    <EmptyState
                        icon={<IconCode size={48} />}
                        title={t("emptyTitle")}
                        description={t("emptyDesc")}
                    />
                ) : (
                    <Grid>
                        {projects.map((project) => (
                            <Grid.Col key={project.id} span={{ base: 12, sm: 6, md: 4 }}>
                                <ProjectCard
                                    project={project}
                                    onEdit={handleEdit}
                                    onDelete={setDeleteTarget}
                                />
                            </Grid.Col>
                        ))}
                    </Grid>
                )}
            </Stack>

            <AddProjectModal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleModalSubmit}
                isLoading={isCreating || isUpdating}
            />

            <ConfirmModal
                opened={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                title={t("deleteTitle")}
                message={`${t("deleteMessage")} "${deleteTarget?.title}".`}
                isLoading={isDeleting}
            />
        </Container>
    );
}