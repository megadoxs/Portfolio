'use server'

import {SkillRequestModel} from "@/entities/skill";
import {prisma} from "@/shared/lib/prisma/db";
import {del, put} from "@vercel/blob";

export async function updateSkill(id: string, skill: SkillRequestModel) {
    const existingSkill = await prisma.skill.findUnique({
        where: { id }
    });

    if (!existingSkill) {
        throw new Error("Skill not found");
    }

    let iconUrl: string | null = existingSkill.icon;

    // If a new icon is provided, upload it and delete the old one
    if (skill.icon != null) {
        const blob = await put(`skills/${Date.now()}.${skill.icon.type.split('/')[1]}`, skill.icon, {
            access: "public",
        });
        iconUrl = blob.url;

        // Delete the old icon if it exists
        if (existingSkill.icon) {
            await del(existingSkill.icon);
        }
    }

    await prisma.skill.update({
        where: { id },
        data: {
            name: skill.name,
            category: skill.category,
            icon: iconUrl,
        }
    });
}