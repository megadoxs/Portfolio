'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {Contact, ContactRequestModel} from "@/entities/contact";

export async function updateContact(contact: ContactRequestModel): Promise<Contact> {
    return prisma.contact.update({
        data: contact,
        where: { id: 'CONTACT_SINGLETON' }
    })
}