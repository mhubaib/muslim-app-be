import { Request, Response } from 'express';
import { LocationService } from './location.service.js';

const locationService = new LocationService();

export const reverseGeocode = async (req: Request, res: Response) => {
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

    const locationData = await locationService.reverseGeocode(latitude, longitude);

    res.status(200).json({
      success: true,
      data: locationData,
    });
  } catch (error) {
    console.error('Error in reverse geocoding:', error);

    // Handle specific LocationIQ API errors
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return res.status(500).json({
          success: false,
          message: 'Invalid LocationIQ API key',
          error: 'API authentication failed',
        });
      }

      if (error.message.includes('429') || error.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          message: 'Rate limit exceeded',
          error: 'Too many requests to LocationIQ API',
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch location data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
