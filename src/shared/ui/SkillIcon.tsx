import Image from "next/image";
import {Skill} from "@/entities/skill";


interface SkillIconProps {
    skill: Skill;
    size?: number;
    alt?: string;
}

export const SkillIcon = ({
                              skill,
                              size = 20,
                              alt
                          }: SkillIconProps) => {

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

    return ( //TODO finish implement
        // <Image
        //     src={skill.image ? skill.image : getSkillIconUrl(skillName)}
        //     alt={alt || skill.name}
        //     style={{
        //         width: size,
        //         height: size,
        //         objectFit: 'contain'
        //     }}
        //     onError={(e) => {
        //         e.currentTarget.style.display = 'none';
        //     }}
        // />
        <>
        </>
    );
};