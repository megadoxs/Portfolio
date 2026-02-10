"use client";

import {Button, Group, Modal, Stack, Textarea, TextInput, Stepper, Text, Combobox, useCombobox, Loader, Select, Switch, Pill} from "@mantine/core";
import {DateInput} from "@mantine/dates";
import {IconCalendar, IconCheck, IconBrandGithub} from "@tabler/icons-react";
import {useForm} from "@mantine/form";
import {useEffect, useState} from "react";
import {ProjectRequestModel, ProjectStatus} from "@/entities/project";
import {getContact} from "@/entities/contact";
import {getAllSkills, Skill} from "@/entities/skill";
import {useLocale, useTranslations} from "next-intl";
import 'dayjs/locale/fr';

interface ProjectModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: ProjectRequestModel & { skills: string[] }) => Promise<void>;
    isLoading?: boolean;
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

// Helper function to get skill icon URL
const getSkillIconUrl = (skillName: string): string => {
    // Normalize skill name to match skillicons format
    const normalized = skillName.toLowerCase()
        .replace(/\s+/g, '')
        .replace('c++', 'cpp')
        .replace('c#', 'cs')
        .replace('.net', 'dotnet')
        .replace('node.js', 'nodejs')
        .replace('next.js', 'nextjs')
        .replace('vue.js', 'vue')
        .replace('typescript', 'ts')
        .replace('javascript', 'js');

    return `https://skillicons.dev/icons?i=${normalized}`;
};

