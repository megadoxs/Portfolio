"use client";

import { Modal, Stack, Button, Select, Text, Group, rem, Switch, TextInput } from "@mantine/core";
import { Dropzone, PDF_MIME_TYPE } from "@mantine/dropzone";
import { useState } from "react";
import { IconFileUpload, IconX, IconFileTypePdf } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {ResumeRequestModel} from "@/entities/resume";

interface ResumeModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (resume: ResumeRequestModel) => Promise<void>;
    isLoading?: boolean;
}

export default function ResumeModal({ opened, onClose, onSubmit, isLoading }: ResumeModalProps) {
    const t = useTranslations("resumes");
    const tlang = useTranslations("language")
    const [locale, setLocale] = useState<string | null>("en");
    const [file, setFile] = useState<File | null>(null);
    const [active, setActive] = useState<boolean>(true);
    const [name, setName] = useState<string>("");

    const handleSubmit = async () => {
        if (locale && file && name.trim()) {
            await onSubmit({ name: name.trim(), locale, file, active });
            handleClose();
        }
    };

    const handleClose = () => {
        setLocale("en");
        setFile(null);
        setActive(true);
        setName("");
        onClose();
    };

    const handleFileSelect = (files: File[]) => {
        const selectedFile = files[0];
        setFile(selectedFile);
        // Auto-populate name field with filename (without extension) if name is empty
        if (!name) {
            setName(selectedFile.name.replace(/\.[^/.]+$/, ""));
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={t("modalTitle")}
            size="lg"
        >
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
                                    {file ? file.name : t("dropzoneText")}
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
                    value={name}
                    onChange={(event) => setName(event.currentTarget.value)}
                    required
                />

                <Select
                    label={t("localeLabel")}
                    placeholder={t("localePlaceholder")}
                    data={[
                        { value: "en", label:  tlang("english") },
                        { value: "fr", label: tlang("french") },
                    ]}
                    value={locale}
                    onChange={setLocale}
                    required
                />

                <Switch
                    label={t("activeLabel")}
                    description={t("activeDescription")}
                    checked={active}
                    onChange={(event) => setActive(event.currentTarget.checked)}
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
                        {t("cancelButton")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!locale || !file || !name.trim()}
                        loading={isLoading}
                    >
                        {t("submitButton")}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}