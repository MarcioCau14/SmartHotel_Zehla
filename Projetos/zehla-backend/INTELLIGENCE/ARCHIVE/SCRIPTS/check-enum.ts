import { Plan } from '@prisma/client';
console.log('--- ZEHLA ENUM DIAGNOSTIC ---');
console.log('Plan Enum:', JSON.stringify(Plan, null, 2));
console.log('Values:', Object.values(Plan));
console.log('---------------------------');
process.exit(0);
