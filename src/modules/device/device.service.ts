import prisma from '../../config/database.js';

interface RegisterDeviceDto {
  token: string;
  deviceId?: string;
  platform?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

interface UpdateDevicePreferencesDto {
  enablePrayerNotifications?: boolean;
  enableEventNotifications?: boolean;
  notifyBeforePrayer?: number;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  enabledPrayers?: {
    fajr?: boolean;
    dhuhr?: boolean;
    asr?: boolean;
    maghrib?: boolean;
    isha?: boolean;
  };
}

export class DeviceTokenService {
  /**
   * Register or update a device token
   */
  async registerDevice(data: RegisterDeviceDto) {
    try {
      const device = await prisma.deviceToken.upsert({
        where: { token: data.token },
        update: {
          deviceId: data.deviceId,
          platform: data.platform,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          lastActiveAt: new Date(),
        },
        create: {
          token: data.token,
          deviceId: data.deviceId,
          platform: data.platform,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
        },
      });

      console.log('Device registered/updated:', device.id);
      return device;
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  /**
   * Update device notification preferences
   */
  async updatePreferences(token: string, preferences: UpdateDevicePreferencesDto) {
    try {
      const device = await prisma.deviceToken.update({
        where: { token },
        data: {
          ...preferences,
          lastActiveAt: new Date(),
        },
      });

      console.log('Device preferences updated:', device.id);
      return device;
    } catch (error) {
      console.error('Error updating device preferences:', error);
      throw error;
    }
  }

  /**
   * Get device by token
   */
  async getDeviceByToken(token: string) {
    try {
      return await prisma.deviceToken.findUnique({
        where: { token },
      });
    } catch (error) {
      console.error('Error fetching device:', error);
      throw error;
    }
  }

  /**
   * Delete device token (unregister)
   */
  async unregisterDevice(token: string) {
    try {
      await prisma.deviceToken.delete({
        where: { token },
      });

      console.log('Device unregistered:', token);
      return { success: true };
    } catch (error) {
      console.error('Error unregistering device:', error);
      throw error;
    }
  }

  /**
   * Get all devices with prayer notifications enabled
   */
  async getDevicesWithPrayerNotifications() {
    try {
      return await prisma.deviceToken.findMany({
        where: {
          enablePrayerNotifications: true,
          latitude: { not: null },
          longitude: { not: null },
        },
      });
    } catch (error) {
      console.error('Error fetching devices with prayer notifications:', error);
      throw error;
    }
  }

  /**
   * Clean inactive devices (not active for 30 days)
   */
  async cleanInactiveDevices() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.deviceToken.deleteMany({
        where: {
          lastActiveAt: {
            lt: thirtyDaysAgo,
          },
        },
      });

      console.log(`Cleaned ${result.count} inactive devices`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning inactive devices:', error);
      throw error;
    }
  }
}
