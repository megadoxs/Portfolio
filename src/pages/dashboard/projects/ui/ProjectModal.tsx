"use client";

import { Modal, Stepper, Text, Box, Card } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import {ProjectFormValues, ProjectRequestModel, ProjectStatus, ProjectWithSkills} from "@/entities/project";
import { getContact } from "@/entities/contact";
import { getAllSkills, Skill, addSkill } from "@/entities/skill";
import { useLocale, useTranslations } from "next-intl";
import { useMantineColorScheme } from "@mantine/core";
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import RepositoryStep from "./modalSteps/Repository";
import DetailsStep from "./modalSteps/Details";
import SkillsStep from "./modalSteps/Skills";
import SettingsStep from "./modalSteps/Settings";
import { SkillRequestModel } from "@/entities/skill";
import SkillModal from "@/pages/dashboard/skills/ui/SkillModal";
import { useTranslate } from "@/shared/lib/translate/useTranslate";

interface ProjectModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: ProjectRequestModel & { skills: string[] }) => Promise<void>;
    isLoading?: boolean;
    existingRepoUrls: string[];
    project?: ProjectWithSkills | null;
    mode: 'add' | 'update';
}

interface GitHubRepo {
    full_name: string;
    html_url: string;
    description: string;
    name: string;
}

interface GitHubRepoDetails {
    name: string;
    description: string;
    full_name: string;
}

