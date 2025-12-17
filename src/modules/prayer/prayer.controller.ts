import { Request, Response } from 'express';
import { PrayerService } from './prayer.service.js';

const prayerService = new PrayerService();

export const getTodayPrayerTimes = async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude',
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90',
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Longitude must be between -180 and 180',
      });
    }

    const prayerTimes = await prayerService.getTodayPrayerTimes(latitude, longitude);

    res.status(201).json({
      success: true,
      data: prayerTimes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prayer times',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
