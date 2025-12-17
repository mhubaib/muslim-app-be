import prisma from '../../config/database.js';
import { httpGet } from '../../utils/http.js';

interface QuranApiSurah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Madinan';
  ayahs: QuranApiAyah[];
}

interface QuranApiAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page?: number;
}

interface QuranApiResponse<T> {
  code: number;
  status: string;
  data: T;
}

export class QuranService {
  private readonly QURAN_API_BASE = 'https://api.alquran.cloud/v1';

  async initializeQuranCache() {
    try {
      const surahCount = await prisma.surah.count();

      if (surahCount === 114) {
        console.log('Quran cache already initialized');
        return;
      }

      console.log('Initializing Quran cache...');

      for (let i = 1; i <= 114; i++) {
        const arabicResponse = await httpGet<QuranApiResponse<QuranApiSurah>>(
          `${this.QURAN_API_BASE}/surah/${i}/quran-simple`
        );

        const transliterationResponse = await httpGet<QuranApiResponse<QuranApiSurah>>(
          `${this.QURAN_API_BASE}/surah/${i}/en.transliteration`
        );

        const translationResponse = await httpGet<QuranApiResponse<QuranApiSurah>>(
          `${this.QURAN_API_BASE}/surah/${i}/id.indonesian`
        );

        const surahData = arabicResponse.data;

        await prisma.surah.upsert({
          where: { id: surahData.number },
          update: {},
          create: {
            id: surahData.number,
            name: surahData.name,
            englishName: surahData.englishName,
            numberOfAyahs: surahData.numberOfAyahs,
            revelationType: surahData.revelationType,
          },
        });

        if (surahData.ayahs) {
          for (let j = 0; j < surahData.ayahs.length; j++) {
            const arabicAyah = surahData.ayahs[j];
            const transliterationAyah = transliterationResponse.data.ayahs?.[j];
            const translationAyah = translationResponse.data.ayahs?.[j];

            await prisma.ayah.upsert({
              where: {
                id: arabicAyah.number,
              },
              update: {
                textArabic: arabicAyah.text,
                textLatin: transliterationAyah?.text || null,
                textTranslation: translationAyah?.text || null,
              },
              create: {
                numberInSurah: arabicAyah.numberInSurah,
                page: arabicAyah.page,
                juz: arabicAyah.juz,
                surahId: surahData.number,
                textArabic: arabicAyah.text,
                textLatin: transliterationAyah?.text || null,
                textTranslation: translationAyah?.text || null,
              },
            });
          }
        }

        console.log(`Cached Surah ${i}/114: ${surahData.englishName}`);

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log('Quran cache initialization completed!');
    } catch (error) {
      console.error('Error initializing Quran cache:', error);
      throw error;
    }
  }

  async getAllSurahs() {
    try {
      const surahs = await prisma.surah.findMany({
        orderBy: { id: 'asc' },
      });
      return surahs;
    } catch (error) {
      console.error('Error fetching surahs:', error);
      throw error;
    }
  }

  async getSurahById(id: number) {
    try {
      const surah = await prisma.surah.findUnique({
        where: { id },
        include: {
          ayahs: {
            orderBy: { numberInSurah: 'asc' },
          },
        },
      });

      if (!surah) {
        throw new Error('Surah not found');
      }

      return surah;
    } catch (error) {
      console.error('Error fetching surah:', error);
      throw error;
    }
  }

  async getAyah(surahId: number, numberInSurah: number) {
    try {
      const ayah = await prisma.ayah.findFirst({
        where: {
          surahId,
          numberInSurah,
        },
        include: {
          surah: true,
        },
      });

      if (!ayah) {
        throw new Error('Ayah not found');
      }

      return ayah;
    } catch (error) {
      console.error('Error fetching ayah:', error);
      throw error;
    }
  }
}
