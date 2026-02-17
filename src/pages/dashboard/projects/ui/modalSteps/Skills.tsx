import { Button, Combobox, Group, Pill, Stack, Text, TextInput, useCombobox } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { Skill } from "@/entities/skill";

interface SkillsStepProps {
    detectedLanguages: string[];
    availableSkills: Skill[];
    selectedSkills: string[];
    skillSearchValue: string;
    isLoadingLanguages: boolean;
    theme: string;
    t: (key: string, values?: Record<string, string | number | Date>) => string;
    onSkillSearchChange: (value: string) => void;
    onSkillAdd: (skill: string) => void;
    onSkillRemove: (skill: string) => void;
    onNext: () => void;
    onBack: () => void;
    onCancel: () => void;
    onOpenSkillModal: () => void;
}

const getSkillIconUrl = (skillName: string): string => {
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

export default function SkillsStep({
                                       detectedLanguages,
                                       availableSkills,
                                       selectedSkills,
                                       skillSearchValue,
                                       isLoadingLanguages,
                                       theme,
                                       t,
                                       onSkillSearchChange,
                                       onSkillAdd,
                                       onSkillRemove,
                                       onNext,
                                       onBack,
                                       onCancel,
                                       onOpenSkillModal,
                                   }: SkillsStepProps) {
    const skillCombobox = useCombobox({
        onDropdownClose: () => skillCombobox.resetSelectedOption(),
    });

    const skillOptions = availableSkills.map(skill => ({
        value: skill.name,
        label: skill.name,
    }));

    const allSkillOptions = [
        ...skillOptions,
        ...detectedLanguages
            .filter(lang => !skillOptions.some(opt => opt.value === lang))
            .map(lang => ({ value: lang, label: lang }))
    ];

    const getFilteredSkillOptions = () => {
        if (!skillSearchValue.trim()) {
            return allSkillOptions.filter(skill => !selectedSkills.includes(skill.value)).slice(0, 5);
        }

        return allSkillOptions
            .filter(skill =>
                !selectedSkills.includes(skill.value) &&
                skill.label.toLowerCase().includes(skillSearchValue.toLowerCase())
            )
            .slice(0, 5);
    };

    const filteredSkillOptions = getFilteredSkillOptions();

    return (
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
                        store={skillCombobox}
                        position="bottom-start"
                        withinPortal={true}
                        onOptionSubmit={(value) => {
                            if (!selectedSkills.includes(value)) {
                                onSkillAdd(value);
                            }
                            onSkillSearchChange("");
                            skillCombobox.closeDropdown();
                        }}
                    >
                        <Combobox.Target>
                            <TextInput
                                placeholder={t("fields.skills.placeholder")}
                                radius="xl"
                                value={skillSearchValue}
                                onChange={(event) => {
                                    onSkillSearchChange(event.currentTarget.value);
                                    skillCombobox.openDropdown();
                                    skillCombobox.updateSelectedOptionIndex();
                                }}
                                onClick={() => skillCombobox.openDropdown()}
                                onFocus={() => skillCombobox.openDropdown()}
                                onBlur={() => {
                                    skillCombobox.closeDropdown();
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && skillSearchValue.trim()) {
                                        event.preventDefault();
                                        if (!selectedSkills.includes(skillSearchValue.trim())) {
                                            onSkillAdd(skillSearchValue.trim());
                                        }
                                        onSkillSearchChange("");
                                        skillCombobox.closeDropdown();
                                    }
                                }}
                                styles={{
                                    input: { border: "1px solid var(--mantine-color-gray-3)" },
                                }}
                            />
                        </Combobox.Target>

                        {filteredSkillOptions.length > 0 && (
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
                        onClick={onOpenSkillModal}
                    >
                        {t("buttons.createSkill")}
                    </Button>
                </Group>
                <Text size="xs" c="dimmed" mt="xs">
                    {t("fields.skills.hint")}
                </Text>
            </div>

            {selectedSkills.length > 0 && (
                <Stack gap="xs">
                    <Text size="sm" fw={500}>{t("fields.skills.selected", { count: selectedSkills.length })}</Text>
                    <Group gap="xs">
                        {selectedSkills.map((skill) => (
                            <Pill
                                key={skill}
                                withRemoveButton
                                onRemove={() => onSkillRemove(skill)}
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
                    onClick={onBack}
                    disabled={isLoadingLanguages}
                >
                    {t("buttons.back")}
                </Button>
                <Button
                    variant="subtle"
                    radius="xl"
                    onClick={onCancel}
                    disabled={isLoadingLanguages}
                >
                    {t("buttons.cancel")}
                </Button>
                <Button
                    variant="filled"
                    radius="xl"
                    onClick={onNext}
                    loading={isLoadingLanguages}
                >
                    {t("buttons.next")}
                </Button>
            </Group>
        </Stack>
    );
}