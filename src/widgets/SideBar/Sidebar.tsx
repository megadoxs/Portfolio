"use client";

import {
    Box,
    Stack,
    Button,
    Text,
    Menu,
    Avatar,
    Group,
    useMantineColorScheme,
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
    IconDots,
    IconMail,
    IconChartBar
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useTranslations } from "next-intl";
import {Link} from "@/shared/lib/i18n/navigation";

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useUser();
    const t = useTranslations("sidebar");
    const { colorScheme } = useMantineColorScheme();

    const navItems = [
        { href: "/dashboard" as const, label: t("overview"), icon: IconChartBar },
        { href: "/dashboard/education" as const, label: t("education"), icon: IconSchool },
        { href: "/dashboard/work" as const, label: t("work"), icon: IconBriefcase },
        { href: "/dashboard/projects" as const, label: t("projects"), icon: IconTrophy },
        { href: "/dashboard/skills" as const, label: t("skills"), icon: IconCode },
        { href: "/dashboard/hobbies" as const, label: t("hobbies"), icon: IconHeart },
        { href: "/dashboard/testimonials" as const, label: t("testimonials"), icon: IconMessage },
        { href: "/dashboard/resume" as const, label: t("resume"), icon: IconFileText },
        { href: "/dashboard/contact" as const, label: t("contact"), icon: IconMail },
    ];

    const NAVBAR_HEIGHT = 73;

    return (
        <Box
            visibleFrom="sm"
            style={{
                width: 280,
                height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
                position: "fixed",
                left: 0,
                top: NAVBAR_HEIGHT,
                display: "flex",
                flexDirection: "column",
                backgroundColor: colorScheme === "dark"
                    ? "rgba(16, 17, 19, 0.3)"
                    : "rgba(255, 255, 255, 0.3)",
                backdropFilter: "saturate(180%) blur(20px)",
                WebkitBackdropFilter: "saturate(180%) blur(20px)",
            }}
        >
            <Box p="md">
                <Group justify="space-between" align="center">
                    <Text
                        size="xl"
                        fw={900}
                        style={{
                            color: colorScheme === "dark" ? "var(--mantine-color-white)" : "var(--mantine-color-black)",
                        }}
                    >
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
                                    color: colorScheme === "dark"
                                        ? "var(--mantine-color-white)"
                                        : "var(--mantine-color-black)",
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

            <Box p="md">
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
                                        {user?.name}
                                    </Text>
                                    <Text size="xs" c="dimmed" truncate>
                                        {user?.email}
                                    </Text>
                                </Box>
                            </Group>
                        </Button>
                    </Menu.Target>

                    <Menu.Dropdown>
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