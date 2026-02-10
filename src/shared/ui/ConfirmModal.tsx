"use client";

import { Button, Group, Modal, Text, Stack } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

interface ConfirmModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    title: string;
    message: string;
    isLoading?: boolean;
}

export default function ConfirmModal({
                                         opened,
                                         onClose,
                                         onConfirm,
                                         title,
                                         message,
                                         isLoading = false,
                                     }: ConfirmModalProps) {
    const t = useTranslations('confirmModal');

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={title}
            centered
            size="sm"
            radius="lg"
            withCloseButton={!isLoading}
            closeOnClickOutside={!isLoading}
            closeOnEscape={!isLoading}
        >
            <Stack gap="lg">
                <Group gap="sm" align="flex-start">
                    <IconAlertTriangle size={22} color="var(--mantine-color-yellow-6)" stroke={1.5} /> {/* this should also be a param */}
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
        </Modal>
    );
}