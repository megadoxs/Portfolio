'use server'

import { prisma } from "@/shared/lib/prisma/db";
import {ProjectRequestModel} from "@/entities/project";

export async function addProject(project: ProjectRequestModel & { skills?: string[] }) {
    const { skills, ...projectData } = project;

    await prisma.project.create({
        data: {
            ...projectData,
            skills: skills && skills.length > 0 ? {
                connectOrCreate: skills.map((skillName: string) => ({
                    where: { name: skillName },
                    create: { name: skillName }
                }))
            } : undefined
        }
    });
}