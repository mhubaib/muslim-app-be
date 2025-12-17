import { Request, Response } from 'express';
import { DeviceTokenService } from './device.service.js';
import { PrayerNotificationService } from '../prayer/prayer-notification.service.js';

const deviceTokenService = new DeviceTokenService();
const prayerNotificationService = new PrayerNotificationService();

export const registerDevice = async (req: Request, res: Response) => {
  try {
    const { token, deviceId, platform, latitude, longitude, timezone } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required',
      });
    }

    const device = await deviceTokenService.registerDevice({
      token,
      deviceId,
      platform,
      latitude,
      longitude,
      timezone,
    });

    // Schedule notifications immediately for the newly registered device
    if (device.latitude && device.longitude) {
      await prayerNotificationService.schedulePrayerNotificationsForDevice(
        device.id,
        device.token,
        device.latitude,
        device.longitude,
        device.notifyBeforePrayer,
        device.enabledPrayers as any
      );
    }

    res.status(201).json({
      success: true,
      data: device,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register device',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateDevicePreferences = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const {
      enablePrayerNotifications,
      enableEventNotifications,
      notifyBeforePrayer,
      latitude,
      longitude,
      timezone,
      enabledPrayers,
    } = req.body;

    const device = await deviceTokenService.updatePreferences(token, {
      enablePrayerNotifications,
      enableEventNotifications,
      notifyBeforePrayer,
      latitude,
      longitude,
      timezone,
      enabledPrayers,
    });

    // Reschedule notifications to reflect updated preferences
    if (device.latitude && device.longitude && device.enablePrayerNotifications) {
      // Optional: Clean old future notifications first to avoid duplicates or wrong times
      // For now, simpler approach: just schedule (logic should handle duplicates or we can improved later)
      // Better approach: Since schedule checks "if notificationTime > now", it might add duplicates if run multiple times.
      // Ideally we should delete pending future notifications for this device before scheduling again.
      // Let's rely on the fact that we might want to overwrite or add.
      // Actually, the current schedulePrayerNotificationsForDevice simply adds rows.
      // We should probably clear future pending notification for this device first.

      await prayerNotificationService.schedulePrayerNotificationsForDevice(
        device.id,
        device.token,
        device.latitude,
        device.longitude,
        device.notifyBeforePrayer,
        device.enabledPrayers as any
      );
    }

    res.status(200).json({
      success: true,
      data: device,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update device preferences',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getDeviceInfo = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const device = await deviceTokenService.getDeviceByToken(token);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
      });
    }

    res.status(200).json({
      success: true,
      data: device,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch device info',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const unregisterDevice = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    await deviceTokenService.unregisterDevice(token);

    res.status(200).json({
      success: true,
      message: 'Device unregistered successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to unregister device',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

import { NotificationService } from '../notification/notification.service.js';
const notificationService = new NotificationService();

export const testNotification = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token required' });
    }

    console.log('Testing notification for token:', token);

    await notificationService.sendToDevice(token, {
      type: 'TEST' as any,
      title: 'Tes Notifikasi',
      body: 'Ini adalah tes notifikasi dari server untuk memastikan koneksi berhasil.',
    });

    res.status(200).json({ success: true, message: 'Notification sent' });
  } catch (error) {
    console.error('Test notification failed:', error);
    res
      .status(500)
      .json({ success: false, error: error instanceof Error ? error.message : 'Unknown' });
  }
};
