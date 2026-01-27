import { Box, Container, Grid, GridCol, Title, Text, Stack } from "@mantine/core";
import Image from "next/image";
import {useTranslations} from "next-intl";

export default function HomePage() {
    const t = useTranslations("home");

    return (
        <Box>
            <Container size="lg" py={80}>
                <Grid align="center" gutter="xl">
                    <GridCol span={{ base: 12, md: 5 }}>
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
                    </GridCol>

                    <GridCol span={{ base: 12, md: 7 }}>
                        <Stack gap="lg">
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
    );
}