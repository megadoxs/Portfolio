'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Project} from "@/entities/project";

export async function getAllProjectsBySkill(skilldId: string): Promise<Project[]> {
    return prisma.project.findMany({
        where : {
            skills: {
                some: {
                    id: skilldId
                }
            }
        }
    })
}