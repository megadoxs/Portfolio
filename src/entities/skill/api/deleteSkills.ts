'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {del} from "@vercel/blob";

export async function deleteSkill(id: string) {
    const skill = await prisma.skill.findUnique({
        where: { id }
    });

    if (!skill) {
        throw new Error("Skill not found");
    }

    if (skill.icon) {
        await del(skill.icon);
    }

    await prisma.skill.delete({
        where: { id }
    });
}