'use client'

import Image from "next/image";
import { Pill, Group, Text, Menu, ActionIcon } from "@mantine/core";
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react";
import { Skill } from "@/entities/skill";

interface SkillPillProps {
    skill: Skill;
    onEdit?: (skill: Skill) => void;
    onDelete?: (skill: Skill) => void;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const SkillPill = ({ skill, onEdit, onDelete, size = "lg" }: SkillPillProps) => {
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

    const sizeConfig = {
        xs: { iconSize: 12, gap: 4, fontSize: 'xs' as const, menuIconSize: 12 },
        sm: { iconSize: 14, gap: 5, fontSize: 'sm' as const, menuIconSize: 14 },
        md: { iconSize: 16, gap: 6, fontSize: 'sm' as const, menuIconSize: 14 },
        lg: { iconSize: 18, gap: 6, fontSize: 'md' as const, menuIconSize: 16 },
        xl: { iconSize: 20, gap: 8, fontSize: 'lg' as const, menuIconSize: 18 },
    };

    const config = sizeConfig[size];
    const hasActions = !!(onEdit || onDelete);

    return (
        <Pill size={size}>
            <Group gap={config.gap} wrap="nowrap">
                <Image
                    src={skill.icon ? skill.icon : getSkillIconUrl(skill.name)}
                    alt={skill.name}
                    width={config.iconSize}
                    height={config.iconSize}
                    style={{
                        width: config.iconSize,
                        height: config.iconSize,
                        objectFit: 'contain'
                    }}
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />
                <Text size={config.fontSize}>{skill.name}</Text>

                {hasActions && (
                    <Menu shadow="md" width={120} position="bottom-end" withinPortal>
                        <Menu.Target>
                            <ActionIcon
                                size={size === 'xs' ? 'xs' : 'sm'}
                                variant="subtle"
                                color="gray"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <IconDots size={config.menuIconSize} />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            {onEdit && (
                                <Menu.Item
                                    leftSection={<IconEdit size={14} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(skill);
                                    }}
                                >
                                    Edit
                                </Menu.Item>
                            )}
                            {onDelete && (
                                <Menu.Item
                                    color="red"
                                    leftSection={<IconTrash size={14} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(skill);
                                    }}
                                >
                                    Delete
                                </Menu.Item>
                            )}
                        </Menu.Dropdown>
                    </Menu>
                )}
            </Group>
        </Pill>
    );
};