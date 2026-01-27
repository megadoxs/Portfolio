"use client";

import {Button, Container, Group, Text, Burger, Drawer, Stack, Box, Divider, ScrollArea, Menu} from "@mantine/core";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {Link, usePathname} from "@/src/shared/lib/i18n/navigation";
import { useTransition, useEffect, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";
import Image from "next/image";
import {useUser} from "@auth0/nextjs-auth0";
import {IconChevronDown} from "@tabler/icons-react";

const locales = [
    { image: "/english.png", locale: "en", alt: "English", label: "EN" },
    { image: "/french.png", locale: "fr", alt: "Français", label: "FR" },
];

export default function NavBar() {
    const locale = useLocale();
    const t = useTranslations("navbar");
    const router = useRouter();
    const pathname = usePathname();
    const currentLocale = useLocale();
    const [isPending, startTransition] = useTransition();
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
    const { user } = useUser();

    useEffect(() => {
        closeDrawer();
    }, [pathname, closeDrawer]);

    const handleToggle = useCallback(() => {
        const nextLocale = currentLocale === "en" ? "fr" : "en";

        startTransition(() => {
            router.push(`/${nextLocale}${pathname}`);
        });
    }, [currentLocale, pathname, router]);

    const current = locales.find((item) => item.locale === currentLocale) || locales[0];

    const languageButton = (
        <Button
            onClick={handleToggle}
            disabled={isPending}
            variant="subtle"
            radius="xl"
            px="sm"
            aria-label="Switch language"
        >
            <Group gap={6}>
                <Image src={current.image} width={20} height={20} alt={current.alt} />
                <Text size="sm" fw={600}>
                    {current.label}
                </Text>
            </Group>
        </Button>
    );

    const userMenu = user && (
        <Menu shadow="md" width={200} withinPortal={false}>
            <Menu.Target>
                <Button
                    variant="outline"
                    radius="xl"
                    rightSection={<IconChevronDown size={16} />}
                >
                    {user.nickname || user.name || "User"}
                </Button>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Item component={Link} href="/dashboard">
                    {t("dashboard")}
                </Menu.Item>
                <Menu.Item component="a" href="/auth/logout" color="red">
                    {t("logout")}
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    return (
        <Box>
            <Box
                component="header"
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1000,
                    width: "100%",
                    background: "var(--mantine-color-body)",
                    borderBottom: "1px solid var(--mantine-color-gray-3)",
                }}
            >
                <Container size="lg" py="md">
                    <Group justify="space-between" align="center">
                        <Text size="xl" fw={900} c="blue.6">
                            LC
                        </Text>

                        <Group gap="xs" visibleFrom="md">
                            {languageButton}
                            { user ?
                                userMenu
                                :
                                <a href={`/auth/login?ui_locales=${locale}`} style={{ textDecoration: "none" }}>
                                    <Button variant="filled" color="blue.8" radius="xl">
                                        {t("login")}
                                    </Button>
                                </a>
                            }
                        </Group>

                        <Burger
                            opened={drawerOpened}
                            onClick={toggleDrawer}
                            hiddenFrom="md"
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

                    <Divider my="sm" />

                    <Stack px="md" gap="sm" pb="xl">
                        {languageButton}
                        { user ?
                            userMenu
                            :
                            <a href={`/auth/login?ui_locales=${locale}`} style={{ textDecoration: "none" }}>
                                <Button variant="filled" color="blue.8" radius="xl">
                                    {t("login")}
                                </Button>
                            </a>
                        }
                    </Stack>
                </ScrollArea>
            </Drawer>
        </Box>
    );
}