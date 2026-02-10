'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Education} from "@/entities/education";

export async function getAllEducation(): Promise<Education[]> {
    return prisma.education.findMany({
        orderBy: {
            startDate: 'desc'
        }
    })
}