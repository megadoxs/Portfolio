import {Project} from "@prisma/client";

export interface SkillWithProject extends Skill {
    projects: Project[];
}

export interface Skill {
    id: string;
    name: string;
}

export interface SkillRequestModel {
    name: string;
}