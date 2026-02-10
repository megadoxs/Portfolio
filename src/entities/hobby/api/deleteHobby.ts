'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Prisma} from "@prisma/client";
import {del} from "@vercel/blob";

export async function deleteHobby(hobbyId: string): Promise<boolean> {
    try {
        const hobby = await prisma.hobby.findUnique({
            where: {id: hobbyId}
        });

        if (!hobby) {
            return false;
        }

        await prisma.hobby.delete({
            where: {id: hobbyId}
        });

        await del(hobby.picture);

        return true;
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return false;
        }

        throw error;
    }
}