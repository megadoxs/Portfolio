'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Project, ProjectRequestModel} from "@/entities/project";
import {Prisma} from "@prisma/client";

export async function updateProject(projectId: string, project: ProjectRequestModel): Promise<Project | null> {
    try {
        return prisma.project.update({
            data: project,
            where: {id: projectId}
        })
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return null;
        }

        throw error;
    }
}