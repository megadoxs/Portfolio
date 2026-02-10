'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {WorkRequestModel} from "@/entities/work";

export async function addWork(work: WorkRequestModel) {
    await prisma.work.create({
        data: work
    })
}