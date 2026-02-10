"use client";

import { Modal, Stack, Button, Text, Group, rem, TextInput, Box, Slider, ActionIcon } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useState, useRef } from "react";
import { IconFileUpload, IconX, IconPhoto, IconRotateClockwise } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { HobbyRequestModel } from "@/entities/hobby";
import AvatarEditor from "react-avatar-editor";

interface HobbyModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (hobby: HobbyRequestModel) => Promise<void>;
    isLoading?: boolean;
}

export default function HobbyModal({ opened, onClose, onSubmit, isLoading }: HobbyModalProps) {
    const t = useTranslations("hobbies");
    const editorRef = useRef<AvatarEditor>(null);

    const [name, setName] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);

    const handleSubmit = async () => {
        if (name.trim() && file && editorRef.current) {
            // Get the cropped image as a blob
            const canvas = editorRef.current.getImageScaledToCanvas();
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const croppedFile = new File([blob], file.name, { type: file.type });
                    await onSubmit({ name: name.trim(), file: croppedFile });
                    handleClose();
                }
            });
        }
    };

    const handleClose = () => {
        setName("");
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
                                    <IconPhoto
                                        style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-dimmed)" }}
                                        stroke={1.5}
                                    />
                                </Dropzone.Idle>

                                <div>
                                    <Text size="xl" inline>
                                        {t("dropzoneText")}
                                    </Text>
                                    <Text size="sm" c="dimmed" inline mt={7}>
                                        {t("dropzoneHint")}
                                    </Text>
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
                                    <Text size="sm" fw={500}>
                                        {t("zoom") || "Zoom"}
                                    </Text>
                                    <ActionIcon
                                        variant="subtle"
                                        onClick={handleRotate}
                                        aria-label="Rotate"
                                    >
                                        <IconRotateClockwise size={18} />
                                    </ActionIcon>
                                </Group>
                                <Slider
                                    value={scale}
                                    onChange={setScale}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    marks={[
                                        { value: 1, label: "1x" },
                                        { value: 2, label: "2x" },
                                        { value: 3, label: "3x" },
                                    ]}
                                />
                            </Stack>

                            <Box mt="md">
                                <Button
                                    variant="subtle"
                                    size="xs"
                                    onClick={() => setFile(null)}
                                    fullWidth
                                >
                                    {t("changeImage") || "Change image"}
                                </Button>
                            </Box>
                        </Stack>
                    )}
                </Stack>

                <TextInput
                    label={t("nameLabel")}
                    placeholder={t("namePlaceholder")}
                    value={name}
                    onChange={(event) => setName(event.currentTarget.value)}
                    required
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
                        {t("cancelButton")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!name.trim() || !file}
                        loading={isLoading}
                    >
                        {t("submitButton")}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}