export default function AddProjectModal({
                                            opened,
                                            onClose,
                                            onSubmit,
                                            isLoading = false
                                        }: ProjectModalProps) {
    const t = useTranslations("projects.addProjectModal");
    const locale = useLocale();

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

    const form = useForm<ProjectRequestModel & { active: boolean }>({
        initialValues: {
            title: "",
            description: "",
            githubUrl: "",
            status: ProjectStatus.ACTIVE,
            active: true,
            startDate: new Date(),
            endDate: null,
        },
        validate: {
            title: (value) => (!value.trim() ? t("validation.titleRequired") : null),
            description: (value) => (!value.trim() ? t("validation.descriptionRequired") : null),
            githubUrl: (value) => {
                if (!value.trim()) return t("validation.githubUrlRequired");

                try {
                    const url = new URL(value);

                    if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') {
                        return t("validation.validGithubUrl");
                    }

                    const pathParts = url.pathname.split('/').filter(part => part.length > 0);

                    if (pathParts.length < 2) {
                        return t("validation.validRepoUrl");
                    }

                    const [username, repo] = pathParts;
                    if (!username || !repo) {
                        return t("validation.validRepoUrl");
                    }

                    return null;
                } catch {
                    return t("validation.validUrl");
                }
            },
            startDate: (value) => (!value ? t("validation.startDateRequired") : null),
            endDate: (value, values) => {
                if (!value) {
                    // If status is COMPLETED, endDate is required
                    if (values.status === ProjectStatus.COMPLETED) {
                        return t("validation.endDateRequiredCompleted");
                    }
                    return null;
                }
                if (values.startDate && value < values.startDate) {
                    return t("validation.endDateBeforeStart");
                }
                return null;
            },
        },
    });

    useEffect(() => {
        if (opened) {
            form.reset();
            setActiveStep(0);
            setDetectedLanguages([]);
            setSelectedSkills([]);
            setRepoDetails(null);
        }
    }, [opened]);

    const loadAvailableSkills = async () => {
        try {
            const skills = await getAllSkills();
            setAvailableSkills(skills);
        } catch (error) {
            console.error("Failed to load skills:", error);
        }
    };

    const fetchUserGithubRepos = async () => {
        try {
            const contact = await getContact();
            if (!contact.github) return;

            // Extract username from GitHub URL
            const username = contact.github.split('/').pop();
            if (!username) return;

            setIsLoadingRepos(true);

            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated`);

            if (response.ok) {
                const repos: GitHubRepo[] = await response.json();
                setGithubRepos(repos);
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

            if (response.status === 404) {
                return t("validation.repoNotFound");
            }

            if (response.status === 403) {
                return t("validation.rateLimitExceeded");
            }

            if (!response.ok) {
                return t("validation.unableToVerify");
            }

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

            if (!response.ok) {
                console.error("Failed to fetch languages");
                return [];
            }

            const languages = await response.json();
            return Object.keys(languages);
        } catch (error) {
            setIsLoadingLanguages(false);
            console.error("Error fetching languages:", error);
            return [];
        }
    };

    const handleNextStep = async () => {
        if (activeStep === 0) {
            // Validate GitHub URL
            const urlError = form.validateField('githubUrl');
            if (urlError.hasError) {
                return;
            }

            // Validate GitHub repository
            const repoError = await validateGitHubRepo(form.values.githubUrl);

            if (repoError) {
                form.setFieldError('githubUrl', repoError);
                return;
            }

            // Fetch repository details
            const details = await fetchRepoDetails(form.values.githubUrl);
            if (details) {
                setRepoDetails(details);
                form.setFieldValue('title', details.name);
                form.setFieldValue('description', details.description);
            }

            setActiveStep(1);
        } else if (activeStep === 1) {
            // Validate title and description
            const titleError = form.validateField('title');
            const descError = form.validateField('description');

            if (titleError.hasError || descError.hasError) {
                return;
            }

            // Fetch repository languages
            const languages = await fetchRepositoryLanguages(form.values.githubUrl);
            setDetectedLanguages(languages);
            setSelectedSkills(languages);

            setActiveStep(2);
        } else if (activeStep === 2) {
            setActiveStep(3);
        }
    };

    const handlePrevStep = () => {
        if (activeStep > 0) {
            setActiveStep(activeStep - 1);
        }
    };

    const handleSubmit = async () => {
        // Validate final step
        const validationResult = form.validate();
        if (validationResult.hasErrors) {
            return;
        }

        await onSubmit({
            ...form.values,
            skills: selectedSkills,
        });
    };

    const handleClose = () => {
        setActiveStep(0);
        setDetectedLanguages([]);
        setSelectedSkills([]);
        setRepoDetails(null);
        setSkillSearchValue("");
        onClose();
    };

    const skillOptions = availableSkills.map(skill => ({
        value: skill.name,
        label: skill.name,
    }));

    // Add detected languages that might not be in the skills list
    const allSkillOptions = [
        ...skillOptions,
        ...detectedLanguages
            .filter(lang => !skillOptions.some(opt => opt.value === lang))
            .map(lang => ({ value: lang, label: lang }))
    ];

    // Get filtered skill options for display
    const getFilteredSkillOptions = () => {
        if (!skillSearchValue.trim()) {
            // Show all available skills when no search
            return allSkillOptions.filter(skill => !selectedSkills.includes(skill.value));
        }

        return allSkillOptions
            .filter(skill =>
                !selectedSkills.includes(skill.value) &&
                skill.label.toLowerCase().includes(skillSearchValue.toLowerCase())
            )
            .slice(0, 10);
    };

    const filteredSkillOptions = getFilteredSkillOptions();

    // Combobox for GitHub repos
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    // Filter repos by name for display
    const getFilteredRepos = (searchValue: string) => {
        if (!searchValue) return githubRepos;
        return githubRepos.filter(repo =>
            repo.name.toLowerCase().includes(searchValue.toLowerCase())
        );
    };

    const filteredRepos = getFilteredRepos(form.values.githubUrl);

    const statusOptions = [
        { value: ProjectStatus.ACTIVE, label: t("status.active") },
        { value: ProjectStatus.INACTIVE, label: t("status.inactive") },
        { value: ProjectStatus.COMPLETED, label: t("status.completed") },
    ];

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={t("title")}
            centered
            size="xl"
            radius="lg"
            withCloseButton={!isLoading && !isValidatingRepo && !isLoadingLanguages}
            closeOnEscape={!isLoading && !isValidatingRepo && !isLoadingLanguages}
        >
            <Stepper active={activeStep} mb="xl">
                <Stepper.Step label={t("steps.repository.label")} description={t("steps.repository.description")}>
                    {/* Step content is below */}
                </Stepper.Step>
                <Stepper.Step label={t("steps.details.label")} description={t("steps.details.description")}>
                    {/* Step content is below */}
                </Stepper.Step>
                <Stepper.Step label={t("steps.skills.label")} description={t("steps.skills.description")}>
                    {/* Step content is below */}
                </Stepper.Step>
                <Stepper.Step label={t("steps.settings.label")} description={t("steps.settings.description")}>
                    {/* Step content is below */}
                </Stepper.Step>
            </Stepper>

            <form onSubmit={(e) => {
                e.preventDefault();
                if (activeStep === 3) {
                    handleSubmit();
                }
            }}>
                {/* Step 0: GitHub Repository */}
                {activeStep === 0 && (
                    <Stack gap="md">
                        <Combobox
                            store={combobox}
                            onOptionSubmit={(value) => {
                                form.setFieldValue('githubUrl', value);
                                combobox.closeDropdown();
                            }}
                        >
                            <Combobox.Target>
                                <TextInput
                                    label={t("fields.githubUrl.label")}
                                    placeholder={t("fields.githubUrl.placeholder")}
                                    radius="xl"
                                    value={form.values.githubUrl}
                                    onChange={(event) => {
                                        form.setFieldValue('githubUrl', event.currentTarget.value);
                                        combobox.openDropdown();
                                    }}
                                    onClick={() => combobox.openDropdown()}
                                    onFocus={() => combobox.openDropdown()}
                                    onBlur={() => combobox.closeDropdown()}
                                    error={form.errors.githubUrl}
                                    leftSection={<IconBrandGithub size={16} stroke={1.5} />}
                                    rightSection={isLoadingRepos ? <Loader size="xs" /> : null}
                                    styles={{
                                        input: { border: "1px solid var(--mantine-color-gray-3)" },
                                    }}
                                />
                            </Combobox.Target>

                            {filteredRepos.length > 0 && (
                                <Combobox.Dropdown>
                                    <Combobox.Options>
                                        {filteredRepos.slice(0, 10).map((repo) => (
                                            <Combobox.Option value={repo.html_url} key={repo.html_url}>
                                                {repo.html_url}
                                            </Combobox.Option>
                                        ))}
                                    </Combobox.Options>
                                </Combobox.Dropdown>
                            )}
                        </Combobox>
                        {githubRepos.length > 0 && (
                            <Text size="xs" c="dimmed" mt="-xs">
                                {t("fields.githubUrl.suggestions", { count: githubRepos.length })}
                            </Text>
                        )}

                        <Group justify="flex-end" gap="sm" mt="sm">
                            <Button
                                variant="subtle"
                                radius="xl"
                                onClick={handleClose}
                                disabled={isValidatingRepo}
                            >
                                {t("buttons.cancel")}
                            </Button>
                            <Button
                                variant="filled"
                                radius="xl"
                                onClick={handleNextStep}
                                loading={isValidatingRepo}
                            >
                                {t("buttons.next")}
                            </Button>
                        </Group>
                    </Stack>
                )}

                {/* Step 1: Title and Description */}
                {activeStep === 1 && (
                    <Stack gap="md">
                        {repoDetails && (
                            <Group gap="xs" mb="xs">
                                <IconCheck size={18} stroke={1.5} style={{ color: 'var(--mantine-color-green-6)' }} />
                                <Text size="sm" c="dimmed">
                                    {t("messages.repoDetailsLoaded", { repo: repoDetails.full_name })}
                                </Text>
                            </Group>
                        )}

                        <TextInput
                            label={t("fields.title.label")}
                            placeholder={t("fields.title.placeholder")}
                            radius="xl"
                            {...form.getInputProps("title")}
                            styles={{
                                input: { border: "1px solid var(--mantine-color-gray-3)" },
                            }}
                        />

                        <Textarea
                            label={t("fields.description.label")}
                            placeholder={t("fields.description.placeholder")}
                            radius="xl"
                            autosize
                            minRows={3}
                            maxRows={6}
                            {...form.getInputProps("description")}
                            styles={{
                                input: { border: "1px solid var(--mantine-color-gray-3)" },
                            }}
                        />

                        <Group justify="flex-end" gap="sm" mt="sm">
                            <Button
                                variant="subtle"
                                radius="xl"
                                onClick={handlePrevStep}
                            >
                                {t("buttons.back")}
                            </Button>
                            <Button
                                variant="subtle"
                                radius="xl"
                                onClick={handleClose}
                            >
                                {t("buttons.cancel")}
                            </Button>
                            <Button
                                variant="filled"
                                radius="xl"
                                onClick={handleNextStep}
                            >
                                {t("buttons.next")}
                            </Button>
                        </Group>
                    </Stack>
                )}

                {/* Step 2: Skills */}
                {activeStep === 2 && (
                    <Stack gap="md">
                        {detectedLanguages.length > 0 && (
                            <Group gap="xs" mb="xs">
                                <IconCheck size={18} stroke={1.5} style={{ color: 'var(--mantine-color-green-6)' }} />
                                <Text size="sm" c="dimmed">
                                    {t("messages.languagesDetected", { count: detectedLanguages.length })}
                                </Text>
                            </Group>
                        )}

                        <div>
                            <Text size="sm" fw={500} mb="xs">{t("fields.skills.label")}</Text>
                            <Group gap="sm" wrap="nowrap">
                                <Combobox
                                    store={combobox}
                                    onOptionSubmit={(value) => {
                                        if (!selectedSkills.includes(value)) {
                                            setSelectedSkills([...selectedSkills, value]);
                                        }
                                        setSkillSearchValue("");
                                        combobox.closeDropdown();
                                    }}
                                >
                                    <Combobox.Target>
                                        <TextInput
                                            placeholder={t("fields.skills.placeholder")}
                                            radius="xl"
                                            value={skillSearchValue}
                                            onChange={(event) => {
                                                setSkillSearchValue(event.currentTarget.value);
                                                combobox.openDropdown();
                                                combobox.updateSelectedOptionIndex();
                                            }}
                                            onClick={() => combobox.openDropdown()}
                                            onFocus={() => combobox.openDropdown()}
                                            onBlur={() => {
                                                combobox.closeDropdown();
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' && skillSearchValue.trim()) {
                                                    event.preventDefault();
                                                    if (!selectedSkills.includes(skillSearchValue.trim())) {
                                                        setSelectedSkills([...selectedSkills, skillSearchValue.trim()]);
                                                    }
                                                    setSkillSearchValue("");
                                                    combobox.closeDropdown();
                                                }
                                            }}
                                            styles={{
                                                input: { border: "1px solid var(--mantine-color-gray-3)" },
                                            }}
                                        />
                                    </Combobox.Target>

                                    {filteredSkillOptions.length > 0 && (
                                        <Combobox.Dropdown>
                                            <Combobox.Options>
                                                {filteredSkillOptions.map((skill) => (
                                                    <Combobox.Option value={skill.value} key={skill.value}>
                                                        <Group gap="xs" wrap="nowrap">
                                                            <img
                                                                src={getSkillIconUrl(skill.value)}
                                                                alt={skill.label}
                                                                style={{ width: 20, height: 20, objectFit: 'contain' }}
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                            <span>{skill.label}</span>
                                                        </Group>
                                                    </Combobox.Option>
                                                ))}
                                            </Combobox.Options>
                                        </Combobox.Dropdown>
                                    )}
                                </Combobox>

                                <Button
                                    variant="filled"
                                    radius="xl"
                                    onClick={() => {
                                        // TODO: Open modal to create new skill with form
                                    }}
                                >
                                    {t("buttons.createSkill")}
                                </Button>
                            </Group>
                            <Text size="xs" c="dimmed" mt="xs">
                                {t("fields.skills.hint")}
                            </Text>
                        </div>

                        {/* Display selected skills */}
                        {selectedSkills.length > 0 && (
                            <Stack gap="xs">
                                <Text size="sm" fw={500}>{t("fields.skills.selected", { count: selectedSkills.length })}</Text>
                                <Group gap="xs">
                                    {selectedSkills.map((skill) => (
                                        <Pill
                                            key={skill}
                                            withRemoveButton
                                            onRemove={() => {
                                                setSelectedSkills(selectedSkills.filter(s => s !== skill));
                                            }}
                                            size="lg"
                                        >
                                            <Group gap={6} wrap="nowrap">
                                                <img
                                                    src={getSkillIconUrl(skill)}
                                                    alt={skill}
                                                    style={{ width: 16, height: 16, objectFit: 'contain' }}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                                <span>{skill}</span>
                                            </Group>
                                        </Pill>
                                    ))}
                                </Group>
                            </Stack>
                        )}

                        <Group justify="flex-end" gap="sm" mt="md">
                            <Button
                                variant="subtle"
                                radius="xl"
                                onClick={handlePrevStep}
                                disabled={isLoadingLanguages}
                            >
                                {t("buttons.back")}
                            </Button>
                            <Button
                                variant="subtle"
                                radius="xl"
                                onClick={handleClose}
                                disabled={isLoadingLanguages}
                            >
                                {t("buttons.cancel")}
                            </Button>
                            <Button
                                variant="filled"
                                radius="xl"
                                onClick={handleNextStep}
                                loading={isLoadingLanguages}
                            >
                                {t("buttons.next")}
                            </Button>
                        </Group>
                    </Stack>
                )}

                {/* Step 3: Dates, Status, and Active */}
                {activeStep === 3 && (
                    <Stack gap="md">
                        <Group grow gap="md">
                            <DateInput
                                label={t("fields.startDate.label")}
                                placeholder={t("fields.startDate.placeholder")}
                                radius="xl"
                                valueFormat="MMM DD, YYYY"
                                leftSection={<IconCalendar size={16} stroke={1.5} />}
                                leftSectionPointerEvents="none"
                                value={form.values.startDate}
                                onChange={(value) => {
                                    form.setFieldValue('startDate', value ? new Date(value) : new Date());
                                }}
                                error={form.errors.startDate}
                                styles={{
                                    input: { border: "1px solid var(--mantine-color-gray-3)" },
                                }}
                                locale={locale}
                            />

                            <DateInput
                                label={t("fields.endDate.label")}
                                placeholder={form.values.status === ProjectStatus.COMPLETED ? t("fields.endDate.placeholderCompleted") : t("fields.endDate.placeholder")}
                                radius="xl"
                                valueFormat="MMM DD, YYYY"
                                clearable
                                leftSection={<IconCalendar size={16} stroke={1.5} />}
                                leftSectionPointerEvents="none"
                                value={form.values.endDate}
                                onChange={(value) => {
                                    form.setFieldValue('endDate', value ? new Date(value) : null);
                                }}
                                error={form.errors.endDate}
                                styles={{
                                    input: { border: "1px solid var(--mantine-color-gray-3)" },
                                }}
                                locale={locale}
                            />
                        </Group>

                        <Select
                            label={t("fields.status.label")}
                            placeholder={t("fields.status.placeholder")}
                            data={statusOptions}
                            value={form.values.status}
                            onChange={(value) => form.setFieldValue('status', value as ProjectStatus)}
                            radius="xl"
                            styles={{
                                input: { border: "1px solid var(--mantine-color-gray-3)" },
                            }}
                        />

                        <Switch
                            label={t("fields.active.label")}
                            description={form.values.active ? t("fields.active.descriptionActive") : t("fields.active.descriptionInactive")}
                            checked={form.values.active}
                            onChange={(event) => form.setFieldValue('active', event.currentTarget.checked)}
                        />

                        <Group justify="flex-end" gap="sm" mt="md">
                            <Button
                                variant="subtle"
                                radius="xl"
                                onClick={handlePrevStep}
                                disabled={isLoading}
                            >
                                {t("buttons.back")}
                            </Button>
                            <Button
                                variant="subtle"
                                radius="xl"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                {t("buttons.cancel")}
                            </Button>
                            <Button
                                type="submit"
                                variant="filled"
                                radius="xl"
                                loading={isLoading}
                            >
                                {t("buttons.create")}
                            </Button>
                        </Group>
                    </Stack>
                )}
            </form>
        </Modal>
    );
}