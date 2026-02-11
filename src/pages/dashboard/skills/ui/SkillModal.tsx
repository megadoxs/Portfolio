"use client";

import { Modal, Stack, Button, Text, Group, TextInput, Select, rem, Box, Slider, ActionIcon } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useState, useRef, useEffect } from "react";
import { IconFileUpload, IconX, IconPhoto, IconRotateClockwise } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { SkillRequestModel, SkillCategory, Skill } from "@/entities/skill";
import AvatarEditor from "react-avatar-editor";
import Image from "next/image";

interface SkillModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (skill: SkillRequestModel) => Promise<void>;
    isLoading?: boolean;
    skill?: Skill | null;
}

export default function SkillModal({ opened, onClose, onSubmit, isLoading, skill }: SkillModalProps) {
    const t = useTranslations("skills");
    const editorRef = useRef<AvatarEditor>(null);

    const [name, setName] = useState("");
    const [category, setCategory] = useState<SkillCategory | "">("");
    const [file, setFile] = useState<File | null>(null);
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [previewIconUrl, setPreviewIconUrl] = useState<string>("");
    const openRef = useRef<() => void>(null);

    const normalizeSkillName = (skillName: string): string => {
        return skillName.toLowerCase()
            .replace(/\s+/g, '')
            .replace('c++', 'cpp')
            .replace('c#', 'cs')
            .replace('.net', 'dotnet')
            .replace('node.js', 'nodejs')
            .replace('next.js', 'nextjs')
            .replace('vue.js', 'vue')
            .replace('typescript', 'ts')
            .replace('javascript', 'js');
    };

    const getSkillIconUrl = (skillName: string): string => {
        const normalized = normalizeSkillName(skillName);
        return `https://skillicons.dev/icons?i=${normalized}`;
    };

    // Load skill data when editing
    useEffect(() => {
        if (skill) {
            setName(skill.name);
            setCategory(skill.category);
            setPreviewIconUrl(skill.icon || getSkillIconUrl(skill.name));
            // Note: For edit mode, we can't pre-load the file from the URL
            // User will need to re-upload if they want to change the icon
        } else {
            setName("");
            setCategory("");
            setFile(null);
            setScale(1);
            setRotate(0);
            setPreviewIconUrl("");
        }
    }, [skill]);

    // Debounce icon URL generation
    useEffect(() => {
        if (!name.trim()) {
            setPreviewIconUrl("");
            return;
        }

        const timer = setTimeout(() => {
            if (!skill?.icon) {
                setPreviewIconUrl(getSkillIconUrl(name));
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [name, skill]);

    const categoryOptions = [
        { value: "LANGUAGE", label: t("category.language") },
        { value: "FRAMEWORK", label: t("category.framework") },
        { value: "SOFTWARE", label: t("category.software") },
        { value: "DATABASE", label: t("category.database") },
    ];

    const handleSubmit = async () => {
        if (name.trim() && category) {
            if (file && editorRef.current) {
                // If there's a new file, crop it
                const canvas = editorRef.current.getImageScaledToCanvas();
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        const croppedFile = new File([blob], file.name, { type: file.type });
                        await onSubmit({
                            name: name.trim(),
                            category: category as SkillCategory,
                            icon: croppedFile,
                        });
                        handleClose();
                    }
                });
            } else {
                // No file uploaded - use auto-generated icon or keep existing
                await onSubmit({
                    name: name.trim(),
                    category: category as SkillCategory,
                    icon: null, // Will use auto-generated icon or keep existing
                });
                handleClose();
            }
        }
    };

    const handleClose = () => {
        setName("");
        setCategory("");
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
            title={skill ? t("editModalTitle") : t("modalTitle")}
            size="lg"
        >
            <Stack gap="md">
                <TextInput
                    label={t("nameLabel")}
                    placeholder={t("namePlaceholder")}
                    value={name}
                    onChange={(event) => setName(event.currentTarget.value)}
                    required
                />

                <Select
                    label={t("categoryLabel")}
                    placeholder={t("categoryPlaceholder")}
                    value={category}
                    onChange={(value) => setCategory(value as SkillCategory)}
                    data={categoryOptions}
                    required
                />

                <Stack gap="xs">
                    <Text size="sm" fw={500}>
                        {t("iconLabel")}
                    </Text>

                    {!file ? (
                        <Dropzone
                            onDrop={handleFileSelect}
                            onReject={(files) => console.log("rejected files", files)}
                            maxSize={5 * 1024 ** 2}
                            accept={IMAGE_MIME_TYPE}
                            multiple={false}
                            openRef={openRef}
                        >
                            <Box
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: rem(12),
                                    cursor: "pointer",
                                }}
                            >
                                {/* Circular icon preview */}
                                <Box
                                    style={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: "50%",
                                        backgroundColor: "var(--mantine-color-gray-1)",
                                        border: "2px dashed var(--mantine-color-gray-4)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        overflow: "hidden",
                                        transition: "all 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "var(--mantine-color-blue-6)";
                                        e.currentTarget.style.backgroundColor = "var(--mantine-color-blue-0)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "var(--mantine-color-gray-4)";
                                        e.currentTarget.style.backgroundColor = "var(--mantine-color-gray-1)";
                                    }}
                                >
                                    {previewIconUrl ? (
                                        <Image
                                            src={previewIconUrl}
                                            alt={name || "Skill icon"}
                                            width={80}
                                            height={80}
                                            style={{
                                                width: 80,
                                                height: 80,
                                                objectFit: "contain",
                                            }}
                                            onError={(e) => {
                                                e.currentTarget.src = "";
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <IconPhoto
                                            style={{
                                                width: rem(48),
                                                height: rem(48),
                                                color: "var(--mantine-color-gray-5)",
                                            }}
                                            stroke={1.5}
                                        />
                                    )}
                                </Box>

                                <Stack gap={4} align="center">
                                    <Text size="sm" fw={500} ta="center">
                                        {previewIconUrl
                                            ? t("clickToUploadCustom") || "Click or drop to upload custom icon"
                                            : t("dropzoneText")}
                                    </Text>
                                    <Text size="xs" c="dimmed" ta="center">
                                        {previewIconUrl
                                            ? t("autoIconWillBeUsed") || "Auto-generated icon shown above"
                                            : (skill ? t("dropzoneHintOptional") : t("dropzoneHint"))}
                                    </Text>
                                </Stack>
                            </Box>
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

                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
                        {t("cancelButton")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!name.trim() || !category}
                        loading={isLoading}
                    >
                        {t("submitButton")}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}