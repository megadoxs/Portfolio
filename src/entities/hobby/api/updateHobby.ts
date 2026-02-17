'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Prisma} from "@prisma/client";
import {del, put} from "@vercel/blob";
import {HobbyRequestModel} from "@/entities/hobby";

export async function updateHobby(hobbyId: string, request: HobbyRequestModel): Promise<boolean> {
    try {
        const existingHobby = await prisma.hobby.findUnique({
            where: {id: hobbyId}
        });

        if (!existingHobby) {
            return false;
        }

        const updateData: Prisma.HobbyUpdateInput = {};

        if (request.name_fr) {
            updateData.name_fr = request.name_fr;
        }

        if (request.name_en) {
            updateData.name_en = request.name_en;
        }

        if (request.file) {
            const blob = await put(`hobbies/${Date.now()}.${request.file.type.split('/')[1]}`, request.file, { access: "public" });

            updateData.picture = blob.url;

            await del(existingHobby.picture);
        }

        await prisma.hobby.update({
            where: {id: hobbyId},
            data: updateData
        });

        return true;
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return false;
        }

        throw error;
    }
}