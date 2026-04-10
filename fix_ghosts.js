import { PrismaClient } from './src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function main() {
  const records = await prisma.onduty.findMany({
    orderBy: { id: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(records, null, 2));

  // Find any record from today that is an IN but orphaned
  // We'll just delete the immediate troublemaker
  const troubled = records.find(r => r.inout === 'IN');
  if (troubled) {
     console.log('Deleting troubled record:', troubled.docid);
     await prisma.onduty.delete({ where: { id: troubled.id } });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
