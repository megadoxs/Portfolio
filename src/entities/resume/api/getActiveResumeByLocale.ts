'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Resume} from "@/entities/resume";

export async function getActiveResumeByLocale(locale: string): Promise<Resume | null> {
    return prisma.resume.findFirst({
        where: {
            locale: locale,
            active: true
        }
    })
}