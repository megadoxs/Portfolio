"use client";

import {
    Box,
    Container,
    Grid,
    GridCol,
    Title,
    Text,
    Stack,
    Group,
    Button,
    useMantineColorScheme,
    Paper,
    Textarea,
    TextInput,
    Alert,
} from "@mantine/core";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import {
    IconBrandGithub,
    IconBrandLinkedin,
    IconFileText,
    IconBriefcase,
    IconSchool,
    IconHeart,
    IconMessage,
    IconSend,
    IconMail,
    IconAlertCircle,
    IconCheck,
    IconCode,
    IconCircleFilled,
    IconTrophy,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Contact, getContact } from "@/entities/contact";
import { getActiveResumeByLocale, Resume } from "@/entities/resume";
import { getAllWork, Work } from "@/entities/work";
import { getAllEducation, Education } from "@/entities/education";
import { getAllSkills, Skill, SkillCategory } from "@/entities/skill";
import { getAllHobbies, Hobby } from "@/entities/hobby";
import { getAllTestimonials, Testimonial, TestimonialStatus, addTestimonial } from "@/entities/testimonial";
import { getAllProjects, ProjectWithSkills } from "@/entities/project";
import { SkillPill } from "@/shared/ui/SkillPill";
import WorkCard from "@/shared/ui/WorkCard";
import EducationCard from "@/shared/ui/EducationCard";
import HobbyCard from "@/shared/ui/HobbyCard";
import TestimonialCard from "@/shared/ui/TestimonialCard";
import ProjectCard from "@/shared/ui/ProjectCard";
import {sendContactEmail} from "@/features/email";

function getPyramidRows<T>(items: T[], maxPerRow = 3): T[][] {
    const rows: T[][] = [];
    let remaining = [...items];

    while (remaining.length > 0) {
        const rowSize = Math.min(maxPerRow, remaining.length);
        rows.push(remaining.slice(0, rowSize));
        remaining = remaining.slice(rowSize);
    }

    return rows;
}

interface PyramidGridProps<T> {
    items: T[];
    maxPerRow?: number;
    cardWidth?: number;
    gap?: number;
    renderItem: (item: T, index: number) => React.ReactNode;
}

function PyramidGrid<T>({
                            items,
                            maxPerRow = 3,
                            cardWidth = 380,
                            gap = 24,
                            renderItem,
                        }: PyramidGridProps<T>) {
    const rows = getPyramidRows(items, maxPerRow);

    return (
        <Stack gap={gap} align="center" w="100%">
            {rows.map((rowItems, rowIndex) => (
                <div
                    key={rowIndex}
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: `${gap}px`,
                        width: "100%",
                        maxWidth: `${rowItems.length * cardWidth + (rowItems.length - 1) * gap}px`,
                    }}
                >
                    {rowItems.map((item, itemIndex) => (
                        <div
                            key={itemIndex}
                            style={{
                                flex: `1 1 ${cardWidth}px`,
                                maxWidth: `${cardWidth}px`,
                                minWidth: `${Math.min(cardWidth, 180)}px`,
                                boxSizing: "border-box",
                            }}
                        >
                            {renderItem(item, rowIndex * maxPerRow + itemIndex)}
                        </div>
                    ))}
                </div>
            ))}
        </Stack>
    );
}

