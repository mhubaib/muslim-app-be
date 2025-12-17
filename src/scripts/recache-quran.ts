import { QuranService } from '../modules/quran/quran.service.js';
import prisma from '../config/database.js';

async function recacheQuran() {
  try {
    console.log('Starting Quran re-cache process...');

    // Delete all existing ayahs and surahs
    console.log('Deleting existing data...');
    await prisma.ayah.deleteMany({});
    await prisma.surah.deleteMany({});
    console.log('Existing data deleted.');

    // Re-initialize cache with new data
    const quranService = new QuranService();
    await quranService.initializeQuranCache();

    console.log('Quran re-cache completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during re-cache:', error);
    process.exit(1);
  }
}

recacheQuran();
