import prisma from '../../config/database.js';
import { httpGet } from '../../utils/http.js';

interface PrayerTimesApiResponse {
  data: {
    timings: {
      Fajr: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
    };
    date: {
      gregorian: {
        date: string;
      };
    };
  };
}

export class PrayerService {
  private readonly PRAYER_API_BASE = 'https://api.aladhan.com/v1';

  async getTodayPrayerTimes(latitude: number, longitude: number) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check cache first
      const cached = await prisma.prayerCache.findUnique({
        where: { date: today },
      });

      if (cached) {
        console.log('Returning cached prayer times');
        return {
          date: cached.date.toISOString().split('T')[0],
          fajr: cached.fajr,
          dhuhr: cached.dhuhr,
          asr: cached.asr,
          maghrib: cached.maghrib,
          isha: cached.isha,
        };
      }

      // Fetch from external API
      console.log('Fetching prayer times from API...');
      const timestamp = Math.floor(Date.now() / 1000);
      const response = await httpGet<PrayerTimesApiResponse>(
        `${this.PRAYER_API_BASE}/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=2`
      );

      const timings = response.data.timings;

      // Save to cache
      const savedCache = await prisma.prayerCache.create({
        data: {
          date: today,
          fajr: timings.Fajr,
          dhuhr: timings.Dhuhr,
          asr: timings.Asr,
          maghrib: timings.Maghrib,
          isha: timings.Isha,
        },
      });

      console.log('Prayer times cached successfully');

      return {
        date: savedCache.date.toISOString().split('T')[0],
        fajr: savedCache.fajr,
        dhuhr: savedCache.dhuhr,
        asr: savedCache.asr,
        maghrib: savedCache.maghrib,
        isha: savedCache.isha,
      };
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      throw error;
    }
  }

  async cleanOldCache() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const deleted = await prisma.prayerCache.deleteMany({
        where: {
          date: {
            lt: yesterday,
          },
        },
      });

      console.log(`Deleted ${deleted.count} old prayer cache entries`);
      return deleted.count;
    } catch (error) {
      console.error('Error cleaning old cache:', error);
      throw error;
    }
  }
}
