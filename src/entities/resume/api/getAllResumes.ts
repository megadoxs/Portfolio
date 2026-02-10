'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Resume} from "@/entities/resume";

export async function getAllResumes(): Promise<Resume[]> {
    return prisma.resume.findMany({})
}