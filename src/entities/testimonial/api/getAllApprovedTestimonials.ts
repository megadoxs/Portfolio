'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Testimonial} from "@/entities/testimonial";
import {TestimonialStatus} from "@/entities/testimonial/model/testimonial";

export async function getAllApprovedTestimonials(): Promise<Testimonial[]> {
    return prisma.testimonial.findMany({
        where: {
            status: TestimonialStatus.APPROVED
        }
    })
}