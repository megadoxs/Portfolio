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
    SimpleGrid,
    Paper,
    Textarea,
    TextInput,
    Alert,
    Loader,
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

export default function HomePage() {
    const t = useTranslations("home");
    const tProjects = useTranslations("projects");
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
            // Try scrolling multiple times as content loads
            const scrollAttempts = [200, 400, 800, 1200, 1600];

            scrollAttempts.forEach(delay => {
                setTimeout(() => {
                    const element = document.getElementById(hash);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, delay);
            });

            // Clean up hash after final attempt
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

        // Check on mount
        handleHashChange();

        // Listen for hash changes
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

    // Sort projects by start date (most recent first)
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
                if (result.error === 'RATE_LIMIT_EXCEEDED') {
                    setTestimonialError('RATE_LIMIT_EXCEEDED');
                } else {
                    setTestimonialError('SERVER_ERROR');
                }
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
        console.log("Contact form submitted:", contactForm);
        setContactForm({ name: "", email: "", message: "" });
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
                                <Title order={1} size="3.5rem" fw={900} style={{ lineHeight: 1.2 }}>
                                    {t("title")}
                                </Title>

                                <Text size="xl" c="dimmed" fw={500}>
                                    {t("slogan")}
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
                                        {/* Center Line - Glassmorphic gradient */}
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

                                        {/* Timeline Items */}
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
                                                        {/* Timeline Dot - Enhanced glow effect */}
                                                        <Box
                                                            style={{
                                                                position: "absolute",
                                                                left: "50%",
                                                                top: "50%",
                                                                transform: "translate(-50%, -50%)",
                                                                zIndex: 2,
                                                            }}
                                                        >
                                                            <Box
                                                                style={{
                                                                    position: "relative",
                                                                    width: "16px",
                                                                    height: "16px",
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
                                                        </Box>

                                                        {/* Horizontal Line to Card - Subtle gradient */}
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

                                    {/* Timeline - Mobile (single column) */}
                                    <Box
                                        style={{ position: "relative", width: "100%" }}
                                        hiddenFrom="md"
                                    >
                                        {/* Left Line - Glassmorphic gradient */}
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

                                        {/* Timeline Items */}
                                        <Stack gap={40} pl="60px">
                                            {sortedProjects.map((project) => (
                                                <Box
                                                    key={project.id}
                                                    style={{
                                                        position: "relative",
                                                    }}
                                                >
                                                    {/* Timeline Dot - Enhanced glow effect */}
                                                    <Box
                                                        style={{
                                                            position: "absolute",
                                                            left: "-48px",
                                                            top: "20px",
                                                            zIndex: 2,
                                                        }}
                                                    >
                                                        <Box
                                                            style={{
                                                                position: "relative",
                                                                width: "16px",
                                                                height: "16px",
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
                                                    </Box>

                                                    {/* Horizontal Line to Card - Subtle gradient */}
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

                                                    {/* Project Card */}
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

            <Box py={60} id="work">
                <Container size="xl">
                    <Stack gap="xl" align="center">
                        <Group gap="sm">
                            <IconBriefcase size={32} />
                            <Title order={2}>{t("sections.work")}</Title>
                        </Group>

                        <Box w="100%" style={{ display: 'flex', justifyContent: 'center' }}>
                            <Box style={{ width: '100%', maxWidth: '1200px' }}>
                                {works.length === 1 ? (
                                    <Group justify="center">
                                        {works.map((work) => (
                                            <Box key={work.id} style={{ width: '100%', maxWidth: '400px' }}>
                                                <WorkCard work={work} />
                                            </Box>
                                        ))}
                                    </Group>
                                ) : works.length === 2 ? (
                                    <Group justify="center" gap="lg">
                                        {works.map((work) => (
                                            <Box key={work.id} style={{ width: '100%', maxWidth: '400px' }}>
                                                <WorkCard work={work} />
                                            </Box>
                                        ))}
                                    </Group>
                                ) : (
                                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                                        {works.map((work) => (
                                            <WorkCard key={work.id} work={work} />
                                        ))}
                                    </SimpleGrid>
                                )}
                            </Box>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            <Box py={60} id="education">
                <Container size="xl">
                    <Stack gap="xl" align="center">
                        <Group gap="sm">
                            <IconSchool size={32} />
                            <Title order={2}>{t("sections.education")}</Title>
                        </Group>

                        <Box w="100%" style={{ display: 'flex', justifyContent: 'center' }}>
                            <Box style={{ width: '100%', maxWidth: '1200px' }}>
                                {educations.length === 1 ? (
                                    <Group justify="center">
                                        {educations.map((education) => (
                                            <Box key={education.id} style={{ width: '100%', maxWidth: '400px' }}>
                                                <EducationCard education={education} />
                                            </Box>
                                        ))}
                                    </Group>
                                ) : educations.length === 2 ? (
                                    <Group justify="center" gap="lg">
                                        {educations.map((education) => (
                                            <Box key={education.id} style={{ width: '100%', maxWidth: '400px' }}>
                                                <EducationCard education={education} />
                                            </Box>
                                        ))}
                                    </Group>
                                ) : (
                                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                                        {educations.map((education) => (
                                            <EducationCard key={education.id} education={education} />
                                        ))}
                                    </SimpleGrid>
                                )}
                            </Box>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            <Box py={60} id="hobbies">
                <Container size="xl">
                    <Stack gap="xl" align="center">
                        <Group gap="sm">
                            <IconHeart size={32} />
                            <Title order={2}>{t("sections.hobbies")}</Title>
                        </Group>

                        <Box w="100%" style={{ display: 'flex', justifyContent: 'center' }}>
                            <Box style={{ width: '100%', maxWidth: '600px' }}>
                                {hobbies.length === 1 ? (
                                    <Group justify="center">
                                        {hobbies.map((hobby) => (
                                            <Box key={hobby.id} style={{ width: '100%', maxWidth: '200px' }}>
                                                <HobbyCard hobby={hobby} />
                                            </Box>
                                        ))}
                                    </Group>
                                ) : hobbies.length === 2 ? (
                                    <Group justify="center" gap="lg">
                                        {hobbies.map((hobby) => (
                                            <Box key={hobby.id} style={{ width: '100%', maxWidth: '200px' }}>
                                                <HobbyCard hobby={hobby} />
                                            </Box>
                                        ))}
                                    </Group>
                                ) : (
                                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                                        {hobbies.map((hobby) => (
                                            <HobbyCard key={hobby.id} hobby={hobby} />
                                        ))}
                                    </SimpleGrid>
                                )}
                            </Box>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            <Box py={60} id="testimonials">
                <Container size="xl">
                    <Stack gap="xl" align="center">
                        <Group gap="sm">
                            <IconMessage size={32} />
                            <Title order={2}>{t("sections.testimonials")}</Title>
                        </Group>

                        {testimonials.length > 0 && (
                            <Box w="100%" style={{ display: 'flex', justifyContent: 'center' }}>
                                <Box style={{ width: '100%', maxWidth: '1200px' }}>
                                    {testimonials.length === 1 ? (
                                        <Group justify="center">
                                            {testimonials.map((testimonial) => (
                                                <Box key={testimonial.id} style={{ width: '100%', maxWidth: '400px' }}>
                                                    <TestimonialCard testimonial={testimonial} />
                                                </Box>
                                            ))}
                                        </Group>
                                    ) : testimonials.length === 2 ? (
                                        <Group justify="center" gap="lg">
                                            {testimonials.map((testimonial) => (
                                                <Box key={testimonial.id} style={{ width: '100%', maxWidth: '400px' }}>
                                                    <TestimonialCard testimonial={testimonial} />
                                                </Box>
                                            ))}
                                        </Group>
                                    ) : (
                                        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                                            {testimonials.map((testimonial) => (
                                                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                                            ))}
                                        </SimpleGrid>
                                    )}
                                </Box>
                            </Box>
                        )}

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
                                            />
                                        </Group>
                                        <Textarea
                                            label={t("form.message")}
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
                                        />
                                        <Button
                                            leftSection={<IconSend size={20} />}
                                            onClick={handleContactSubmit}
                                            size="lg"
                                            fullWidth
                                            mt="sm"
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