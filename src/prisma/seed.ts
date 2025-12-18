import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  adapter,
});

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Islamic Events
  const events = [
    {
      name: 'Tahun Baru Islam 1447 H',
      description: 'Peringatan Tahun Baru Hijriah 1447',
      dateHijri: '1 Muharram 1447',
      estimatedGregorian: new Date('2025-07-07'),
    },
    {
      name: 'Maulid Nabi Muhammad SAW',
      description: 'Peringatan kelahiran Nabi Muhammad SAW',
      dateHijri: '12 Rabiul Awal 1447',
      estimatedGregorian: new Date('2025-09-16'),
    },
    {
      name: 'Isra Mi\'raj',
      description: 'Peringatan perjalanan Isra Mi\'raj Nabi Muhammad SAW',
      dateHijri: '27 Rajab 1447',
      estimatedGregorian: new Date('2026-01-27'),
    },
    {
      name: 'Nuzulul Quran',
      description: 'Peringatan turunnya Al-Quran',
      dateHijri: '17 Ramadan 1447',
      estimatedGregorian: new Date('2026-03-18'),
    },
    {
      name: 'Idul Fitri 1447 H',
      description: 'Hari Raya Idul Fitri',
      dateHijri: '1 Syawal 1447',
      estimatedGregorian: new Date('2026-04-01'),
    },
    {
      name: 'Hari Arafah',
      description: 'Hari Arafah dalam ibadah haji',
      dateHijri: '9 Dzulhijjah 1447',
      estimatedGregorian: new Date('2026-06-07'),
    },
    {
      name: 'Idul Adha 1447 H',
      description: 'Hari Raya Idul Adha',
      dateHijri: '10 Dzulhijjah 1447',
      estimatedGregorian: new Date('2026-06-08'),
    },
  ];

  for (const event of events) {
    await prisma.islamicEvent.create({
      data: event,
    });
    console.log(`✅ Created event: ${event.name}`);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
