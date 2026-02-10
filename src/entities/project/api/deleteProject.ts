'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Prisma} from "@prisma/client";

export async function deleteProject(projectId: string): Promise<boolean> {
    try {
        await prisma.project.delete({
            where: {id: projectId}
        })
        return true;
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return false;
        }

        throw error;
    }
}