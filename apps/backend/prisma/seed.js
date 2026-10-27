import { PrismaClient } from '../src/generated/prisma/client.js';
import bcrypt from "bcryptjs";

const prisma_Connector = new PrismaClient();

async function main() {
  await prisma_Connector?.permissionMaster.createMany({
    data: [
      { name: 'Others', active: 'y', compCode: 'all', pType: 'permission' },
    ],
    skipDuplicates: true,
  });

  await prisma_Connector?.ondutyMaster.createMany({
    data: [
      { name: 'Others', active: 'y', compCode: 'all' },
    ],
    skipDuplicates: true,
  });

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash("admin", saltRounds);

  await prisma_Connector?.user.upsert({
    where: { userName: "Admin" },
    update: {
      password: hashedPassword,
      isAdmin: true,
      level: "admin",
    },
    create: {
      userName: "Admin",
      password: hashedPassword,
      isAdmin: true,
      level: "admin",
      idCard: "ADMIN001",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma_Connector.$disconnect();
  });