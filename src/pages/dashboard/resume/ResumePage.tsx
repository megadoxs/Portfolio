"use client";

import {Button, Container, Grid, Loader, Stack, Text, Group, Badge, useMantineColorScheme} from "@mantine/core";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { IconFileText, IconPlus } from "@tabler/icons-react";

import ResumeModal from "./ui/ResumeModal";
import ResumeCard from "./ui/ResumeCard";
import EmptyState from "@/shared/ui/EmptyState";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import { addResume, deleteResume, activateResume, Resume, ResumeRequestModel, getAllResumes } from "@/entities/resume";

export default function ResumesPage() {
    const t = useTranslations("resumes");
    const tlang = useTranslations("language")
    const { colorScheme } = useMantineColorScheme();

    const [modalOpen, setModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        setIsFetching(true);
        try {
            const data = await getAllResumes();
            setResumes(data);
        } catch (error) {
            console.error("Failed to fetch resumes:", error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleAdd = () => {
        setModalOpen(true);
    };

    const handleModalSubmit = async (resume: ResumeRequestModel) => {
        try {
            setIsCreating(true);
            await addResume(resume);
            await fetchResumes();
            setModalOpen(false);
        } catch (error) {
            console.error("Failed to save resume:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleActivate = async (resumeId: string) => {
        try {
            await activateResume(resumeId);
            await fetchResumes();
        } catch (error) {
            console.error("Failed to activate resume:", error);
        }
    };

    const handleDeleteConfirm = async () => {
        if (deleteTarget) {
            setIsDeleting(true);
            try {
                await deleteResume(deleteTarget.id);
                await fetchResumes();
                setDeleteTarget(null);
            } catch (error) {
                console.error("Failed to delete resume:", error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const frenchResumes = resumes.filter(r => r.locale === "fr").sort((a, b) => {
        if (a.active !== b.active) {
            return a.active ? -1 : 1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const englishResumes = resumes.filter(r => r.locale === "en").sort((a, b) => {
        if (a.active !== b.active) {
            return a.active ? -1 : 1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

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

                {resumes.length === 0 ? (
                    <EmptyState
                        icon={<IconFileText size={48} />}
                        title={t("emptyTitle")}
                        description={t("emptyDesc")}
                    />
                ) : (
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Stack gap="md">
                                <Group justify="space-between">
                                    <Text size="xl" fw={700} c="gray.7">
                                        {tlang("english")}
                                    </Text>
                                    <Badge size="lg" variant="light">
                                        {englishResumes.length}
                                    </Badge>
                                </Group>
                                {englishResumes.length === 0 ? (
                                    <Text size="sm" c="dimmed">
                                        {t("noEnglishResumes")}
                                    </Text>
                                ) : (
                                    <Stack gap="sm">
                                        {englishResumes.map((resume) => (
                                            <ResumeCard
                                                key={resume.id}
                                                resume={resume}
                                                onDelete={setDeleteTarget}
                                                onActivate={handleActivate}
                                            />
                                        ))}
                                    </Stack>
                                )}
                            </Stack>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Stack gap="md">
                                <Group justify="space-between">
                                    <Text size="xl" fw={700} c="gray.7">
                                        {tlang("french")}
                                    </Text>
                                    <Badge size="lg" variant="light">
                                        {frenchResumes.length}
                                    </Badge>
                                </Group>
                                {frenchResumes.length === 0 ? (
                                    <Text size="sm" c="dimmed">
                                        {t("noFrenchResumes")}
                                    </Text>
                                ) : (
                                    <Stack gap="sm">
                                        {frenchResumes.map((resume) => (
                                            <ResumeCard
                                                key={resume.id}
                                                resume={resume}
                                                onDelete={setDeleteTarget}
                                                onActivate={handleActivate}
                                            />
                                        ))}
                                    </Stack>
                                )}
                            </Stack>
                        </Grid.Col>
                    </Grid>
                )}
            </Stack>

            <ResumeModal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleModalSubmit}
                isLoading={isCreating}
            />

            <ConfirmModal
                opened={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                title={t("deleteTitle")}
                message={t("deleteMessage")}
                isLoading={isDeleting}
            />
        </Container>
    );
}