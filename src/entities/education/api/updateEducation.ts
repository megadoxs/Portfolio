'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Prisma} from "@prisma/client";
import {Education, EducationRequestModel} from "@/entities/education";

export async function updateEducation(educationId: string, education: EducationRequestModel): Promise<Education | null> {
    try {
        return prisma.education.update({
            data: education,
            where: {id: educationId}
        })
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return null;
        }

        throw error;
    }
}