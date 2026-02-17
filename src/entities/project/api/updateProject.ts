'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Project, ProjectRequestModel} from "@/entities/project";
import {Prisma} from "@prisma/client";

export async function updateProject(
    projectId: string,
    project: ProjectRequestModel & { skills?: string[] }
): Promise<Project | null> {
    const { skills, ...projectData } = project;

    try {
        return await prisma.project.update({
            data: {
                ...projectData,
                skills: skills ? {
                    set: [],
                    connect: skills.map((skillName: string) => ({
                        name: skillName
                    }))
                } : undefined
            },
            where: { id: projectId }
        });
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return null;
        }

        throw error;
    }
}