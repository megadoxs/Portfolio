'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Contact} from "@/entities/contact";

export async function getContact(): Promise<Contact> {
    return prisma.contact.findUniqueOrThrow({
        where: { id: 'CONTACT_SINGLETON' }
    })
}