export default function HomePage() {
    const t = useTranslations("home");
    const locale = useLocale();
    const { colorScheme } = useMantineColorScheme();
    const theme = colorScheme === "dark" ? "dark" : "light";

    const [contact, setContact] = useState<Contact | null>(null);
    const [resume, setResume] = useState<Resume | null>(null);
    const [works, setWorks] = useState<Work[]>([]);
    const [educations, setEducations] = useState<Education[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [hobbies, setHobbies] = useState<Hobby[]>([]);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [projects, setProjects] = useState<ProjectWithSkills[]>([]);
    const [loading, setLoading] = useState(true);

    const [testimonialForm, setTestimonialForm] = useState({
        name: "",
        testimonial: "",
    });
    const [testimonialSubmitting, setTestimonialSubmitting] = useState(false);
    const [testimonialSuccess, setTestimonialSuccess] = useState(false);
    const [testimonialError, setTestimonialError] = useState<string | null>(null);

    const [contactForm, setContactForm] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [contactSubmitting, setContactSubmitting] = useState(false);
    const [contactSuccess, setContactSuccess] = useState(false);
    const [contactError, setContactError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    contactData,
                    resumeData,
                    worksData,
                    educationsData,
                    skillsData,
                    hobbiesData,
                    testimonialsData,
                    projectsData,
                ] = await Promise.all([
                    getContact(),
                    getActiveResumeByLocale(locale),
                    getAllWork(),
                    getAllEducation(),
                    getAllSkills(),
                    getAllHobbies(),
                    getAllTestimonials(),
                    getAllProjects(),
                ]);
                setContact(contactData);
                setResume(resumeData);
                setWorks(worksData);
                setEducations(educationsData);
                setSkills(skillsData);
                setHobbies(hobbiesData);
                setTestimonials(
                    testimonialsData.filter((t) => t.status === TestimonialStatus.APPROVED)
                );
                setProjects(projectsData.filter(project => project.active));
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [locale]);

    // Handle hash scrolling after content loads
    useEffect(() => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const scrollAttempts = [200, 400, 800, 1200, 1600];
            scrollAttempts.forEach(delay => {
                setTimeout(() => {
                    const element = document.getElementById(hash);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, delay);
            });
            setTimeout(() => {
                window.history.replaceState(null, '', window.location.pathname);
            }, 2000);
        }
    }, []);

    // Scroll to top when home hash is detected
    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash === '#home' || window.location.hash === '') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.history.replaceState(null, '', window.location.pathname);
            }
        };
        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const skillsByCategory = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) {
            acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
    }, {} as Record<SkillCategory, Skill[]>);

    const categoryLabels = {
        LANGUAGE: t("skills.language"),
        FRAMEWORK: t("skills.framework"),
        SOFTWARE: t("skills.software"),
        DATABASE: t("skills.database"),
    };

    const sortedProjects = [...projects].sort((a, b) => {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    const handleTestimonialSubmit = async () => {
        if (!testimonialForm.name.trim() || !testimonialForm.testimonial.trim()) {
            return;
        }

        setTestimonialSubmitting(true);
        setTestimonialSuccess(false);
        setTestimonialError(null);

        try {
            const result = await addTestimonial({
                name: testimonialForm.name.trim(),
                testimonial: testimonialForm.testimonial.trim()
            });

            if (!result.success) {
                setTestimonialError(result.error ?? 'SERVER_ERROR');
                return;
            }

            setTestimonialForm({ name: "", testimonial: "" });
            setTestimonialSuccess(true);

            setTimeout(() => {
                setTestimonialSuccess(false);
            }, 5000);
        } catch (error) {
            console.error("Error submitting testimonial:", error);
            setTestimonialError('SERVER_ERROR');
        } finally {
            setTestimonialSubmitting(false);
        }
    };

    const handleContactSubmit = async () => {
        if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
            return;
        }

        setContactSubmitting(true);
        setContactSuccess(false);
        setContactError(null);

        try {
            const formData = new FormData();
            formData.append("name", contactForm.name.trim());
            formData.append("email", contactForm.email.trim());
            formData.append("message", contactForm.message.trim());

            const result = await sendContactEmail(formData);

            if (!result.success) {
                setContactError(result.error ?? 'SERVER_ERROR');
                return;
            }

            setContactForm({ name: "", email: "", message: "" });
            setContactSuccess(true);

            setTimeout(() => {
                setContactSuccess(false);
            }, 5000);
        } catch (error) {
            console.error("Error sending contact message:", error);
            setContactError('SERVER_ERROR');
        } finally {
            setContactSubmitting(false);
        }
    };

    return (
        <Box>
            <Box className="heroSection" id="home">
                <Container size="xl" py={80} style={{ width: "100%" }}>
                    <Grid align="center" gutter="xl">
                        <GridCol span={{ base: 12, md: 5 }}>
                            <Box className={`glowWrapper imageWrapper ${theme}`}>
                                <Box
                                    style={{
                                        position: "relative",
                                        width: "100%",
                                        aspectRatio: "1/1",
                                        borderRadius: "16px",
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
                                <Title order={1} size="3.5rem" fw={900} style={{ lineHeight: 1.2 }}>
                                    {t("title")}
                                </Title>

                                <Text size="xl" c="dimmed" fw={500}>
                                    {t("slogan")}
                                </Text>

                                <Text size="xl" c="dimmed" fw={500}>
                                    {t("description")}
                                </Text>

                                <Group gap="md" mt="md">
                                    {contact?.github && (
                                        <Button
                                            component="a"
                                            href={contact.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            leftSection={<IconBrandGithub size={20} />}
                                            size="lg"
                                            className={`glassButton ${theme}`}
                                        >
                                            {t("buttons.github")}
                                        </Button>
                                    )}

                                    {contact?.linkedin && (
                                        <Button
                                            component="a"
                                            href={contact.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            leftSection={<IconBrandLinkedin size={20} />}
                                            size="lg"
                                            className={`glassButton ${theme}`}
                                        >
                                            {t("buttons.linkedin")}
                                        </Button>
                                    )}

                                    {resume?.url && (
                                        <Button
                                            component="a"
                                            href={resume.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            leftSection={<IconFileText size={20} />}
                                            size="lg"
                                            className={`glassButton ${theme}`}
                                        >
                                            {t("buttons.resume")}
                                        </Button>
                                    )}
                                </Group>
                            </Stack>
                        </GridCol>
                    </Grid>
                </Container>
            </Box>

            {/* ── Projects ── */}
            <Box py={60} id="projects">
                <Container size="xl">
                    <Stack gap="xl" align="center">
                        <Group gap="sm">
                            <IconTrophy size={32} />
                            <Title order={2}>{t("sections.projects")}</Title>
                        </Group>

                        {projects.length > 0 && (
                            <Box py="xl" px="xl" w="100%">
                                <Stack gap="xl" align="center">
                                    {/* Timeline - Desktop (2-sided) */}
                                    <Box
                                        style={{ position: "relative", width: "100%", maxWidth: "1200px" }}
                                        visibleFrom="md"
                                    >
                                        {/* Center Line */}
                                        <Box
                                            style={{
                                                position: "absolute",
                                                left: "50%",
                                                top: 0,
                                                bottom: 0,
                                                width: "2px",
                                                background: "linear-gradient(180deg, rgba(139, 92, 246, 0.4), rgba(59, 130, 246, 0.4), rgba(236, 72, 153, 0.3))",
                                                transform: "translateX(-50%)",
                                                zIndex: 0,
                                                boxShadow: "0 0 10px rgba(139, 92, 246, 0.3)",
                                            }}
                                        />

                                        <Stack gap={60}>
                                            {sortedProjects.map((project, index) => {
                                                const isLeft = index % 2 === 0;

                                                return (
                                                    <Box
                                                        key={project.id}
                                                        style={{
                                                            position: "relative",
                                                            minHeight: "200px",
                                                        }}
                                                    >
                                                        {/* Timeline Dot */}
                                                        <Box
                                                            style={{
                                                                position: "absolute",
                                                                left: "50%",
                                                                top: "50%",
                                                                transform: "translate(-50%, -50%)",
                                                                zIndex: 2,
                                                            }}
                                                        >
                                                            <IconCircleFilled
                                                                size={16}
                                                                style={{
                                                                    color: "#8b5cf6",
                                                                    filter: "drop-shadow(0 0 6px rgba(139, 92, 246, 0.6))",
                                                                }}
                                                            />
                                                        </Box>

                                                        {/* Horizontal Line */}
                                                        <Box
                                                            style={{
                                                                position: "absolute",
                                                                left: isLeft ? "calc(50% - 32px)" : "calc(50% + 8px)",
                                                                right: isLeft ? "auto" : "calc(50% - 32px)",
                                                                top: "50%",
                                                                width: "24px",
                                                                height: "2px",
                                                                background: isLeft
                                                                    ? "linear-gradient(90deg, rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0.1))"
                                                                    : "linear-gradient(270deg, rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0.1))",
                                                                transform: "translateY(-50%)",
                                                                zIndex: 1,
                                                            }}
                                                        />

                                                        {/* Project Card */}
                                                        <Box
                                                            style={{
                                                                width: "500px",
                                                                position: "absolute",
                                                                top: 0,
                                                                ...(isLeft
                                                                        ? { right: "calc(50% - 60px)" }
                                                                        : { left: "calc(50% + 40px)" }
                                                                ),
                                                                zIndex: 2,
                                                            }}
                                                        >
                                                            <ProjectCard project={project} />
                                                        </Box>
                                                    </Box>
                                                );
                                            })}
                                        </Stack>
                                    </Box>

                                    {/* Timeline - Mobile */}
                                    <Box
                                        style={{ position: "relative", width: "100%" }}
                                        hiddenFrom="md"
                                    >
                                        <Box
                                            style={{
                                                position: "absolute",
                                                left: "20px",
                                                top: 0,
                                                bottom: 0,
                                                width: "2px",
                                                background: "linear-gradient(180deg, rgba(139, 92, 246, 0.4), rgba(59, 130, 246, 0.4), rgba(236, 72, 153, 0.3))",
                                                zIndex: 0,
                                                boxShadow: "0 0 10px rgba(139, 92, 246, 0.3)",
                                            }}
                                        />

                                        <Stack gap={40} pl="60px">
                                            {sortedProjects.map((project) => (
                                                <Box key={project.id} style={{ position: "relative" }}>
                                                    <Box
                                                        style={{
                                                            position: "absolute",
                                                            left: "-48px",
                                                            top: "20px",
                                                            zIndex: 2,
                                                        }}
                                                    >
                                                        <IconCircleFilled
                                                            size={16}
                                                            style={{
                                                                color: "#8b5cf6",
                                                                filter: "drop-shadow(0 0 6px rgba(139, 92, 246, 0.6))",
                                                            }}
                                                        />
                                                    </Box>
                                                    <Box
                                                        style={{
                                                            position: "absolute",
                                                            left: "-40px",
                                                            top: "28px",
                                                            width: "40px",
                                                            height: "2px",
                                                            background: "linear-gradient(90deg, rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0.1))",
                                                            zIndex: 1,
                                                        }}
                                                    />
                                                    <ProjectCard project={project} />
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Box>
                        )}
                    </Stack>
                </Container>
            </Box>

            {/* ── Skills ── */}
            <Box py={60} id="skills">
                <Container size="xl">
                    <Stack gap="xl" align="center">
                        <Group gap="sm">
                            <IconCode size={32} />
                            <Title order={2}>{t("sections.skills")}</Title>
                        </Group>

                        <Stack gap="xl" w="100%">
                            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                                <Stack key={category} gap="md" align="center">
                                    <Title order={3} size="h3">
                                        {categoryLabels[category as SkillCategory]}
                                    </Title>
                                    <Group gap="md" justify="center">
                                        {categorySkills.map((skill) => (
                                            <SkillPill key={skill.id} skill={skill} size="lg" />
                                        ))}
                                    </Group>
                                </Stack>
                            ))}
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            {/* ── Work ── */}
            <Box py={60} id="work">
                <Container size="xl">
                    <Stack gap="xl" align="center">
                        <Group gap="sm">
                            <IconBriefcase size={32} />
                            <Title order={2}>{t("sections.work")}</Title>
                        </Group>

                        <PyramidGrid
                            items={[...works].sort((a, b) => {
                                const aEnd = a.endDate ? new Date(a.endDate).getTime() : null;
                                const bEnd = b.endDate ? new Date(b.endDate).getTime() : null;

                                if (aEnd !== null && bEnd !== null) return bEnd - aEnd;
                                if (aEnd === null && bEnd !== null) return -1;
                                if (aEnd !== null && bEnd === null) return 1;
                                return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
                            })}
                            maxPerRow={2}
                            cardWidth={520}
                            gap={24}
                            renderItem={(work) => <WorkCard work={work} />}
                        />
                    </Stack>
                </Container>
            </Box>

            {/* ── Education ── */}
            <Box py={60} id="education">
                <Container size="xl">
                    <Stack gap="xl" align="center">
                        <Group gap="sm">
                            <IconSchool size={32} />
                            <Title order={2}>{t("sections.education")}</Title>
                        </Group>

                        <PyramidGrid
                            items={educations}
                            maxPerRow={3}
                            cardWidth={450}
                            gap={24}
                            renderItem={(education) => <EducationCard education={education} />}
                        />
                    </Stack>
                </Container>
            </Box>

            {/* ── Hobbies ── */}
            <Box py={60} id="hobbies">
                <Container size="xl">
                    <Stack gap="xl" align="center">
                        <Group gap="sm">
                            <IconHeart size={32} />
                            <Title order={2}>{t("sections.hobbies")}</Title>
                        </Group>

                        <PyramidGrid
                            items={hobbies}
                            maxPerRow={3}
                            cardWidth={220}
                            gap={24}
                            renderItem={(hobby) => <HobbyCard hobby={hobby} />}
                        />
                    </Stack>
                </Container>
            </Box>

            {/* ── Testimonials ── */}
            <Box py={60} id="testimonials">
                <Container size="xl">
                    <Stack gap="xl" align="center">
                        <Group gap="sm">
                            <IconMessage size={32} />
                            <Title order={2}>{t("sections.testimonials")}</Title>
                        </Group>

                        {testimonials.length > 0 && (
                            <PyramidGrid
                                items={testimonials}
                                maxPerRow={3}
                                cardWidth={380}
                                gap={24}
                                renderItem={(testimonial) => <TestimonialCard testimonial={testimonial} />}
                            />
                        )}

                        {/* Leave a Testimonial Form */}
                        <Box w="100%" maw={700} mt="xl">
                            <Box className={`glowWrapper ${theme}`}>
                                <Paper className={`glassCard ${theme}`} p="xl" radius="md">
                                    <Stack gap="xl">
                                        <Stack gap="xs" align="center">
                                            <Title order={3} ta="center">
                                                {t("sections.leaveTestimonial")}
                                            </Title>
                                            <Text size="sm" c="dimmed" ta="center">
                                                {t("sections.testimonialDescription")}
                                            </Text>
                                        </Stack>

                                        {testimonialSuccess && (
                                            <Alert
                                                icon={<IconCheck size={20} />}
                                                title={t("form.success")}
                                                color="green"
                                                variant="light"
                                            >
                                                {t("form.testimonialSuccess")}
                                            </Alert>
                                        )}

                                        {testimonialError && (
                                            <Alert
                                                icon={<IconAlertCircle size={20} />}
                                                title={t("form.error")}
                                                color="red"
                                                variant="light"
                                            >
                                                {testimonialError === 'RATE_LIMIT_EXCEEDED'
                                                    ? t("form.rateLimitExceeded")
                                                    : t("form.serverError")
                                                }
                                            </Alert>
                                        )}

                                        <Stack gap="md">
                                            <TextInput
                                                label={t("form.name")}
                                                placeholder={t("form.namePlaceholder")}
                                                value={testimonialForm.name}
                                                onChange={(e) =>
                                                    setTestimonialForm({
                                                        ...testimonialForm,
                                                        name: e.target.value,
                                                    })
                                                }
                                                size="md"
                                                required
                                                disabled={testimonialSubmitting}
                                            />
                                            <Box>
                                                <Group justify="space-between" mb={5}>
                                                    <Text component="label" size="sm" fw={500}>
                                                        {t("form.testimonial")}
                                                    </Text>
                                                    <Text
                                                        size="xs"
                                                        c={
                                                            testimonialForm.testimonial.length > 512
                                                                ? "red"
                                                                : testimonialForm.testimonial.length < 20
                                                                    ? "orange"
                                                                    : "dimmed"
                                                        }
                                                    >
                                                        {testimonialForm.testimonial.length < 20
                                                            ? `${testimonialForm.testimonial.length}/20 min`
                                                            : `${testimonialForm.testimonial.length}/512`
                                                        }
                                                    </Text>
                                                </Group>
                                                <Textarea
                                                    placeholder={t("form.testimonialPlaceholder")}
                                                    value={testimonialForm.testimonial}
                                                    onChange={(e) =>
                                                        setTestimonialForm({
                                                            ...testimonialForm,
                                                            testimonial: e.target.value,
                                                        })
                                                    }
                                                    minRows={4}
                                                    autosize
                                                    size="md"
                                                    required
                                                    disabled={testimonialSubmitting}
                                                    error={testimonialForm.testimonial.length > 512 ? t("form.testimonialTooLong") : undefined}
                                                />
                                            </Box>
                                            <Button
                                                leftSection={<IconSend size={20} />}
                                                onClick={handleTestimonialSubmit}
                                                size="lg"
                                                fullWidth
                                                mt="sm"
                                                loading={testimonialSubmitting}
                                                disabled={
                                                    !testimonialForm.name.trim() ||
                                                    testimonialForm.testimonial.trim().length < 20 ||
                                                    testimonialForm.testimonial.trim().length > 512
                                                }
                                            >
                                                {t("form.submit")}
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            </Box>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            {/* ── Contact ── */}
            <Box py={60} id="contact">
                <Container size="xl">
                    <Stack gap="xl" align="center">
                        <Group gap="sm">
                            <IconMail size={32} />
                            <Title order={2}>{t("sections.contact")}</Title>
                        </Group>

                        <Text size="lg" c="dimmed" ta="center" maw={600}>
                            {t("sections.contactDescription")}
                        </Text>

                        <Box w="100%" maw={700}>
                            <Box className={`glowWrapper ${theme}`}>
                                <Paper className={`glassCard ${theme}`} p="xl" radius="md">
                                    <Stack gap="lg">
                                        {contactSuccess && (
                                            <Alert
                                                icon={<IconCheck size={20} />}
                                                title={t("form.success")}
                                                color="green"
                                                variant="light"
                                            >
                                                {t("form.contactSuccess")}
                                            </Alert>
                                        )}

                                        {contactError && (
                                            <Alert
                                                icon={<IconAlertCircle size={20} />}
                                                title={t("form.error")}
                                                color="red"
                                                variant="light"
                                            >
                                                {contactError === 'RATE_LIMIT_EXCEEDED'
                                                    ? t("form.rateLimitExceeded")
                                                    : contactError === 'INVALID_EMAIL'
                                                        ? t("form.invalidEmail")
                                                        : contactError === 'INVALID_MESSAGE_LENGTH'
                                                            ? t("form.invalidMessageLength")
                                                            : t("form.serverError")
                                                }
                                            </Alert>
                                        )}

                                        <Group gap="md" grow>
                                            <TextInput
                                                label={t("form.name")}
                                                placeholder={t("form.namePlaceholder")}
                                                value={contactForm.name}
                                                onChange={(e) =>
                                                    setContactForm({ ...contactForm, name: e.target.value })
                                                }
                                                size="md"
                                                required
                                                disabled={contactSubmitting}
                                            />
                                            <TextInput
                                                label={t("form.email")}
                                                placeholder={t("form.emailPlaceholder")}
                                                type="email"
                                                value={contactForm.email}
                                                onChange={(e) =>
                                                    setContactForm({ ...contactForm, email: e.target.value })
                                                }
                                                size="md"
                                                required
                                                disabled={contactSubmitting}
                                            />
                                        </Group>
                                        <Box>
                                            <Group justify="space-between" mb={5}>
                                                <Text component="label" size="sm" fw={500}>
                                                    {t("form.message")}
                                                </Text>
                                                <Text
                                                    size="xs"
                                                    c={
                                                        contactForm.message.length > 1000
                                                            ? "red"
                                                            : contactForm.message.length < 100
                                                                ? "orange"
                                                                : "dimmed"
                                                    }
                                                >
                                                    {contactForm.message.length < 100
                                                        ? `${contactForm.message.length}/100 min`
                                                        : `${contactForm.message.length}/1000`
                                                    }
                                                </Text>
                                            </Group>
                                            <Textarea
                                                placeholder={t("form.messagePlaceholder")}
                                                value={contactForm.message}
                                                onChange={(e) =>
                                                    setContactForm({
                                                        ...contactForm,
                                                        message: e.target.value,
                                                    })
                                                }
                                                minRows={4}
                                                autosize
                                                size="md"
                                                required
                                                disabled={contactSubmitting}
                                                error={contactForm.message.length > 1000 ? t("form.messageTooLong") : undefined}
                                            />
                                        </Box>
                                        <Button
                                            leftSection={<IconSend size={20} />}
                                            onClick={handleContactSubmit}
                                            size="lg"
                                            fullWidth
                                            mt="sm"
                                            loading={contactSubmitting}
                                            disabled={
                                                !contactForm.name.trim() ||
                                                !contactForm.email.trim() ||
                                                contactForm.message.trim().length < 20 ||
                                                contactForm.message.trim().length > 1000
                                            }
                                        >
                                            {t("form.sendMessage")}
                                        </Button>
                                    </Stack>
                                </Paper>
                            </Box>
                        </Box>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
}