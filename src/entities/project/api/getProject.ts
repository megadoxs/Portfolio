'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Project} from "@/entities/project";

export async function getProject(projectId: string): Promise<Project | null> {
    return prisma.project.findFirst({
        where: {id: projectId}
    })
}