export default function ProjectModal({
                                         opened,
                                         onClose,
                                         onSubmit,
                                         isLoading = false,
                                         existingRepoUrls,
                                         project = null,
                                         mode
                                     }: ProjectModalProps) {
    const t = useTranslations("projects.projectModal");
    const locale = useLocale();
    const { colorScheme } = useMantineColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';
    const { translateFields, isTranslating } = useTranslate();

    const [isValidatingRepo, setIsValidatingRepo] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [detectedLanguages, setDetectedLanguages] = useState<string[]>([]);
    const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
    const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
    const [isLoadingRepos, setIsLoadingRepos] = useState(false);
    const [repoDetails, setRepoDetails] = useState<GitHubRepoDetails | null>(null);
    const [skillSearchValue, setSkillSearchValue] = useState("");

    const [skillModalOpened, setSkillModalOpened] = useState(false);
    const [projectModalOpened, setProjectModalOpened] = useState(false);
    const [isCreatingSkill, setIsCreatingSkill] = useState(false);

    const isUpdateMode = mode === 'update';

    const form = useForm<ProjectFormValues>({
        initialValues: {
            title: "",
            description: "",
            githubUrl: "",
            status: ProjectStatus.ACTIVE,
            active: true,
            startDate: "",
            endDate: null,
        },
        validate: {
            title: (value) => (!value.trim() ? t("validation.titleRequired") : null),
            description: (value) => (!value.trim() ? t("validation.descriptionRequired") : null),
            githubUrl: (value) => {
                if (isUpdateMode) return null;
                if (!value.trim()) return t("validation.githubUrlRequired");

                const normalizeUrl = (url: string) => {
                    try {
                        const urlObj = new URL(url);
                        const path = urlObj.pathname.replace(/\.git$/, '').replace(/\/$/, '');
                        return `${urlObj.hostname}${path}`.toLowerCase();
                    } catch {
                        return url.toLowerCase();
                    }
                };

                const normalizedInput = normalizeUrl(value);
                const isDuplicate = existingRepoUrls.some(existingUrl =>
                    normalizeUrl(existingUrl) === normalizedInput
                );
                if (isDuplicate) return t("validation.repoAlreadyUsed");

                try {
                    const url = new URL(value);
                    if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') {
                        return t("validation.validGithubUrl");
                    }
                    const pathParts = url.pathname.split('/').filter(part => part.length > 0);
                    if (pathParts.length < 2) return t("validation.validRepoUrl");
                    const [username, repo] = pathParts;
                    if (!username || !repo) return t("validation.validRepoUrl");
                    return null;
                } catch {
                    return t("validation.validUrl");
                }
            },
            startDate: (value) => {
                if (!value) return t("validation.startDateRequired");
                const now = dayjs().endOf('month');
                if (dayjs(value, 'YYYY-MM').isAfter(now)) return t("validation.startDateFuture");
                return null;
            },
            endDate: (value, values) => {
                if (!value) {
                    if (values.status === ProjectStatus.COMPLETED) {
                        return t("validation.endDateRequiredCompleted");
                    }
                    return null;
                }
                const now = dayjs().endOf('month');
                if (dayjs(value, 'YYYY-MM').isAfter(now)) return t("validation.endDateFuture");
                if (values.startDate && dayjs(value, 'YYYY-MM').isBefore(dayjs(values.startDate, 'YYYY-MM'))) {
                    return t("validation.endDateBeforeStart");
                }
                return null;
            },
        },
    });

    useEffect(() => {
        if (form.values.startDate && form.values.endDate) {
            if (dayjs(form.values.endDate, 'YYYY-MM').isBefore(dayjs(form.values.startDate, 'YYYY-MM'))) {
                form.setFieldValue('endDate', null);
            }
        }
    }, [form.values.startDate]);

    useEffect(() => {
        setProjectModalOpened(opened);
    }, [opened]);

    useEffect(() => {
        if (opened) {
            if (isUpdateMode && project) {
                form.setValues({
                    title: project.title,
                    description: project.description_en,
                    githubUrl: project.githubUrl,
                    startDate: project.startDate,
                    endDate: project.endDate,
                    status: project.status,
                    active: project.active,
                });
                setSelectedSkills(project.skills?.map(s => s.name) || []);
                setActiveStep(0);
            } else {
                form.reset();
                setActiveStep(0);
                setDetectedLanguages([]);
                setSelectedSkills([]);
                setRepoDetails(null);
            }
        }
    }, [opened, isUpdateMode, project]);

    const loadAvailableSkills = async () => {
        try {
            const skills = await getAllSkills();
            setAvailableSkills(skills);
        } catch (error) {
            console.error("Failed to load skills:", error);
        }
    };

    const fetchUserGithubRepos = async () => {
        if (isUpdateMode) return;
        try {
            const contact = await getContact();
            if (!contact.github) return;

            const username = contact.github.split('/').pop();
            if (!username) return;

            setIsLoadingRepos(true);

            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated`);

            if (response.ok) {
                const repos: GitHubRepo[] = await response.json();
                const normalizeUrl = (url: string) => {
                    try {
                        const urlObj = new URL(url);
                        const path = urlObj.pathname.replace(/\.git$/, '').replace(/\/$/, '');
                        return `${urlObj.hostname}${path}`.toLowerCase();
                    } catch {
                        return url.toLowerCase();
                    }
                };
                const availableRepos = repos.filter(repo =>
                    !existingRepoUrls.some(existingUrl =>
                        normalizeUrl(existingUrl) === normalizeUrl(repo.html_url)
                    )
                );
                setGithubRepos(availableRepos);
            }
        } catch (error) {
            console.error("Failed to fetch GitHub repos:", error);
        } finally {
            setIsLoadingRepos(false);
        }
    };

    useEffect(() => {
        if (opened) {
            loadAvailableSkills();
            fetchUserGithubRepos();
        }
    }, [opened]);

    const fetchRepoDetails = async (url: string): Promise<GitHubRepoDetails | null> => {
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
            if (pathParts.length < 2) return null;

            const [owner, repo] = pathParts;
            const repoName = repo.replace(/\.git$/, '');
            const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`);
            if (!response.ok) return null;

            const data = await response.json();
            return {
                name: data.name,
                description: data.description || "",
                full_name: data.full_name,
            };
        } catch (error) {
            console.error("Error fetching repo details:", error);
            return null;
        }
    };

    const validateGitHubRepo = async (url: string): Promise<string | null> => {
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
            if (pathParts.length < 2) return t("validation.invalidRepoUrl");

            const [owner, repo] = pathParts;
            const repoName = repo.replace(/\.git$/, '');

            setIsValidatingRepo(true);
            const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`);
            setIsValidatingRepo(false);

            if (response.status === 404) return t("validation.repoNotFound");
            if (response.status === 403) return t("validation.rateLimitExceeded");
            if (!response.ok) return t("validation.unableToVerify");

            return null;
        } catch (error) {
            setIsValidatingRepo(false);
            return t("validation.unableToVerify");
        }
    };

    const fetchRepositoryLanguages = async (url: string): Promise<string[]> => {
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
            if (pathParts.length < 2) return [];

            const [owner, repo] = pathParts;
            const repoName = repo.replace(/\.git$/, '');

            setIsLoadingLanguages(true);
            const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/languages`);
            setIsLoadingLanguages(false);

            if (!response.ok) return [];

            const languages = await response.json();
            return Object.keys(languages);
        } catch (error) {
            setIsLoadingLanguages(false);
            console.error("Error fetching languages:", error);
            return [];
        }
    };

    const handleNextStep = async () => {
        if (isUpdateMode) {
            if (activeStep === 0) {
                const titleError = form.validateField('title');
                const descError = form.validateField('description');
                if (titleError.hasError || descError.hasError) return;
                setActiveStep(1);
            } else if (activeStep === 1) {
                setActiveStep(2);
            }
        } else {
            if (activeStep === 0) {
                const urlError = form.validateField('githubUrl');
                if (urlError.hasError) return;

                const repoError = await validateGitHubRepo(form.values.githubUrl);
                if (repoError) {
                    form.setFieldError('githubUrl', repoError);
                    return;
                }

                const details = await fetchRepoDetails(form.values.githubUrl);
                if (details) {
                    setRepoDetails(details);
                    form.setFieldValue('title', details.name);
                    form.setFieldValue('description', details.description);
                }

                setActiveStep(1);
            } else if (activeStep === 1) {
                const titleError = form.validateField('title');
                const descError = form.validateField('description');
                if (titleError.hasError || descError.hasError) return;

                const languages = await fetchRepositoryLanguages(form.values.githubUrl);
                setDetectedLanguages(languages);
                setSelectedSkills(languages);

                setActiveStep(2);
            } else if (activeStep === 2) {
                setActiveStep(3);
            }
        }
    };

    const handlePrevStep = () => {
        if (activeStep > 0) setActiveStep(activeStep - 1);
    };

    const handleSubmit = async (values: ProjectFormValues) => {
        const translated = await translateFields({
            description: values.description,
        });

        const projectData: ProjectRequestModel & { skills: string[] } = {
            title: values.title,
            description_en: translated.description_en as string,
            description_fr: translated.description_fr as string,
            githubUrl: values.githubUrl,
            status: values.status,
            active: values.active,
            startDate: values.startDate,
            endDate: values.endDate,
            skills: selectedSkills,
        };

        await onSubmit(projectData);
        handleClose();
    };

    const handleClose = () => {
        setActiveStep(0);
        setDetectedLanguages([]);
        setSelectedSkills([]);
        setRepoDetails(null);
        setSkillSearchValue("");
        form.reset();
        onClose();
    };

    const handleSkillAdd = (skill: string) => setSelectedSkills([...selectedSkills, skill]);
    const handleSkillRemove = (skill: string) => setSelectedSkills(selectedSkills.filter(s => s !== skill));

    const handleOpenSkillModal = () => {
        setProjectModalOpened(false);
        setSkillModalOpened(true);
    };

    const handleCloseSkillModal = () => {
        setSkillModalOpened(false);
        setProjectModalOpened(true);
        loadAvailableSkills();
    };

    const handleSkillSubmit = async (skillData: SkillRequestModel) => {
        try {
            setIsCreatingSkill(true);
            await addSkill(skillData);
            await loadAvailableSkills();
            if (skillData.name) {
                setSelectedSkills([...selectedSkills, skillData.name]);
            }
            handleCloseSkillModal();
        } catch (error) {
            console.error("Failed to create skill:", error);
        } finally {
            setIsCreatingSkill(false);
        }
    };

    const finalStep = isUpdateMode ? 2 : 3;
    const isBusy = isLoading || isTranslating;

    return (
        <>
            <Modal
                opened={projectModalOpened}
                onClose={handleClose}
                title={<Text fw={700} size="lg">{t("title")}</Text>}
                size="xl"
                centered
                overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
                styles={{
                    content: { backgroundColor: 'transparent' },
                    header: { backgroundColor: 'transparent' },
                    body: { padding: 0, overflow: 'hidden' },
                }}
                withCloseButton={!isBusy && !isValidatingRepo && !isLoadingLanguages}
                closeOnEscape={!isBusy && !isValidatingRepo && !isLoadingLanguages}
            >
                <Box className={`glowWrapper ${theme}`}>
                    <Card className={`glassCard ${theme}`} p="xl" radius="md">
                        <Stepper active={activeStep} mb="xl">
                            {!isUpdateMode && (
                                <Stepper.Step label={t("steps.repository.label")} description={t("steps.repository.description")} />
                            )}
                            <Stepper.Step label={t("steps.details.label")} description={t("steps.details.description")} />
                            <Stepper.Step label={t("steps.skills.label")} description={t("steps.skills.description")} />
                            <Stepper.Step label={t("steps.settings.label")} description={t("steps.settings.description")} />
                        </Stepper>

                        <form onSubmit={form.onSubmit((values: ProjectFormValues) => {
                            if (activeStep === finalStep) {
                                handleSubmit(values);
                            }
                        })}>
                            {!isUpdateMode && activeStep === 0 && (
                                <RepositoryStep
                                    form={form}
                                    githubRepos={githubRepos}
                                    isLoadingRepos={isLoadingRepos}
                                    isValidatingRepo={isValidatingRepo}
                                    theme={theme}
                                    t={t}
                                    onNext={handleNextStep}
                                    onCancel={handleClose}
                                />
                            )}

                            {((isUpdateMode && activeStep === 0) || (!isUpdateMode && activeStep === 1)) && (
                                <DetailsStep
                                    form={form}
                                    repoDetails={isUpdateMode ? null : repoDetails}
                                    t={t}
                                    onNext={handleNextStep}
                                    onBack={handlePrevStep}
                                    onCancel={handleClose}
                                    showBackButton={!isUpdateMode || activeStep > 0}
                                />
                            )}

                            {((isUpdateMode && activeStep === 1) || (!isUpdateMode && activeStep === 2)) && (
                                <SkillsStep
                                    detectedLanguages={isUpdateMode ? [] : detectedLanguages}
                                    availableSkills={availableSkills}
                                    selectedSkills={selectedSkills}
                                    skillSearchValue={skillSearchValue}
                                    isLoadingLanguages={isUpdateMode ? false : isLoadingLanguages}
                                    theme={theme}
                                    t={t}
                                    onSkillSearchChange={setSkillSearchValue}
                                    onSkillAdd={handleSkillAdd}
                                    onSkillRemove={handleSkillRemove}
                                    onNext={handleNextStep}
                                    onBack={handlePrevStep}
                                    onCancel={handleClose}
                                    onOpenSkillModal={handleOpenSkillModal}
                                />
                            )}

                            {((isUpdateMode && activeStep === 2) || (!isUpdateMode && activeStep === 3)) && (
                                <SettingsStep
                                    form={form}
                                    isLoading={isBusy}
                                    locale={locale}
                                    t={t}
                                    onBack={handlePrevStep}
                                    onCancel={handleClose}
                                    onSubmit={() => handleSubmit(form.values)}
                                    mode={mode}
                                />
                            )}
                        </form>
                    </Card>
                </Box>
            </Modal>

            <SkillModal
                opened={skillModalOpened}
                onClose={handleCloseSkillModal}
                onSubmit={handleSkillSubmit}
                isLoading={isCreatingSkill}
                skill={null}
            />
        </>
    );
}