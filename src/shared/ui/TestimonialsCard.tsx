"use client";

import { Card, Text, Group, ActionIcon, Menu, Stack, Badge } from "@mantine/core";
import { IconDots, IconCheck, IconX, IconMessageCircle, IconTrash } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Testimonial, TestimonialStatus } from "@/entities/testimonial";

interface TestimonialCardProps {
    testimonial: Testimonial;
    onApprove?: (testimonial: Testimonial) => void;
    onDeny?: (testimonial: Testimonial) => void;
    onDelete?: (testimonial: Testimonial) => void;
}

const getStatusColor = (status: TestimonialStatus) => {
    const colors = {
        APPROVED: "green",
        PENDING: "yellow",
        DENIED: "red",
    };
    return colors[status] || "gray";
};

export default function TestimonialCard({
                                            testimonial,
                                            onApprove,
                                            onDeny,
                                            onDelete
                                        }: TestimonialCardProps) {
    const t = useTranslations("testimonial");
    const showActions = onApprove || onDeny || onDelete;

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="sm">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Group gap="md" wrap="nowrap" align="flex-start" style={{ flex: 1 }}>
                        <IconMessageCircle size={32} />
                        <Stack gap={4} style={{ flex: 1 }}>
                            <Group gap="xs">
                                <Text fw={600} size="md">
                                    {testimonial.name}
                                </Text>
                                <Badge
                                    color={getStatusColor(testimonial.status)}
                                    size="sm"
                                    variant="light"
                                >
                                    {testimonial.status}
                                </Badge>
                            </Group>
                            <Text size="sm" c="dimmed" lineClamp={3}>
                                {testimonial.testimonial}
                            </Text>
                        </Stack>
                    </Group>

                    {showActions && (
                        <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    aria-label="Options"
                                >
                                    <IconDots size={18} />
                                </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                                {onApprove && testimonial.status !== TestimonialStatus.APPROVED && (
                                    <Menu.Item
                                        color="green"
                                        leftSection={<IconCheck size={16} />}
                                        onClick={() => onApprove(testimonial)}
                                    >
                                        {t("approveButton")}
                                    </Menu.Item>
                                )}
                                {onDeny && testimonial.status !== TestimonialStatus.DENIED && (
                                    <Menu.Item
                                        color="red"
                                        leftSection={<IconX size={16} />}
                                        onClick={() => onDeny(testimonial)}
                                    >
                                        {t("denyButton")}
                                    </Menu.Item>
                                )}
                                {onDelete && (
                                    <Menu.Item
                                        color="red"
                                        leftSection={<IconTrash size={16} />}
                                        onClick={() => onDelete(testimonial)}
                                    >
                                        {t("deleteButton")}
                                    </Menu.Item>
                                )}
                            </Menu.Dropdown>
                        </Menu>
                    )}
                </Group>
            </Stack>
        </Card>
    );
}