import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // 1. Settings
  await prisma.systemSettings.create({
    data: { defaultDueDays: 7, orangeWarningDays: 7 }
  });

  // 2. Status Types
  const statusOpen = await prisma.statusType.create({ data: { name: 'פתוח', color: '#007BFF', isDefault: true } });
  const statusInProgress = await prisma.statusType.create({ data: { name: 'בתהליך', color: '#FD7E14' } });
  const statusAwaiting = await prisma.statusType.create({ data: { name: 'ממתין ללקוח', color: '#6F42C1' } });
  const statusDone = await prisma.statusType.create({ data: { name: 'הושלם', color: '#28A745' } });
  
  // 3. Report Types
  const reportA = await prisma.reportType.create({ data: { name: 'דו"ח אישי' } });
  const reportB = await prisma.reportType.create({ data: { name: 'הצהרת הון' } });
  
  // 4. Users
  const password = await bcrypt.hash('12345678', 10);
  
  const admin = await prisma.user.create({
    data: { email: 'admin@cpa.com', firstName: 'ישראל', lastName: 'ישראלי', password, role: 'admin' }
  });
  
  const manager = await prisma.user.create({
    data: { email: 'manager@cpa.com', firstName: 'משה', lastName: 'מנהל', password, role: 'manager' }
  });

  const employee = await prisma.user.create({
    data: { email: 'worker@cpa.com', firstName: 'דוד', lastName: 'עובד', password, role: 'employee' }
  });

  // 5. Sample Task
  await prisma.task.create({
    data: {
      assigneeId: employee.id,
      reportTypeId: reportA.id,
      statusId: statusInProgress.id,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
      comments: { create: { authorId: manager.id, content: 'משימה ראשונית לבדיקה' } }
    }
  });

  console.log('Seeding complete! Users:');
  console.log('Admin:', admin.email);
  console.log('Manager:', manager.email);
  console.log('Employee:', employee.email);
  console.log('Password for all:', '12345678');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
