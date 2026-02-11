'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {SkillRequestModel} from "@/entities/skill";
import {put} from "@vercel/blob";

export async function addSkill(skill: SkillRequestModel) {
    let iconUrl: string | null = null;

    if (skill.icon != null) {
        const blob = await put(`skills/${Date.now()}.${skill.icon.type.split('/')[1]}`, skill.icon, {
            access: "public",
        });
        iconUrl = blob.url;
    }

    await prisma.skill.create({
        data: {
            name: skill.name,
            category: skill.category,
            icon: iconUrl,
        }
    })
}