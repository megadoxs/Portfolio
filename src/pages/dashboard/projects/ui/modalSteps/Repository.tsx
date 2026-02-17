import { Button, Combobox, Group, Loader, Stack, TextInput, useCombobox } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";
import { UseFormReturnType } from "@mantine/form";
import {ProjectFormValues} from "@/entities/project";

interface GitHubRepo {
    full_name: string;
    html_url: string;
    description: string;
    name: string;
}

interface RepositoryStepProps {
    form: UseFormReturnType<ProjectFormValues & { active: boolean }>;
    githubRepos: GitHubRepo[];
    isLoadingRepos: boolean;
    isValidatingRepo: boolean;
    theme: string;
    t: (key: string) => string;
    onNext: () => void;
    onCancel: () => void;
}

export default function RepositoryStep({
                                           form,
                                           githubRepos,
                                           isLoadingRepos,
                                           isValidatingRepo,
                                           theme,
                                           t,
                                           onNext,
                                           onCancel,
                                       }: RepositoryStepProps) {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const getFilteredRepos = (searchValue: string) => {
        if (!searchValue) return githubRepos;
        return githubRepos.filter(repo =>
            repo.name.toLowerCase().includes(searchValue.toLowerCase())
        );
    };

    const filteredRepos = getFilteredRepos(form.values.githubUrl);

    return (
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
                        {...form.getInputProps("githubUrl")}
                        onClick={() => combobox.openDropdown()}
                        onFocus={() => combobox.openDropdown()}
                        onBlur={() => combobox.closeDropdown()}
                        leftSection={<IconBrandGithub size={16} stroke={1.5} />}
                        rightSection={isLoadingRepos ? <Loader size="xs" /> : null}
                        styles={{
                            input: { border: "1px solid var(--mantine-color-gray-3)" },
                        }}
                    />
                </Combobox.Target>

                {filteredRepos.length > 0 && (
                    <Combobox.Dropdown
                        style={{
                            background: theme === 'dark'
                                ? 'rgba(26, 27, 30, 0.8)'
                                : 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                            border: theme === 'dark'
                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                : '1px solid rgba(0, 0, 0, 0.1)',
                            boxShadow: theme === 'dark'
                                ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                                : '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                        }}
                    >
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

            <Group justify="flex-end" gap="sm" mt="sm">
                <Button
                    variant="subtle"
                    radius="xl"
                    onClick={onCancel}
                    disabled={isValidatingRepo}
                >
                    {t("buttons.cancel")}
                </Button>
                <Button
                    variant="filled"
                    radius="xl"
                    onClick={onNext}
                    loading={isValidatingRepo}
                >
                    {t("buttons.next")}
                </Button>
            </Group>
        </Stack>
    );
}