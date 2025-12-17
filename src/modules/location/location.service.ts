import prisma from '../../config/database.js';
import { httpGet } from '../../utils/http.js';
// import dotenv from 'dotenv';

// dotenv.config();

interface LocationIQResponse {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox: string[];
}

export interface LocationData {
  lat: number;
  lon: number;
  address: string;
  city: string | null;
  state: string | null;
  country: string | null;
  countryCode: string | null;
  postalCode: string | null;
  displayName: string;
}

export class LocationService {
  private readonly LOCATIONIQ_API_BASE = 'https://us1.locationiq.com/v1';
  private readonly LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY;

  constructor() {
    if (!this.LOCATIONIQ_API_KEY) {
      throw new Error('LOCATIONIQ_API_KEY is not defined in environment variables');
    }
  }

  async reverseGeocode(lat: number, lon: number): Promise<LocationData> {
    try {
      const roundedLat = Math.round(lat * 1000000) / 1000000;
      const roundedLon = Math.round(lon * 1000000) / 1000000;

      const cached = await prisma.locationCache.findUnique({
        where: {
          lat_lon: {
            lat: roundedLat,
            lon: roundedLon,
          },
        },
      });

      if (cached) {
        console.log('Returning cached location data');
        return {
          lat: cached.lat,
          lon: cached.lon,
          address: cached.address,
          city: cached.city,
          state: cached.state,
          country: cached.country,
          countryCode: cached.countryCode,
          postalCode: cached.postalCode,
          displayName: cached.displayName,
        };
      }

      console.log('Fetching location data from LocationIQ API...');
      const url = `${this.LOCATIONIQ_API_BASE}/reverse?key=${this.LOCATIONIQ_API_KEY}&lat=${roundedLat}&lon=${roundedLon}&format=json`;

      const response = await httpGet<LocationIQResponse>(url);

      const address = this.buildAddress(response.address);
      const city =
        response.address.city || response.address.county || response.address.suburb || null;
      const state = response.address.state || null;
      const country = response.address.country || null;
      const countryCode = response.address.country_code?.toUpperCase() || null;
      const postalCode = response.address.postcode || null;
      const displayName = response.display_name;

      const savedCache = await prisma.locationCache.create({
        data: {
          lat: roundedLat,
          lon: roundedLon,
          address,
          city,
          state,
          country,
          countryCode,
          postalCode,
          displayName,
        },
      });

      console.log('Location data cached successfully');

      return {
        lat: savedCache.lat,
        lon: savedCache.lon,
        address: savedCache.address,
        city: savedCache.city,
        state: savedCache.state,
        country: savedCache.country,
        countryCode: savedCache.countryCode,
        postalCode: savedCache.postalCode,
        displayName: savedCache.displayName,
      };
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      throw error;
    }
  }

  private buildAddress(addressComponents: LocationIQResponse['address']): string {
    const parts: string[] = [];

    if (addressComponents.road) {
      parts.push(addressComponents.road);
    }
    if (addressComponents.suburb) {
      parts.push(addressComponents.suburb);
    }
    if (addressComponents.city) {
      parts.push(addressComponents.city);
    }
    if (addressComponents.state) {
      parts.push(addressComponents.state);
    }

    return parts.join(', ') || 'Unknown Address';
  }

  async cleanOldCache(daysToKeep: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const deleted = await prisma.locationCache.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      console.log(`Deleted ${deleted.count} old location cache entries`);
      return deleted.count;
    } catch (error) {
      console.error('Error cleaning old location cache:', error);
      throw error;
    }
  }
}
