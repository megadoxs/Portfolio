'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Prisma} from "@prisma/client";
import {Work, WorkRequestModel} from "@/entities/work";

export async function updateWork(workId: string, work: WorkRequestModel): Promise<Work | null> {
    try {
        return prisma.work.update({
            data: work,
            where: {id: workId}
        })
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return null;
        }

        throw error;
    }
}