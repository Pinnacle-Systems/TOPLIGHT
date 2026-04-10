import { PrismaClient } from '../src/generated/prisma/client.js';
import bcrypt from "bcrypt"


const prisma_Connector=new PrismaClient()
async function main() {
  await  prisma_Connector?.permissionMaster.createMany({
    data: [
      { name: 'Others', active: 'y',COMPCODE:"all"},
    ],
    skipDuplicates: true, // optional: avoid inserting duplicates
  });


   await  prisma_Connector?.ondutyMaster.createMany({
    data: [
      { name: 'Others', active: 'y',COMPCODE:"all"},
    ],
    skipDuplicates: true, // optional: avoid inserting duplicates
  });

  const saltRounds = 10;
 const hashedPassword = await bcrypt.hash("admin", saltRounds);

   await  prisma_Connector?.user.create({data:{username:"Admin",password:hashedPassword,isAdmin:true}})
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma_Connector.$disconnect();
  });
