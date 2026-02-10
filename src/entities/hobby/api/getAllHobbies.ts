'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Hobby} from "@/entities/hobby";

export async function getAllHobbies(): Promise<Hobby[]> {
    return prisma.hobby.findMany({})
}