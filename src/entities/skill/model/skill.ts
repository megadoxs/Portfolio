import {SkillCategory} from "@prisma/client";
import {Project} from "@/entities/project";

export { SkillCategory as SkillCategory };

export interface SkillWithProject extends Skill {
    projects: Project[];
}

export interface Skill {
    id: string;
    name: string;
    category: SkillCategory;
    icon: string | null;
}

export interface SkillRequestModel {
    name: string;
    category: SkillCategory;
    icon: File | null;
}