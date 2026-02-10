'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Project} from "@/entities/project";
import {ProjectWithSkills} from "@/entities/project/model/project";

export async function getAllProjects(): Promise<ProjectWithSkills[]> {
    return prisma.project.findMany({
        include: {
            skills: true
        }
    })
}