"use client";

import { useState, useEffect } from "react";
import {
    Container,
    Paper,
    Title,
    TextInput,
    Button,
    Stack,
    Group,
    Text,
    Alert,
    Loader,
    Center,
} from "@mantine/core";
import { IconMail, IconBrandGithub, IconBrandLinkedin, IconCheck } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {Contact, getContact, updateContact} from "@/entities/contact";

export default function ContactPage() {
    const t = useTranslations("contact");

    const [contact, setContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        github: "",
        linkedin: "",
    });

    useEffect(() => {
        loadContact();
    }, []);

    const loadContact = async () => {
        try {
            const data = await getContact();
            setContact(data);
            setFormData({
                email: data.email,
                github: data.github,
                linkedin: data.linkedin,
            });
        } catch (error) {
            console.error("Failed to load contact", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);

        try {
            const updated = await updateContact(formData);
            setContact(updated);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Failed to update contact", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Center h="100vh">
                <Loader size="lg" />
            </Center>
        );
    }

    return (
        <Container size="sm" py="xl">
            <Stack gap="lg">
                <div>
                    <Title order={2} mb="xs">
                        {t("title")}
                    </Title>
                    <Text c="dimmed" size="sm">
                        {t("description")}
                    </Text>
                </div>

                {saved && (
                    <Alert
                        icon={<IconCheck size={16} />}
                        title={t("savedTitle")}
                        color="green"
                        withCloseButton
                        onClose={() => setSaved(false)}
                    >
                        {t("savedMessage")}
                    </Alert>
                )}

                <Paper shadow="sm" p="xl" radius="md" withBorder>
                    <form onSubmit={handleSubmit}>
                        <Stack gap="md">
                            <TextInput
                                label={t("emailLabel")}
                                placeholder={t("emailPlaceholder")}
                                leftSection={<IconMail size={16} />}
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                required
                                type="email"
                            />

                            <TextInput
                                label={t("githubLabel")}
                                placeholder={t("githubPlaceholder")}
                                leftSection={<IconBrandGithub size={16} />}
                                value={formData.github}
                                onChange={(e) =>
                                    setFormData({ ...formData, github: e.target.value })
                                }
                                required
                            />

                            <TextInput
                                label={t("linkedinLabel")}
                                placeholder={t("linkedinPlaceholder")}
                                leftSection={<IconBrandLinkedin size={16} />}
                                value={formData.linkedin}
                                onChange={(e) =>
                                    setFormData({ ...formData, linkedin: e.target.value })
                                }
                                required
                            />

                            <Group justify="flex-end" mt="md">
                                <Button type="submit" loading={saving}>
                                    {t("saveButton")}
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                </Paper>

                {/* Preview Section */}
                <Paper shadow="sm" p="xl" radius="md" withBorder>
                    <Title order={4} mb="md">
                        {t("previewTitle")}
                    </Title>
                    <Stack gap="xs">
                        <Group gap="xs">
                            <IconMail size={16} />
                            <Text size="sm">{formData.email || t("noEmail")}</Text>
                        </Group>
                        <Group gap="xs">
                            <IconBrandGithub size={16} />
                            <Text size="sm">{formData.github || t("noGithub")}</Text>
                        </Group>
                        <Group gap="xs">
                            <IconBrandLinkedin size={16} />
                            <Text size="sm">{formData.linkedin || t("noLinkedin")}</Text>
                        </Group>
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}