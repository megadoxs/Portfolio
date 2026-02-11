"use client";

import { Box, Container, Grid, GridCol, Title, Text, Stack, useMantineColorScheme } from "@mantine/core";
import Image from "next/image";
import { useTranslations } from "next-intl";
import ProjectTimelinePage from "@/pages/home/projects/ProjectsPage";

export default function HomePage() {
    const t = useTranslations("home");
    const { colorScheme } = useMantineColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    return (
        <Box>
            {/* First Section - Hero */}
            <Box className="heroSection">
                <Container size="xl" py={80} style={{ width: '100%' }}>
                    <Grid align="center" gutter="xl">
                        <GridCol span={{ base: 12, md: 5 }}>
                            <Box className={`glowWrapper imageWrapper ${theme}`}>
                                <Box
                                    style={{
                                        position: "relative",
                                        width: "100%",
                                        aspectRatio: "1/1",
                                        borderRadius: "16px",
                                        overflow: "hidden",
                                    }}
                                >
                                    <Image
                                        src="/LouisCaron.jpeg"
                                        alt="Louis Caron"
                                        fill
                                        style={{ objectFit: "cover" }}
                                        priority
                                    />
                                </Box>
                            </Box>
                        </GridCol>

                        <GridCol span={{ base: 12, md: 7 }}>
                            <Stack gap="lg" className="heroContent">
                                <Title
                                    order={1}
                                    size="3.5rem"
                                    fw={900}
                                    style={{ lineHeight: 1.2 }}
                                >
                                    {t("title")}
                                </Title>

                                <Text size="xl" c="dimmed" fw={500}>
                                    {t("slogan")}
                                </Text>
                            </Stack>
                        </GridCol>
                    </Grid>
                </Container>
            </Box>

            {/* Second Section - Project Timeline */}
            <Box py={80}>
                <ProjectTimelinePage />
            </Box>
        </Box>
    );
}