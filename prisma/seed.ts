import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword } from '../src/lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = 'superadmin@gmail.com';
  const superAdminPassword = await hashPassword('Ourrapartment@admin');

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      role: UserRole.SUPER_ADMIN,
      password: superAdminPassword, // Ensure password is set/updated
    },
    create: {
      email: superAdminEmail,
      name: 'Super Admin',
      password: superAdminPassword,
      role: UserRole.SUPER_ADMIN,
    },
  });

  console.log({ superAdmin });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
