import { Pill, Group } from "@mantine/core";
import {SkillIcon} from "@/shared/ui/SkillIcon";
import {Skill} from "@/entities/skill";

interface SkillPillProps {
    skill: Skill;
    onRemove?: (skill: Skill) => void;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const SkillPill = ({
                              skill,
                              onRemove,
                              size = "lg"
                          }: SkillPillProps) => {
    return (
        <Pill
            withRemoveButton={!!onRemove}
            onRemove={onRemove ? () => onRemove(skill) : undefined}
            size={size}
        >
            <Group gap={6} wrap="nowrap">
                <SkillIcon skill={skill} size={16}/>
            </Group>
        </Pill>
    );
};