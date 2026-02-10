'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {put} from "@vercel/blob";
import {HobbyRequestModel} from "@/entities/hobby";

export async function addHobby(hobby: HobbyRequestModel) {
    const blob = await put(`hobbies/${Date.now()}.${hobby.file.type.split('/')[1]}`, hobby.file, {
        access: "public",
    });

    await prisma.hobby.create({
        data: {
            name: hobby.name,
            picture: blob.url,
        }
    });
}