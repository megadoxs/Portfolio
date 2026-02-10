import { Pill, Group } from "@mantine/core";
import {SkillIcon} from "@/shared/ui/SkillIcon";

interface SkillPillProps {
    skill: string;
    onRemove?: (skill: string) => void;
    withIcon?: boolean;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const SkillPill = ({
                              skill,
                              onRemove,
                              withIcon = true,
                              size = "lg"
                          }: SkillPillProps) => {
    return (
        <Pill
            withRemoveButton={!!onRemove}
            onRemove={onRemove ? () => onRemove(skill) : undefined}
            size={size}
        >
            <Group gap={6} wrap="nowrap">
                {withIcon && <SkillIcon skillName={skill} size={16} />}
                <span>{skill}</span>
            </Group>
        </Pill>
    );
};