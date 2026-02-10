"use client";

import { Card, Image, Text, Group, ActionIcon, Menu } from "@mantine/core";
import {IconTrash, IconDots} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Hobby } from "@/entities/hobby";

interface HobbyCardProps {
    hobby: Hobby;
    onDelete?: (hobby: Hobby) => void;
}

export default function HobbyCard({ hobby, onDelete }: HobbyCardProps) {
    const t = useTranslations("hobbies");

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap="md" wrap="nowrap">
                    <Image
                        src={hobby.picture}
                        alt={hobby.name}
                        w={60}
                        h={60}
                        radius="50%"
                        fit="cover"
                    />
                    <Text fw={600} size="lg">
                        {hobby.name}
                    </Text>
                </Group>

                {onDelete && (
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
                            <Menu.Item
                                color="red"
                                leftSection={<IconTrash size={16} />}
                                onClick={() => onDelete(hobby)}
                            >
                                {t("deleteButton")}
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                )}
            </Group>
        </Card>
    );
}