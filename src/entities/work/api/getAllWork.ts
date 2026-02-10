'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Work} from "@/entities/work";

export async function getAllWork(): Promise<Work[]> {
    return prisma.work.findMany({
        orderBy: {
            startDate: 'desc'
        }
    })
}