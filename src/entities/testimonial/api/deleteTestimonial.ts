'use server'

import {prisma} from "@/shared/lib/prisma/db";

export async function deleteTestimonial(testimonialId: string): Promise<void> {
    await prisma.testimonial.delete({
        where: {id: testimonialId}
    });
}