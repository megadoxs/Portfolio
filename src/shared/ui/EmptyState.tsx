"use client";

import { Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
}

export default function EmptyState({
                                       icon,
                                       title,
                                       description,
                                   }: EmptyStateProps) {
    return (
        <Stack align="center" justify="center" gap="md" py={64}>
            {icon && <div style={{ opacity: 0.35 }}>{icon}</div>}

            <Stack align="center" gap={4}>
                <Text size="md" fw={600} c="gray.7">
                    {title}
                </Text>
                <Text size="sm" c="gray.5" ta="center" maw={320}>
                    {description}
                </Text>
            </Stack>
        </Stack>
    );
}