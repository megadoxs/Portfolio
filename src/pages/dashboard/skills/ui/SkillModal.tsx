"use client";

import { Modal, Stack, Button, Text, Group, TextInput, Select, rem, Box, Slider, ActionIcon, Card } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useState, useRef, useEffect, useMemo } from "react";
import { IconFileUpload, IconX, IconPhoto, IconRotateClockwise } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { SkillRequestModel, SkillCategory, Skill } from "@/entities/skill";
import { useForm } from "@mantine/form";
import { useMantineColorScheme } from "@mantine/core";
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
    const { colorScheme } = useMantineColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';
    const editorRef = useRef<AvatarEditor>(null);

    const [file, setFile] = useState<File | null>(null);
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);

    const form = useForm<{ name: string; category: SkillCategory | "" }>({
        initialValues: {
            name: skill?.name || "",
            category: skill?.category || "",
        },
        validate: {
            name: (value: string) => (!value?.trim() ? t("nameRequired") : null),
            category: (value: string) => (!value ? t("categoryRequired") : null),
        },
    });

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

    // Derive preview icon URL based on current state
    const previewIconUrl = useMemo(() => {
        // If editing and skill has custom icon, use it
        if (skill?.icon) {
            return skill.icon;
        }

        // If name is empty, no preview
        if (!form.values.name.trim()) {
            return "";
        }

        // Generate icon from name
        return getSkillIconUrl(form.values.name);
    }, [skill?.icon, form.values.name]);

    // Initialize form when skill changes
    useEffect(() => {
        if (skill) {
            form.setValues({
                name: skill.name,
                category: skill.category,
            });
        } else {
            form.reset();
        }
    }, [skill?.id]); // Only re-run when skill ID changes

    const categoryOptions = [
        { value: "LANGUAGE", label: t("category.language") },
        { value: "FRAMEWORK", label: t("category.framework") },
        { value: "SOFTWARE", label: t("category.software") },
        { value: "DATABASE", label: t("category.database") },
    ];

    const handleSubmit = async (values: typeof form.values) => {
        if (file && editorRef.current) {
            const canvas = editorRef.current.getImageScaledToCanvas();
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const croppedFile = new File([blob], file.name, { type: file.type });
                    await onSubmit({
                        name: values.name.trim(),
                        category: values.category as SkillCategory,
                        icon: croppedFile,
                    });
                    handleClose();
                }
            });
        } else {
            await onSubmit({
                name: values.name.trim(),
                category: values.category as SkillCategory,
                icon: null,
            });
            handleClose();
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

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={<Text fw={700} size="lg">{skill ? t("editModalTitle") : t("modalTitle")}</Text>}
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
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        form.validate();
                        if (form.isValid()) {
                            handleSubmit(form.values);
                        }
                    }}>
                        <Stack gap="md">
                            <TextInput
                                label={t("nameLabel")}
                                placeholder={t("namePlaceholder")}
                                {...form.getInputProps("name")}
                                required
                            />

                            <Select
                                label={t("categoryLabel")}
                                placeholder={t("categoryPlaceholder")}
                                {...form.getInputProps("category")}
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
                                        styles={{
                                            root: {
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                padding: 0,
                                            }
                                        }}
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
                                            <Box
                                                style={{
                                                    width: 120,
                                                    height: 120,
                                                    borderRadius: "50%",
                                                    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                                                    border: `2px dashed ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    overflow: "hidden",
                                                    transition: "all 0.2s ease",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = "var(--mantine-color-blue-6)";
                                                    e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
                                                    e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)';
                                                }}
                                            >
                                                {previewIconUrl ? (
                                                    <Image
                                                        src={previewIconUrl}
                                                        alt={form.values.name || "Skill icon"}
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

                                        <Button
                                            variant="subtle"
                                            size="xs"
                                            onClick={() => setFile(null)}
                                            fullWidth
                                        >
                                            {t("changeImage") || "Change image"}
                                        </Button>
                                    </Stack>
                                )}
                            </Stack>

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