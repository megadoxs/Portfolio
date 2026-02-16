"use client";

import { Modal, Stack, Button, Select, Text, Group, rem, Switch, TextInput, Box, Card } from "@mantine/core";
import { Dropzone, PDF_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { IconFileUpload, IconX, IconFileTypePdf } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { ResumeRequestModel } from "@/entities/resume";
import { useMantineColorScheme } from "@mantine/core";
import { useEffect } from "react";

interface ResumeModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (resume: ResumeRequestModel) => Promise<void>;
    isLoading?: boolean;
}

export default function ResumeModal({ opened, onClose, onSubmit, isLoading }: ResumeModalProps) {
    const t = useTranslations("resumes");
    const tlang = useTranslations("language");
    const { colorScheme } = useMantineColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    const form = useForm({
        initialValues: {
            name: "",
            locale: "en",
            file: null as File | null,
            active: true,
        },
        validate: {
            name: (value: string) => (!value?.trim() ? t("nameRequired") : null),
            locale: (value: string) => (!value ? t("localeRequired") : null),
            file: (value: File | null) => (!value ? t("fileRequired") : null),
        },
    });

    useEffect(() => {
        if (opened) {
            form.reset();
        }
    }, [opened]);

    const handleSubmit = async (values: typeof form.values) => {
        if (values.file) {
            await onSubmit({
                name: values.name.trim(),
                locale: values.locale,
                file: values.file,
                active: values.active,
            });
            handleClose();
        }
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    const handleFileSelect = (files: File[]) => {
        const selectedFile = files[0];
        form.setFieldValue("file", selectedFile);
        if (!form.values.name) {
            form.setFieldValue("name", selectedFile.name.replace(/\.[^/.]+$/, ""));
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={<Text fw={700} size="lg">{t("modalTitle")}</Text>}
            size="lg"
            centered
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
            styles={{
                content: {
                    backgroundColor: 'transparent',
                },
                header: {
                    backgroundColor: 'transparent',
                },
                body: {
                    padding: 0,
                    overflow: 'hidden',
                },
            }}
        >
            <Box className={`glowWrapper ${theme}`}>
                <Card className={`glassCard ${theme}`} p="xl" radius="md">
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Stack gap="md">
                            <Stack gap="xs">
                                <Text size="sm" fw={500}>
                                    {t("fileLabel")} <span style={{ color: "red" }}>*</span>
                                </Text>
                                <Dropzone
                                    onDrop={handleFileSelect}
                                    onReject={(files) => console.log("rejected files", files)}
                                    maxSize={5 * 1024 ** 2}
                                    accept={PDF_MIME_TYPE}
                                    multiple={false}
                                >
                                    <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: "none" }}>
                                        <Dropzone.Accept>
                                            <IconFileUpload
                                                style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-blue-6)" }}
                                                stroke={1.5}
                                            />
                                        </Dropzone.Accept>
                                        <Dropzone.Reject>
                                            <IconX
                                                style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-red-6)" }}
                                                stroke={1.5}
                                            />
                                        </Dropzone.Reject>
                                        <Dropzone.Idle>
                                            <IconFileTypePdf
                                                style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-dimmed)" }}
                                                stroke={1.5}
                                            />
                                        </Dropzone.Idle>

                                        <div>
                                            <Text size="xl" inline>
                                                {form.values.file ? form.values.file.name : t("dropzoneText")}
                                            </Text>
                                            <Text size="sm" c="dimmed" inline mt={7}>
                                                {t("dropzoneHint")}
                                            </Text>
                                        </div>
                                    </Group>
                                </Dropzone>
                            </Stack>

                            <TextInput
                                label={t("nameLabel")}
                                placeholder={t("namePlaceholder")}
                                {...form.getInputProps("name")}
                                required
                            />

                            <Select
                                label={t("localeLabel")}
                                placeholder={t("localePlaceholder")}
                                data={[
                                    { value: "en", label: tlang("english") },
                                    { value: "fr", label: tlang("french") },
                                ]}
                                {...form.getInputProps("locale")}
                                required
                            />

                            <Switch
                                label={t("activeLabel")}
                                description={t("activeDescription")}
                                {...form.getInputProps("active", { type: "checkbox" })}
                            />

                            <Group justify="flex-end" mt="md">
                                <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
                                    {t("cancelButton")}
                                </Button>
                                <Button
                                    type="submit"
                                    loading={isLoading}
                                >
                                    {t("submitButton")}
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                </Card>
            </Box>
        </Modal>
    );
}