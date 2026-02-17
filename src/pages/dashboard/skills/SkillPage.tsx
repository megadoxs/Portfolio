"use client";

import {Button, Container, Loader, Stack, Text, Group, useMantineColorScheme} from "@mantine/core";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { IconCode, IconPlus } from "@tabler/icons-react";

import SkillModal from "./ui/SkillModal";
import EmptyState from "@/shared/ui/EmptyState";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import { addSkill, updateSkill, deleteSkill, getAllSkills, Skill, SkillRequestModel, SkillCategory } from "@/entities/skill";
import {SkillPill} from "@/shared/ui/SkillPill";

export default function SkillsPage() {
    const t = useTranslations("skills");
    const { colorScheme } = useMantineColorScheme();

    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Skill | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        setIsFetching(true);
        try {
            const data = await getAllSkills();
            setSkills(data);
        } catch (error) {
            console.error("Failed to fetch skills:", error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleAdd = () => {
        setEditTarget(null);
        setModalOpen(true);
    };

    const handleEdit = (skill: Skill) => {
        setEditTarget(skill);
        setModalOpen(true);
    };

    const handleModalSubmit = async (skillData: SkillRequestModel) => {
        try {
            setIsCreating(true);
            if (editTarget) {
                // Update existing skill
                await updateSkill(editTarget.id, skillData);
            } else {
                // Create new skill
                await addSkill(skillData);
            }
            await fetchSkills();
            setModalOpen(false);
            setEditTarget(null);
        } catch (error) {
            console.error("Failed to save skill:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (deleteTarget) {
            setIsDeleting(true);
            try {
                await deleteSkill(deleteTarget.id);
                await fetchSkills();
                setDeleteTarget(null);
            } catch (error) {
                console.error("Failed to delete skill:", error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const groupSkillsByCategory = () => {
        const grouped: Record<SkillCategory, Skill[]> = {
            LANGUAGE: [],
            FRAMEWORK: [],
            SOFTWARE: [],
            DATABASE: [],
        };

        skills.forEach((skill) => {
            grouped[skill.category].push(skill);
        });

        return grouped;
    };

    const getCategoryLabel = (category: SkillCategory): string => {
        return t(`category.${category.toLowerCase()}`);
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

    const groupedSkills = groupSkillsByCategory();

    return (
        <Container size="100%" py="xl" px="xl">
            <Stack gap="lg">
                <Group justify="space-between" align="center">
                    <Text size="xl" fw={800} style={{ color: colorScheme === 'dark' ? 'var(--mantine-color-white)' : 'var(--mantine-color-black)' }}>
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

                {skills.length === 0 ? (
                    <EmptyState
                        icon={<IconCode size={48} />}
                        title={t("emptyTitle")}
                        description={t("emptyDesc")}
                    />
                ) : (
                    <Stack gap="xl">
                        {Object.entries(groupedSkills).map(([category, categorySkills]) => {
                            if (categorySkills.length === 0) return null;

                            return (
                                <Stack gap="sm" key={category}>
                                    <Text size="md" fw={600} c="gray.7">
                                        {getCategoryLabel(category as SkillCategory)}
                                    </Text>
                                    <Group gap="xs">
                                        {categorySkills.map((skill) => (
                                            <SkillPill
                                                key={skill.id}
                                                size={"lg"}
                                                skill={skill}
                                                onEdit={handleEdit}
                                                onDelete={setDeleteTarget}
                                            />
                                        ))}
                                    </Group>
                                </Stack>
                            );
                        })}
                    </Stack>
                )}
            </Stack>

            <SkillModal
                opened={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditTarget(null);
                }}
                onSubmit={handleModalSubmit}
                isLoading={isCreating}
                skill={editTarget}
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