'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Skill} from "@/entities/skill";

export async function getAllSkills(): Promise<Skill[]> {
    return prisma.skill.findMany({})
}