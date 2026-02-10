import {prisma} from "@/shared/lib/prisma/db";

async function main() {
    await prisma.contact.create({
        data: {
            email: 'megadoxs@gmail.com',
            github: 'https://github.com/megadoxs',
            linkedin: 'https://www.linkedin.com/in/louis-h-caron'
        }
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })