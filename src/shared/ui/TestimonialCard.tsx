"use client";

import { Paper, Text, Group, ActionIcon, Menu, Stack, Badge, Avatar, Box, useMantineColorScheme } from "@mantine/core";
import { IconDots, IconCheck, IconX, IconTrash } from "@tabler/icons-react";
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
    const t = useTranslations("testimonials");
    const { colorScheme } = useMantineColorScheme();
    const theme = colorScheme === "dark" ? "dark" : "light";
    const showActions = onApprove || onDeny || onDelete;

    return (
        <Box className={`glowWrapper glowWrapperSmall ${theme}`}>
            <Paper className={`glassCard ${theme}`} p="xl" radius="md">
                <Stack gap="md">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Group gap="md" align="flex-start" style={{ flex: 1 }}>
                            <Avatar size="lg" radius="xl" color="blue">
                                {testimonial.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Stack gap={4} style={{ flex: 1 }}>
                                <Group gap="xs">
                                    <Text fw={700} size="lg">
                                        {testimonial.name}
                                    </Text>
                                    {showActions && (
                                        <Badge
                                            color={getStatusColor(testimonial.status)}
                                            size="sm"
                                            variant="light"
                                        >
                                            {t(`status.${testimonial.status}`)}
                                        </Badge>
                                    )}
                                </Group>
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
                    <Text
                        size="md"
                        c="dimmed"
                        style={{ fontStyle: "italic", lineHeight: 1.6 }}
                    >
                        &ldquo;{testimonial.testimonial}&rdquo;
                    </Text>
                </Stack>
            </Paper>
        </Box>
    );
}