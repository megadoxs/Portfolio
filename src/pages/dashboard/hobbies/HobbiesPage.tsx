"use client";

import {Button, Container, Grid, Loader, Stack, Text, Group, useMantineColorScheme} from "@mantine/core";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { IconHeart, IconPlus } from "@tabler/icons-react";

import HobbyModal from "./ui/HobbyModal";
import EmptyState from "@/shared/ui/EmptyState";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import {addHobby, deleteHobby, getAllHobbies, Hobby, HobbyRequestModel} from "@/entities/hobby";
import HobbyCard from "@/shared/ui/HobbyCard";

export default function HobbiesPage() {
    const t = useTranslations("hobbies");
    const { colorScheme } = useMantineColorScheme();

    const [modalOpen, setModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Hobby | null>(null);
    const [hobbies, setHobbies] = useState<Hobby[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    useEffect(() => {
        fetchHobbies();
    }, []);

    const fetchHobbies = async () => {
        setIsFetching(true);
        try {
            const data = await getAllHobbies();
            setHobbies(data);
        } catch (error) {
            console.error("Failed to fetch hobbies:", error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleAdd = () => {
        setModalOpen(true);
    };

    const handleModalSubmit = async (hobbyData: HobbyRequestModel) => {
        try {
            setIsCreating(true);
            await addHobby(hobbyData);
            await fetchHobbies();
            setModalOpen(false);
        } catch (error) {
            console.error("Failed to save hobby:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (deleteTarget) {
            setIsDeleting(true);
            try {
                await deleteHobby(deleteTarget.id);
                await fetchHobbies();
                setDeleteTarget(null);
            } catch (error) {
                console.error("Failed to delete hobby:", error);
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

                {hobbies.length === 0 ? (
                    <EmptyState
                        icon={<IconHeart size={48} />}
                        title={t("emptyTitle")}
                        description={t("emptyDesc")}
                    />
                ) : (
                    <Grid>
                        {hobbies.map((hobby) => (
                            <Grid.Col key={hobby.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                                <HobbyCard
                                    hobby={hobby}
                                    onDelete={setDeleteTarget}
                                />
                            </Grid.Col>
                        ))}
                    </Grid>
                )}
            </Stack>

            <HobbyModal
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