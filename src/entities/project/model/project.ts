import {Skill} from "@/entities/skill";
import {ProjectStatus} from "@prisma/client";

export { ProjectStatus as ProjectStatus };

export interface ProjectWithSkills extends Project {
    skills: Skill[];
}

export interface Project {
    id: string;
    title: string;
    description_en: string;
    description_fr: string;
    githubUrl: string;
    status: ProjectStatus;
    active: boolean;
    startDate: string;
    endDate: string | null;
}

export interface ProjectRequestModel {
    title: string;
    description_en: string;
    description_fr: string;
    githubUrl: string;
    status: ProjectStatus;
    active: boolean;
    startDate: string;
    endDate: string | null;
}

export interface ProjectFormValues {
    title: string;
    description: string;
    githubUrl: string;
    status: ProjectStatus;
    active: boolean;
    startDate: string;
    endDate: string | null;
}