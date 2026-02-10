'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Prisma} from "@prisma/client";

export async function deleteWork(workId: string): Promise<boolean> {
    try {
        await prisma.work.delete({
            where: {id: workId}
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