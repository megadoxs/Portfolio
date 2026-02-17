"use client";

import { Modal, Stack, Button, Text, Group, rem, TextInput, Box, Slider, ActionIcon, Card } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { useState, useRef } from "react";
import { IconFileUpload, IconX, IconPhoto, IconRotateClockwise } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { HobbyRequestModel } from "@/entities/hobby";
import { useMantineColorScheme } from "@mantine/core";
import AvatarEditor from "react-avatar-editor";
import {useTranslate} from "@/shared/lib/translate/useTranslate";

interface HobbyModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (hobby: HobbyRequestModel) => Promise<void>;
    isLoading?: boolean;
}

export default function HobbyModal({ opened, onClose, onSubmit, isLoading }: HobbyModalProps) {
    const t = useTranslations("hobbies");
    const { colorScheme } = useMantineColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';
    const editorRef = useRef<AvatarEditor>(null);
    const { translateFields, isTranslating } = useTranslate();

    const [file, setFile] = useState<File | null>(null);
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);

    const form = useForm<{ name: string }>({
        initialValues: { name: "" },
        validate: {
            name: (value: string) => (!value?.trim() ? t("nameRequired") : null),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        if (file && editorRef.current) {
            const canvas = editorRef.current.getImageScaledToCanvas();
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const translated = await translateFields({ name: values.name.trim() });
                    const croppedFile = new File([blob], file.name, { type: file.type });

                    await onSubmit({
                        name_en: translated.name_en as string,
                        name_fr: translated.name_fr as string,
                        file: croppedFile,
                    });
                    handleClose();
                }
            });
        }
    };

    const handleClose = () => {
        form.reset();
        setFile(null);
        setScale(1);
        setRotate(0);
        onClose();
    };

    const handleFileSelect = (files: File[]) => {
        setFile(files[0]);
        setScale(1);
        setRotate(0);
    };

    const handleRotate = () => {
        setRotate((prev) => (prev + 90) % 360);
    };

    const isBusy = isLoading || isTranslating;

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={<Text fw={700} size="lg">{t("modalTitle")}</Text>}
            size="lg"
            centered
            overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
            styles={{
                content: { backgroundColor: 'transparent' },
                header: { backgroundColor: 'transparent' },
                body: { padding: 0, overflow: 'hidden' },
            }}
        >
            <Box className={`glowWrapper ${theme}`}>
                <Card className={`glassCard ${theme}`} p="xl" radius="md">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        form.validate();
                        if (form.isValid()) {
                            handleSubmit(form.values);
                        }
                    }}>
                        <Stack gap="md">
                            <Stack gap="xs">
                                <Text size="sm" fw={500}>
                                    {t("imageLabel")} <span style={{ color: "red" }}>*</span>
                                </Text>

                                {!file ? (
                                    <Dropzone
                                        onDrop={handleFileSelect}
                                        onReject={(files) => console.log("rejected files", files)}
                                        maxSize={5 * 1024 ** 2}
                                        accept={IMAGE_MIME_TYPE}
                                        multiple={false}
                                    >
                                        <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: "none" }}>
                                            <Dropzone.Accept>
                                                <IconFileUpload style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-blue-6)" }} stroke={1.5} />
                                            </Dropzone.Accept>
                                            <Dropzone.Reject>
                                                <IconX style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-red-6)" }} stroke={1.5} />
                                            </Dropzone.Reject>
                                            <Dropzone.Idle>
                                                <IconPhoto style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-dimmed)" }} stroke={1.5} />
                                            </Dropzone.Idle>
                                            <div>
                                                <Text size="xl" inline>{t("dropzoneText")}</Text>
                                                <Text size="sm" c="dimmed" inline mt={7}>{t("dropzoneHint")}</Text>
                                            </div>
                                        </Group>
                                    </Dropzone>
                                ) : (
                                    <Stack gap="md">
                                        <Box style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            <AvatarEditor
                                                ref={editorRef}
                                                image={file}
                                                width={200}
                                                height={200}
                                                border={20}
                                                borderRadius={100}
                                                color={[0, 0, 0, 0.6]}
                                                scale={scale}
                                                rotate={rotate}
                                            />
                                        </Box>
                                        <Stack gap="xs">
                                            <Group justify="space-between">
                                                <Text size="sm" fw={500}>{t("zoom") || "Zoom"}</Text>
                                                <ActionIcon variant="subtle" onClick={handleRotate} aria-label="Rotate">
                                                    <IconRotateClockwise size={18} />
                                                </ActionIcon>
                                            </Group>
                                            <Slider
                                                value={scale}
                                                onChange={setScale}
                                                min={0.5}
                                                max={3}
                                                step={0.1}
                                                marks={[
                                                    { value: 0.5, label: "0.5x" },
                                                    { value: 1, label: "1x" },
                                                    { value: 2, label: "2x" },
                                                    { value: 3, label: "3x" },
                                                ]}
                                            />
                                        </Stack>
                                        <Button variant="subtle" size="xs" onClick={() => setFile(null)} fullWidth>
                                            {t("changeImage") || "Change image"}
                                        </Button>
                                    </Stack>
                                )}
                            </Stack>

                            <TextInput
                                label={t("nameLabel")}
                                placeholder={t("namePlaceholder")}
                                {...form.getInputProps("name")}
                                required
                            />

                            <Group justify="flex-end" mt="md">
                                <Button variant="subtle" onClick={handleClose} disabled={isBusy}>
                                    {t("cancelButton")}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!form.values.name.trim() || !file}
                                    loading={isBusy}
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