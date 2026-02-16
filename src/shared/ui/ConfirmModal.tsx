"use client";

import { Button, Group, Modal, Text, Stack, Box, Card } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useMantineColorScheme } from "@mantine/core";
import type { TablerIcon } from "@tabler/icons-react";

interface ConfirmModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    title: string;
    message: string;
    isLoading?: boolean;
    icon?: TablerIcon;
    iconColor?: string;
}

export default function ConfirmModal({
                                         opened,
                                         onClose,
                                         onConfirm,
                                         title,
                                         message,
                                         isLoading = false,
                                         icon: Icon = IconAlertTriangle,
                                         iconColor = "var(--mantine-color-yellow-6)",
                                     }: ConfirmModalProps) {
    const t = useTranslations('confirmModal');
    const { colorScheme } = useMantineColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={<Text fw={700} size="lg">{title}</Text>}
            size="sm"
            centered
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
            styles={{
                content: {
                    backgroundColor: 'transparent',
                },
                header: {
                    backgroundColor: 'transparent',
                },
                body: {
                    padding: 0,
                    overflow: 'hidden',
                },
            }}
            withCloseButton={!isLoading}
            closeOnClickOutside={!isLoading}
            closeOnEscape={!isLoading}
        >
            <Box className={`glowWrapper ${theme}`}>
                <Card className={`glassCard ${theme}`} p="xl" radius="md">
                    <Stack gap="lg">
                        <Group gap="sm" align="flex-start">
                            <Icon size={22} color={iconColor} stroke={1.5} />
                            <Text size="sm" c="gray.6" lh={1.5}>
                                {message}
                            </Text>
                        </Group>

                        <Group justify="flex-end" gap="sm" mt="xs">
                            <Button variant="subtle" radius="xl" onClick={onClose} disabled={isLoading}>
                                {t('cancel')}
                            </Button>
                            <Button
                                variant="filled"
                                color="red"
                                radius="xl"
                                onClick={onConfirm}
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                {t('confirm')}
                            </Button>
                        </Group>
                    </Stack>
                </Card>
            </Box>
        </Modal>
    );
}