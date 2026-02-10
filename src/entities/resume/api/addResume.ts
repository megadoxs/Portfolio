'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {ResumeRequestModel} from "@/entities/resume";
import {put} from "@vercel/blob";

export async function addResume(resume: ResumeRequestModel) {
    const blob = await put(`resumes/${resume.locale}-${Date.now()}.pdf`, resume.file, {
        access: "public",
    });

    if (resume.active) {
        await prisma.resume.updateMany({
            data: {
                active: false
            },
            where: {
                locale: resume.locale,
                active: true
            }
        })
    }

    await prisma.resume.create({
        data: {
            name: resume.name,
            locale: resume.locale,
            url: blob.url,
            active: resume.active
        }
    });
}