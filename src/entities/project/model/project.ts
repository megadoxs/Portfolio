import {Skill} from "@/entities/skill";
import {ProjectStatus} from "@prisma/client";

export { ProjectStatus as ProjectStatus };

export interface ProjectWithSkills extends Project{
    skills: Skill[];
}

export interface Project {
    id: string;
    title: string;
    description: string;
    githubUrl: string;
    status: ProjectStatus;
    active: boolean;
    startDate: Date;
    endDate: Date | null;
}

export interface ProjectRequestModel {
    title: string;
    description: string;
    githubUrl: string;
    status: ProjectStatus;
    active: boolean;
    startDate: Date;
    endDate: Date | null;
}