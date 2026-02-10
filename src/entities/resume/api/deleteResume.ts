'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Prisma} from "@prisma/client";
import {del} from "@vercel/blob";

export async function deleteResume(resumeId: string): Promise<boolean> {
    try {
        const resume = await prisma.resume.findUnique({
            where: {id: resumeId}
        });

        if (!resume) {
            return false;
        }

        await prisma.resume.delete({
            where: {id: resumeId}
        });

        await del(resume.url);

        const latestResume = await prisma.resume.findFirst({
            orderBy: {
                createdAt: 'desc'
            },
            where: {
                locale: resume.locale
            }
        });

        if (latestResume) {
            await prisma.resume.update({
                where: {
                    id: latestResume.id
                },
                data: {
                    active: true
                }
            });
        }

        return true;
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return false;
        }

        throw error;
    }
}