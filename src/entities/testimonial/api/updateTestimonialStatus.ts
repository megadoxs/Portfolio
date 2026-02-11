'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Testimonial} from "@prisma/client";
import {TestimonialStatus} from "@/entities/testimonial/model/testimonial";

export async function updateTestimonialStatus(testimonialId: string, status: TestimonialStatus): Promise<Testimonial> {
    return prisma.testimonial.update({
        where: {id: testimonialId},
        data: {
            status: status,
        }
    });
}