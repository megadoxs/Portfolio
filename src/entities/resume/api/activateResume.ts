'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Prisma} from "@prisma/client";
import {Resume} from "@/entities/resume";

export async function activateResume(resumeId: string): Promise<Resume | null> {
    try {
        const targetResume = await prisma.resume.findUnique({
            where: { id: resumeId },
            select: { locale: true }
        });

        if (!targetResume) {
            return null;
        }

        await prisma.resume.updateMany({
            data: {
                active: false
            },
            where: {
                locale: targetResume.locale,
                id: { not: resumeId }
            }
        });

        return await prisma.resume.update({
            data: {
                active: true
            },
            where: {
                id: resumeId
            }
        });
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return null;
        }

        throw error;
    }
}