"use client";

import { Paper, Text, ActionIcon, Menu, Stack, Box, useMantineColorScheme } from "@mantine/core";
import { IconTrash, IconDots } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { Hobby } from "@/entities/hobby";
import Image from "next/image";

interface HobbyCardProps {
    hobby: Hobby;
    onDelete?: (hobby: Hobby) => void;
}

export default function HobbyCard({ hobby, onDelete }: HobbyCardProps) {
    const t = useTranslations("hobbies");
    const locale = useLocale();
    const { colorScheme } = useMantineColorScheme();
    const theme = colorScheme === "dark" ? "dark" : "light";

    const name = locale === "fr" ? hobby.name_fr : hobby.name_en;

    return (
        <Box className={`glowWrapper glowWrapperSmall ${theme}`}>
            <Paper className={`glassCard ${theme}`} p="lg" radius="md" style={{ position: "relative" }}>
                {onDelete && (
                    <Box style={{ position: "absolute", top: 8, right: 8 }}>
                        <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <ActionIcon variant="subtle" color="gray" aria-label="Options" size="sm">
                                    <IconDots size={16} />
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
                    </Box>
                )}
                <Stack gap="md" align="center">
                    <Box style={{ position: "relative", width: 80, height: 80, borderRadius: "50%", overflow: "hidden" }}>
                        <Image src={hobby.picture} alt={name} fill style={{ objectFit: "cover" }} />
                    </Box>
                    <Text fw={600} size="lg" ta="center">{name}</Text>
                </Stack>
            </Paper>
        </Box>
    );
}