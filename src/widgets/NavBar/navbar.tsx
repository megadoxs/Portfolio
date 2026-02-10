"use client";

import {Button, Container, Group, Text, Burger, Drawer, Stack, Box, Divider, ScrollArea, ActionIcon, useMantineColorScheme} from "@mantine/core";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { usePathname, Link } from "@/src/shared/lib/i18n/navigation";
import { useTransition, useEffect, useCallback, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import {IconSun, IconMoon, IconDownload} from "@tabler/icons-react";
import {getActiveResumeByLocale} from "@/entities/resume";

export default function NavBar() {
    const t = useTranslations("navbar");
    const router = useRouter();
    const pathname = usePathname();
    const currentLocale = useLocale();
    const [isPending, startTransition] = useTransition();
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const [hasActiveResume, setHasActiveResume] = useState(false);
    const [isLoadingResume, setIsLoadingResume] = useState(true);

    // Check for active resume when locale changes
    useEffect(() => {
        const checkActiveResume = async () => {
            setIsLoadingResume(true);
            try {
                const resume = await getActiveResumeByLocale(currentLocale);
                setHasActiveResume(!!resume);
            } catch (error) {
                console.error("Error fetching active resume:", error);
                setHasActiveResume(false);
            } finally {
                setIsLoadingResume(false);
            }
        };

        checkActiveResume();
    }, [currentLocale]);

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

    const handleDownloadResume = useCallback(async () => {
        try {
            const resume = await getActiveResumeByLocale(currentLocale);
            if (resume?.url) {
                window.open(resume.url, '_blank');
            }
        } catch (error) {
            console.error("Error downloading Resume:", error);
        }
    }, [currentLocale]);

    const navLinks: Array<{
        href: '/' | '/projects' | '/about' | '/contact';
        label: string
    }> = [
        { href: "/", label: t("home") },
        { href: "/projects", label: t("projects") },
        { href: "/about", label: t("about") },
        { href: "/contact", label: t("contact") },
    ];

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
                    style={{
                        color: colorScheme === "dark" ? "var(--mantine-color-white)" : "var(--mantine-color-black)",
                    }}
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
                    color: currentLocale === "en"
                        ? (colorScheme === "dark" ? "var(--mantine-color-white)" : "var(--mantine-color-black)")
                        : "var(--mantine-color-gray-7)",
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
                    color: currentLocale === "fr"
                        ? (colorScheme === "dark" ? "var(--mantine-color-white)" : "var(--mantine-color-black)")
                        : "var(--mantine-color-gray-7)",
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
            style={{
                color: colorScheme === "dark" ? "var(--mantine-color-white)" : "var(--mantine-color-black)",
            }}
        >
            {colorScheme === "dark" ? (
                <IconSun size={20} stroke={1.5} />
            ) : (
                <IconMoon size={20} stroke={1.5} />
            )}
        </ActionIcon>
    );

    const downloadResumeButton = !isLoadingResume && hasActiveResume ? (
        <Button
            onClick={handleDownloadResume}
            variant="light"
            radius="xl"
            leftSection={<IconDownload size={16} />}
            px="md"
        >
            {t("resume")}
        </Button>
    ) : null;

    return (
        <Box>
            <Box
                component="header"
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    width: "100%",
                    background: "var(--mantine-color-body)",
                    borderBottom: "1px solid var(--mantine-color-gray-3)",
                }}
            >
                <Container size="100%" py="md" px="xl">
                    <Group justify="space-between" align="center">
                        {/* Logo and Resume Button */}
                        <Group gap="xl">
                            <Text
                                size="xl"
                                fw={900}
                                style={{
                                    color: colorScheme === "dark" ? "var(--mantine-color-white)" : "var(--mantine-color-black)",
                                }}
                            >
                                LC
                            </Text>
                            {downloadResumeButton}
                        </Group>

                        {/* Center Navigation - Desktop Only */}
                        <Group gap="xs" visibleFrom="md">
                            {navigationButtons}
                        </Group>

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
                                style={{
                                    color: colorScheme === "dark" ? "var(--mantine-color-white)" : "var(--mantine-color-black)",
                                }}
                            >
                                {link.label}
                            </Button>
                        ))}
                    </Stack>

                    <Divider my="sm" />

                    {/* Mobile Resume Download Button */}
                    {downloadResumeButton && (
                        <>
                            <Box px="md" pb="sm">
                                {downloadResumeButton}
                            </Box>
                            <Divider my="sm" />
                        </>
                    )}

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