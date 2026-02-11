"use client";

import {Button, Container, Grid, Loader, Stack, Text, Group, useMantineColorScheme} from "@mantine/core";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { IconSchool, IconPlus } from "@tabler/icons-react";

import EducationModal from "./ui/EducationModal";
import EmptyState from "@/shared/ui/EmptyState";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import {addEducation, deleteEducation, updateEducation, getAllEducation, Education, EducationRequestModel} from "@/entities/education";
import EducationCard from "@/shared/ui/EducationCard";

export default function EducationPage() {
    const t = useTranslations("education");
    const { colorScheme } = useMantineColorScheme();

    const [modalOpen, setModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Education | null>(null);
    const [editTarget, setEditTarget] = useState<Education | null>(null);
    const [educations, setEducations] = useState<Education[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    useEffect(() => {
        fetchEducation();
    }, []);

    const fetchEducation = async () => {
        setIsFetching(true);
        try {
            const data = await getAllEducation();
            setEducations(data);
        } catch (error) {
            console.error("Failed to fetch education:", error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleAdd = () => {
        setEditTarget(null);
        setModalOpen(true);
    };

    const handleEdit = (education: Education) => {
        setEditTarget(education);
        setModalOpen(true);
    };

    const handleModalSubmit = async (educationData: EducationRequestModel) => {
        try {
            setIsCreating(true);
            if (editTarget) {
                await updateEducation(editTarget.id, educationData);
            } else {
                await addEducation(educationData);
            }
            await fetchEducation();
            setModalOpen(false);
            setEditTarget(null);
        } catch (error) {
            console.error("Failed to save education:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (deleteTarget) {
            setIsDeleting(true);
            try {
                await deleteEducation(deleteTarget.id);
                await fetchEducation();
                setDeleteTarget(null);
            } catch (error) {
                console.error("Failed to delete education:", error);
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

                {educations.length === 0 ? (
                    <EmptyState
                        icon={<IconSchool size={48} />}
                        title={t("emptyTitle")}
                        description={t("emptyDesc")}
                    />
                ) : (
                    <Grid>
                        {educations.map((education) => (
                            <Grid.Col key={education.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                                <EducationCard
                                    education={education}
                                    onDelete={setDeleteTarget}
                                    onEdit={handleEdit}
                                />
                            </Grid.Col>
                        ))}
                    </Grid>
                )}
            </Stack>

            <EducationModal
                opened={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditTarget(null);
                }}
                onSubmit={handleModalSubmit}
                isLoading={isCreating}
                initialData={editTarget}
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