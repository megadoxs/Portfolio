'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Testimonial} from "@/entities/testimonial";

export async function getAllTestimonials(): Promise<Testimonial[]> {
    return prisma.testimonial.findMany({})
}