"use client";

import { Button, Container, Group, Text, Burger, Drawer, Stack, Box, Divider, ScrollArea, ActionIcon, useMantineColorScheme, Menu, Collapse } from "@mantine/core";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { usePathname, Link } from "@/src/shared/lib/i18n/navigation";
import { useTransition, useEffect, useCallback, useRef, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { IconSun, IconMoon, IconChevronDown, IconCode, IconBriefcase, IconSchool, IconHeart, IconMessage, IconTrophy, IconChartBar, IconFileText, IconMail, IconLogout } from "@tabler/icons-react";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Navbar() {
    const t = useTranslations("navbar");
    const tSidebar = useTranslations("sidebar");
    const router = useRouter();
    const pathname = usePathname();
    const currentLocale = useLocale();
    const [isPending, startTransition] = useTransition();
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const { user } = useUser();
    const [aboutOpened, setAboutOpened] = useState(false);

    const isLockedRef = useRef(false);
    const targetSectionRef = useRef<string | null>(null);
    const rafRef = useRef<number | null>(null);
    const lockStartTimeRef = useRef<number>(0);

    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    // Check if we're on a dashboard page
    const isDashboardPage = pathname.startsWith('/dashboard');

    // Dashboard navigation items
    const dashboardNavItems = [
        { href: "/dashboard" as const, label: tSidebar("overview"), icon: IconChartBar },
        { href: "/dashboard/education" as const, label: tSidebar("education"), icon: IconSchool },
        { href: "/dashboard/work" as const, label: tSidebar("work"), icon: IconBriefcase },
        { href: "/dashboard/projects" as const, label: tSidebar("projects"), icon: IconTrophy },
        { href: "/dashboard/skills" as const, label: tSidebar("skills"), icon: IconCode },
        { href: "/dashboard/hobbies" as const, label: tSidebar("hobbies"), icon: IconHeart },
        { href: "/dashboard/testimonials" as const, label: tSidebar("testimonials"), icon: IconMessage },
        { href: "/dashboard/resume" as const, label: tSidebar("resume"), icon: IconFileText },
        { href: "/dashboard/contact" as const, label: tSidebar("contact"), icon: IconMail },
    ];

    useEffect(() => {
        closeDrawer();
    }, [pathname, closeDrawer]);

    // ONLY handle hash on page load when coming from another page
    useEffect(() => {
        const handleHashOnLoad = () => {
            const hash = window.location.hash;
            console.log('Page loaded, hash:', hash);

            if (hash) {
                const sectionId = hash.substring(1);
                targetSectionRef.current = sectionId;
                isLockedRef.current = true;
                lockStartTimeRef.current = Date.now();

                console.log('Starting lock for:', sectionId);

                const scrollAndLock = () => {
                    const element = document.getElementById(sectionId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });

                        setTimeout(() => {
                            const lockLoop = () => {
                                // Stop after 5 seconds max
                                const elapsed = Date.now() - lockStartTimeRef.current;
                                if (elapsed > 5000) {
                                    console.log('Lock timeout - stopping after 5 seconds');
                                    isLockedRef.current = false;
                                    targetSectionRef.current = null;
                                    if (rafRef.current) {
                                        cancelAnimationFrame(rafRef.current);
                                        rafRef.current = null;
                                    }
                                    return;
                                }

                                if (!isLockedRef.current || !targetSectionRef.current) {
                                    console.log('Lock stopped');
                                    return;
                                }

                                const el = document.getElementById(targetSectionRef.current);
                                if (el) {
                                    const rect = el.getBoundingClientRect();

                                    if (Math.abs(rect.top) > 0.1) {
                                        window.scrollTo({
                                            top: window.scrollY + rect.top,
                                            behavior: 'auto'
                                        });
                                        console.log('Adjusted - drift:', rect.top);
                                    }
                                }

                                rafRef.current = requestAnimationFrame(lockLoop);
                            };
                            lockLoop();
                        }, 600);
                    } else {
                        console.log('Element not found yet:', sectionId);
                        setTimeout(scrollAndLock, 100);
                    }
                };

                scrollAndLock();
            }
        };

        handleHashOnLoad();

        const timeouts = [
            setTimeout(handleHashOnLoad, 100),
            setTimeout(handleHashOnLoad, 300),
            setTimeout(handleHashOnLoad, 500),
            setTimeout(handleHashOnLoad, 1000)
        ];

        return () => {
            timeouts.forEach(clearTimeout);
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [pathname]);

    // Detect user scroll and unlock
    useEffect(() => {
        const unlock = () => {
            console.log('User scroll detected - unlocking');
            isLockedRef.current = false;
            targetSectionRef.current = null;
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };

        const handleInteraction = () => {
            if (isLockedRef.current) {
                unlock();
            }
        };

        window.addEventListener('wheel', handleInteraction, { passive: true });
        window.addEventListener('touchstart', handleInteraction, { passive: true });
        window.addEventListener('touchmove', handleInteraction, { passive: true });
        window.addEventListener('keydown', (e) => {
            const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' ', 'Home', 'End'];
            if (scrollKeys.includes(e.key) && isLockedRef.current) {
                unlock();
            }
        });

        return () => {
            window.removeEventListener('wheel', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('touchmove', handleInteraction);
        };
    }, []);

    const handleLanguageChange = useCallback((newLocale: string) => {
        if (newLocale !== currentLocale) {
            startTransition(() => {
                const hash = window.location.hash;
                router.push(`/${newLocale}${pathname}${hash}`);
            });
        }
    }, [currentLocale, pathname, router]);

    const scrollToSection = (sectionId: string) => {
        if (pathname === '/') {
            // Already on home page - just scroll, DON'T lock
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                window.history.pushState(null, '', `#${sectionId}`);
            }
        } else {
            // Navigating from another page - use window.location to preserve hash
            window.location.href = `/${currentLocale}#${sectionId}`;
        }
        closeDrawer();
    };

    const handleHomeClick = () => {
        if (pathname === '/') {
            window.history.pushState(null, '', window.location.pathname);

            const homeElement = document.getElementById('home');
            if (homeElement) {
                homeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            router.push('/');
        }
        closeDrawer();
    };

    const aboutSections = [
        { id: 'skills', label: t("sections.skills"), icon: <IconCode size={16} /> },
        { id: 'work', label: t("sections.work"), icon: <IconBriefcase size={16} /> },
        { id: 'education', label: t("sections.education"), icon: <IconSchool size={16} /> },
        { id: 'hobbies', label: t("sections.hobbies"), icon: <IconHeart size={16} /> },
        { id: 'testimonials', label: t("sections.testimonials"), icon: <IconMessage size={16} /> },
    ];

    const textColor = colorScheme === "dark"
        ? "var(--mantine-color-white)"
        : "var(--mantine-color-black)";

    const navigationButtons = (
        <Group gap="xs">
            <Button
                onClick={handleHomeClick}
                variant="subtle"
                radius="xl"
                px="md"
                style={{ color: textColor }}
            >
                {t("home")}
            </Button>

            <Button
                onClick={() => scrollToSection('projects')}
                variant="subtle"
                radius="xl"
                px="md"
                style={{ color: textColor }}
            >
                {t("projects")}
            </Button>

            <Menu
                shadow="md"
                width={200}
                styles={{
                    dropdown: {
                        backgroundColor: theme === 'dark'
                            ? 'rgba(26, 27, 30, 0.85)'
                            : 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(10px)',
                        border: theme === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '12px',
                    },
                }}
            >
                <Menu.Target>
                    <Button
                        variant="subtle"
                        radius="xl"
                        px="md"
                        rightSection={<IconChevronDown size={16} />}
                        style={{ color: textColor }}
                    >
                        {t("about")}
                    </Button>
                </Menu.Target>

                <Menu.Dropdown>
                    {aboutSections.map((section) => (
                        <Menu.Item
                            key={section.id}
                            leftSection={section.icon}
                            onClick={() => scrollToSection(section.id)}
                        >
                            {section.label}
                        </Menu.Item>
                    ))}
                </Menu.Dropdown>
            </Menu>

            <Button
                onClick={() => scrollToSection('contact')}
                variant="subtle"
                radius="xl"
                px="md"
                style={{ color: textColor }}
            >
                {t("contact")}
            </Button>
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
                        <Button
                            onClick={handleHomeClick}
                            variant="subtle"
                            p={0}
                            style={{ color: textColor }}
                        >
                            <Text size="xl" fw={900}>
                                LC
                            </Text>
                        </Button>

                        <Box
                            visibleFrom="sm"
                            style={{
                                position: "absolute",
                                left: "50%",
                                transform: "translateX(-50%)",
                            }}
                        >
                            {navigationButtons}
                        </Box>

                        <Group gap="xs" visibleFrom="sm">
                            {languageSelector}
                            {themeToggle}
                        </Group>

                        <Burger
                            opened={drawerOpened}
                            onClick={toggleDrawer}
                            hiddenFrom="sm"
                            aria-label="Toggle navigation"
                        />
                    </Group>
                </Container>
            </Box>

            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                size="100%"
                padding="md"
                position="left"
                title={
                    <Text fw={700} size="lg">
                        Navigation
                    </Text>
                }
                hiddenFrom="sm"
                zIndex={1000000}
            >
                <ScrollArea h="calc(100vh - 80px)" mx="-md">
                    <Divider my="sm" />

                    <Stack px="md" gap="xs">
                        {isDashboardPage && (
                            <>
                                {/* Dashboard Navigation Section */}
                                <Text size="sm" fw={600} mt="xs" mb="xs" c="dimmed">
                                    {tSidebar("dashboard")}
                                </Text>
                                {dashboardNavItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;

                                    return (
                                        <Button
                                            key={item.href}
                                            component={Link}
                                            href={item.href}
                                            onClick={closeDrawer}
                                            variant={isActive ? "light" : "subtle"}
                                            justify="flex-start"
                                            leftSection={<Icon size={20} stroke={1.5} />}
                                            radius="md"
                                            fullWidth
                                            style={{
                                                fontWeight: isActive ? 600 : 400,
                                                color: textColor,
                                            }}
                                        >
                                            {item.label}
                                        </Button>
                                    );
                                })}

                                {user && (
                                    <Button
                                        component="a"
                                        href="/auth/logout"
                                        variant="subtle"
                                        color="red"
                                        justify="flex-start"
                                        leftSection={<IconLogout size={20} stroke={1.5} />}
                                        radius="md"
                                        fullWidth
                                    >
                                        {tSidebar("logout")}
                                    </Button>
                                )}

                                <Divider my="sm" />

                                {/* Main Navigation Section Header */}
                                <Text size="sm" fw={600} mb="xs" c="dimmed">
                                    Main Site
                                </Text>
                            </>
                        )}

                        {/* Regular Navigation - Always Shown */}
                        <Button
                            onClick={handleHomeClick}
                            variant="subtle"
                            radius="xl"
                            fullWidth
                            justify="flex-start"
                            style={{ color: textColor }}
                        >
                            {t("home")}
                        </Button>

                        <Button
                            onClick={() => scrollToSection('projects')}
                            variant="subtle"
                            radius="xl"
                            fullWidth
                            justify="flex-start"
                            style={{ color: textColor }}
                        >
                            {t("projects")}
                        </Button>

                        {/* Collapsible About Section */}
                        <Box>
                            <Button
                                onClick={() => setAboutOpened(!aboutOpened)}
                                variant="subtle"
                                radius="xl"
                                fullWidth
                                justify="space-between"
                                rightSection={
                                    <IconChevronDown
                                        size={16}
                                        style={{
                                            transform: aboutOpened ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 200ms ease'
                                        }}
                                    />
                                }
                                style={{ color: textColor }}
                            >
                                {t("about")}
                            </Button>

                            <Collapse in={aboutOpened}>
                                <Stack gap="xs" mt="xs" pl="md">
                                    {aboutSections.map((section) => (
                                        <Button
                                            key={section.id}
                                            onClick={() => scrollToSection(section.id)}
                                            variant="subtle"
                                            radius="xl"
                                            fullWidth
                                            justify="flex-start"
                                            leftSection={section.icon}
                                            style={{ color: textColor }}
                                        >
                                            {section.label}
                                        </Button>
                                    ))}
                                </Stack>
                            </Collapse>
                        </Box>

                        <Button
                            onClick={() => scrollToSection('contact')}
                            variant="subtle"
                            radius="xl"
                            fullWidth
                            justify="flex-start"
                            style={{ color: textColor }}
                        >
                            {t("contact")}
                        </Button>
                    </Stack>

                    <Divider my="sm" />

                    <Box px="md" pb="xl">
                        <Group justify="space-between" align="center">
                            {languageSelector}
                            {themeToggle}
                        </Group>
                    </Box>
                </ScrollArea>
            </Drawer>
        </Box>
    );
}