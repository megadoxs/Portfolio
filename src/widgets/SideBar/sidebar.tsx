"use client";

import {
    Box,
    Stack,
    Button,
    Text,
    Menu,
    Avatar,
    Group,
} from "@mantine/core";
import {
    IconSchool,
    IconBriefcase,
    IconTrophy,
    IconCode,
    IconHeart,
    IconMessage,
    IconFileText,
    IconLogout,
    IconSettings,
    IconUser,
    IconDots,
    IconMail,
    IconChartBar
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useTranslations } from "next-intl";

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useUser();
    const t = useTranslations("sidebar");

    const navItems = [
        { href: "/dashboard", label: t("overview"), icon: IconChartBar },
        { href: "/dashboard/education", label: t("education"), icon: IconSchool },
        { href: "/dashboard/work", label: t("work"), icon: IconBriefcase },
        { href: "/dashboard/projects", label: t("projects"), icon: IconCode },
        { href: "/dashboard/skills", label: t("skills"), icon: IconTrophy },
        { href: "/dashboard/hobbies", label: t("hobbies"), icon: IconHeart },
        { href: "/dashboard/testimonials", label: t("testimonials"), icon: IconMessage },
        { href: "/dashboard/resume", label: t("resume"), icon: IconFileText },
        { href: "/dashboard/contact", label: t("contact"), icon: IconMail }
    ];

    const NAVBAR_HEIGHT = 73;

    return (
        <Box
            style={{
                width: 280,
                height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
                position: "fixed",
                left: 0,
                top: NAVBAR_HEIGHT,
                borderRight: "1px solid var(--mantine-color-gray-3)",
                display: "flex",
                flexDirection: "column",
                background: "var(--mantine-color-body)",
            }}
        >
            <Box p="md" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
                <Group justify="space-between" align="center">
                    <Text size="xl" fw={900} c="gray.7">
                        {t("dashboard")}
                    </Text>
                </Group>
            </Box>

            {/* Navigation Links */}
            <Stack gap={4} p="md" style={{ flex: 1, overflowY: "auto" }}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Button
                            key={item.href}
                            component={Link}
                            href={item.href}
                            variant={isActive ? "light" : "subtle"}
                            justify="flex-start"
                            leftSection={<Icon size={20} stroke={1.5} />}
                            radius="md"
                            fullWidth
                            styles={{
                                root: {
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive
                                        ? "var(--mantine-color-gray-9)"
                                        : "var(--mantine-color-gray-7)",
                                },
                                section: {
                                    marginRight: 12,
                                },
                            }}
                        >
                            {item.label}
                        </Button>
                    );
                })}
            </Stack>

            <Box p="md" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
                <Menu shadow="md" width={200} position="top-end">
                    <Menu.Target>
                        <Button
                            variant="subtle"
                            fullWidth
                            justify="space-between"
                            rightSection={<IconDots size={20} stroke={1.5} />}
                            styles={{
                                root: {
                                    height: "auto",
                                    padding: "8px 12px",
                                },
                                inner: {
                                    justifyContent: "space-between",
                                },
                            }}
                        >
                            <Group gap="sm">
                                <Avatar
                                    src={user?.picture}
                                    radius="xl"
                                    size="sm"
                                    color="gray"
                                >
                                    {user?.name?.charAt(0) || "U"}
                                </Avatar>
                                <Box style={{ flex: 1, overflow: "hidden" }}>
                                    <Text size="sm" fw={600} truncate>
                                        {user?.name || t("guestUser")}
                                    </Text>
                                    <Text size="xs" c="dimmed" truncate>
                                        {user?.email || t("guestEmail")}
                                    </Text>
                                </Box>
                            </Group>
                        </Button>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Label>{t("account")}</Menu.Label>
                        <Menu.Item
                            leftSection={<IconUser size={16} stroke={1.5} />}
                        >
                            {t("profile")}
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconSettings size={16} stroke={1.5} />}
                        >
                            {t("settings")}
                        </Menu.Item>

                        <Menu.Divider />

                        <Menu.Item
                            component="a"
                            href="/auth/logout"
                            color="red"
                            leftSection={<IconLogout size={16} stroke={1.5} />}
                        >
                            {t("logout")}
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Box>
        </Box>
    );
}