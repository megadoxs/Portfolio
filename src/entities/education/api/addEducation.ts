'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {EducationRequestModel} from "@/entities/education";

export async function addEducation(education: EducationRequestModel) {
    await prisma.education.create({
        data: education
    })
}