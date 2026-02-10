"use client";

import { Button, Container, Loader, Stack, Text, Group } from "@mantine/core";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { IconBriefcase, IconPlus } from "@tabler/icons-react";

import WorkModal from "./ui/WorkModal";
import EmptyState from "@/shared/ui/EmptyState";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import { addWork, deleteWork, updateWork, Work, WorkRequestModel, getAllWork } from "@/entities/work";
import WorkCard from "@/shared/ui/WorkCard";

export default function WorkPage() {
    const t = useTranslations("work");

    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Work | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Work | null>(null);
    const [workList, setWorkList] = useState<Work[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchWork();
    }, []);

    const fetchWork = async () => {
        setIsFetching(true);
        try {
            const data = await getAllWork();
            setWorkList(data);
        } catch (error) {
            console.error("Failed to fetch work:", error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleAdd = () => {
        setEditTarget(null);
        setModalOpen(true);
    };

    const handleUpdate = (work: Work) => {
        setEditTarget(work);
        setModalOpen(true);
    };

    const handleModalSubmit = async (work: WorkRequestModel) => {
        try {
            setIsSubmitting(true);
            if (editTarget) {
                await updateWork(editTarget.id, work);
            } else {
                await addWork(work);
            }
            await fetchWork();
            setModalOpen(false);
            setEditTarget(null);
        } catch (error) {
            console.error("Failed to save work:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (deleteTarget) {
            setIsDeleting(true);
            try {
                await deleteWork(deleteTarget.id);
                await fetchWork();
                setDeleteTarget(null);
            } catch (error) {
                console.error("Failed to delete work:", error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    // Sort work by start date (most recent first), with current positions at the top
    const sortedWork = [...workList].sort((a, b) => {
        // Current positions (endDate is null) come first
        if (a.endDate === null && b.endDate !== null) return -1;
        if (a.endDate !== null && b.endDate === null) return 1;

        // Otherwise sort by start date descending
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
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
                    >
                        {t("addButton")}
                    </Button>
                </Group>

                {workList.length === 0 ? (
                    <EmptyState
                        icon={<IconBriefcase size={48} />}
                        title={t("emptyTitle")}
                        description={t("emptyDesc")}
                    />
                ) : (
                    <Stack gap="sm">
                        {sortedWork.map((work) => (
                            <WorkCard
                                key={work.id}
                                work={work}
                                onDelete={setDeleteTarget}
                                onUpdate={handleUpdate}
                            />
                        ))}
                    </Stack>
                )}
            </Stack>

            <WorkModal
                opened={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditTarget(null);
                }}
                onSubmit={handleModalSubmit}
                isLoading={isSubmitting}
                editWork={editTarget}
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