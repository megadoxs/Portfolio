"use client";

import {Container, Grid, Loader, Stack, Text, useMantineColorScheme} from "@mantine/core";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { IconMessageCircle } from "@tabler/icons-react";

import EmptyState from "@/shared/ui/EmptyState";
import ConfirmModal from "@/shared/ui/ConfirmModal";
import { getAllTestimonials, Testimonial, TestimonialStatus } from "@/entities/testimonial";
import { updateTestimonialStatus } from "@/entities/testimonial/api/updateTestimonialStatus";
import { deleteTestimonial } from "@/entities/testimonial/api/deleteTestimonial";
import TestimonialCard from "@/shared/ui/TestimonialCard";

export default function TestimonialsPage() {
    const t = useTranslations("testimonials");
    const { colorScheme } = useMantineColorScheme();

    const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        setIsFetching(true);
        try {
            const data = await getAllTestimonials();
            setTestimonials(data);
        } catch (error) {
            console.error("Failed to fetch testimonials:", error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleApprove = async (testimonial: Testimonial) => {
        setIsUpdating(true);
        try {
            await updateTestimonialStatus(testimonial.id, TestimonialStatus.APPROVED);
            await fetchTestimonials();
        } catch (error) {
            console.error("Failed to approve testimonial:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeny = async (testimonial: Testimonial) => {
        setIsUpdating(true);
        try {
            await updateTestimonialStatus(testimonial.id, TestimonialStatus.DENIED);
            await fetchTestimonials();
        } catch (error) {
            console.error("Failed to deny testimonial:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (deleteTarget) {
            setIsDeleting(true);
            try {
                await deleteTestimonial(deleteTarget.id);
                await fetchTestimonials();
                setDeleteTarget(null);
            } catch (error) {
                console.error("Failed to delete testimonial:", error);
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
                <Text size="xl" fw={800} style={{ color: colorScheme === 'dark' ? 'var(--mantine-color-white)' : 'var(--mantine-color-black)' }}>
                    {t("title")}
                </Text>

                {testimonials.length === 0 ? (
                    <EmptyState
                        icon={<IconMessageCircle size={48} />}
                        title={t("emptyTitle")}
                        description={t("emptyDesc")}
                    />
                ) : (
                    <Grid>
                        {testimonials.map((testimonial) => (
                            <Grid.Col key={testimonial.id} span={{ base: 12, md: 6 }}>
                                <TestimonialCard
                                    testimonial={testimonial}
                                    onApprove={handleApprove}
                                    onDeny={handleDeny}
                                    onDelete={setDeleteTarget}
                                />
                            </Grid.Col>
                        ))}
                    </Grid>
                )}
            </Stack>

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