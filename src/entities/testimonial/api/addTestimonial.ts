'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {TestimonialRequestModel} from "@/entities/testimonial";

export async function addTestimonial(testimonial: TestimonialRequestModel) {
    await prisma.testimonial.create({
        data: testimonial
    })
}