'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Prisma} from "@prisma/client";

export async function deleteEducation(educationId: string): Promise<boolean> {
    try {
        await prisma.education.delete({
            where: {id: educationId}
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