"use client";

import { Button, Container, Group, Text, Burger, Drawer, Stack, Box, Divider, ScrollArea, ActionIcon, useMantineColorScheme } from "@mantine/core";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { usePathname, Link } from "@/src/shared/lib/i18n/navigation";
import { useTransition, useEffect, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";
import { IconSun, IconMoon } from "@tabler/icons-react";

export default function Navbar() {
    const t = useTranslations("navbar");
    const router = useRouter();
    const pathname = usePathname();
    const currentLocale = useLocale();
    const [isPending, startTransition] = useTransition();
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    useEffect(() => {
        closeDrawer();
    }, [pathname, closeDrawer]);

    const handleLanguageChange = useCallback((newLocale: string) => {
        if (newLocale !== currentLocale) {
            startTransition(() => {
                router.push(`/${newLocale}${pathname}`);
            });
        }
    }, [currentLocale, pathname, router]);

    const navLinks: Array<{
        href: '/' | '/projects' | '/about' | '/contact';
        label: string
    }> = [
        { href: "/", label: t("home") },
        { href: "/projects", label: t("projects") },
        { href: "/about", label: t("about") },
        { href: "/contact", label: t("contact") },
    ];

    const textColor = colorScheme === "dark"
        ? "var(--mantine-color-white)"
        : "var(--mantine-color-black)";

    const navigationButtons = (
        <Group gap="xs">
            {navLinks.map((link) => (
                <Button
                    key={link.href}
                    component={Link}
                    href={link.href}
                    variant="subtle"
                    radius="xl"
                    px="md"
                    style={{ color: textColor }}
                >
                    {link.label}
                </Button>
            ))}
        </Group>
    );

    const languageSelector = (
        <Group gap={4}>
            <Button
                onClick={() => handleLanguageChange("en")}
                disabled={isPending}
                variant="subtle"
                radius="xl"
                px="sm"
                aria-label="Switch to English"
                style={{
                    fontWeight: currentLocale === "en" ? 700 : 400,
                    color: currentLocale === "en" ? textColor : "var(--mantine-color-gray-7)",
                }}
            >
                EN
            </Button>
            <Text size="sm" c="gray.5">/</Text>
            <Button
                onClick={() => handleLanguageChange("fr")}
                disabled={isPending}
                variant="subtle"
                radius="xl"
                px="sm"
                aria-label="Switch to French"
                style={{
                    fontWeight: currentLocale === "fr" ? 700 : 400,
                    color: currentLocale === "fr" ? textColor : "var(--mantine-color-gray-7)",
                }}
            >
                FR
            </Button>
        </Group>
    );

    const themeToggle = (
        <ActionIcon
            onClick={() => toggleColorScheme()}
            variant="subtle"
            radius="xl"
            size="lg"
            aria-label="Toggle color scheme"
            style={{ color: textColor }}
        >
            {colorScheme === "dark" ? (
                <IconSun size={20} stroke={1.5} />
            ) : (
                <IconMoon size={20} stroke={1.5} />
            )}
        </ActionIcon>
    );

    return (
        <Box>
            <Box component="header" className={`navbarGlass ${theme}`}>
                <Container size="100%" py="md" px="xl">
                    <Group justify="space-between" align="center">
                        {/* Logo */}
                        <Text size="xl" fw={900} style={{ color: textColor }}>
                            LC
                        </Text>

                        {/* Center Navigation - Desktop Only */}
                        <Box
                            visibleFrom="md"
                            style={{
                                position: "absolute",
                                left: "50%",
                                transform: "translateX(-50%)",
                            }}
                        >
                            {navigationButtons}
                        </Box>

                        {/* Right Side Controls - Desktop Only */}
                        <Group gap="xs" visibleFrom="md">
                            {languageSelector}
                            {themeToggle}
                        </Group>

                        {/* Mobile Menu Button */}
                        <Burger
                            opened={drawerOpened}
                            onClick={toggleDrawer}
                            hiddenFrom="md"
                            aria-label="Toggle navigation"
                        />
                    </Group>
                </Container>
            </Box>

            {/* Mobile Drawer */}
            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                size="100%"
                padding="md"
                title={
                    <Text fw={700} size="lg">
                        Navigation
                    </Text>
                }
                hiddenFrom="md"
                zIndex={1000000}
            >
                <ScrollArea h="calc(100vh - 80px)" mx="-md">
                    <Divider my="sm" />

                    {/* Mobile Navigation Links */}
                    <Stack px="md" gap="xs">
                        {navLinks.map((link) => (
                            <Button
                                key={link.href}
                                component={Link}
                                href={link.href}
                                variant="subtle"
                                radius="xl"
                                fullWidth
                                justify="flex-start"
                                style={{ color: textColor }}
                            >
                                {link.label}
                            </Button>
                        ))}
                    </Stack>

                    <Divider my="sm" />

                    {/* Mobile Controls */}
                    <Stack px="md" gap="sm" pb="xl">
                        {languageSelector}
                        {themeToggle}
                    </Stack>
                </ScrollArea>
            </Drawer>
        </Box>
    );
}