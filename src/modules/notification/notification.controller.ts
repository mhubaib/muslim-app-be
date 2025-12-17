import { Request, Response } from 'express';
import { NotificationService } from './notification.service.js';
import { NotificationType } from '../../generated/prisma/client.js';

const notificationService = new NotificationService();

export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { type, title, body, meta } = req.body;

    if (!type || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, and body are required',
      });
    }

    if (!Object.values(NotificationType).includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid notification type. Must be one of: ${Object.values(NotificationType).join(', ')}`,
      });
    }

    const result = await notificationService.sendToTopic({
      type,
      title,
      body,
      meta,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const scheduleNotification = async (req: Request, res: Response) => {
  try {
    const { type, title, body, scheduleAt, meta } = req.body;

    if (!type || !title || !body || !scheduleAt) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, body, and scheduleAt are required',
      });
    }

    if (!Object.values(NotificationType).includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid notification type. Must be one of: ${Object.values(NotificationType).join(', ')}`,
      });
    }

    const scheduleDate = new Date(scheduleAt);
    if (isNaN(scheduleDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scheduleAt date',
      });
    }

    if (scheduleDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'scheduleAt must be in the future',
      });
    }

    const notification = await notificationService.scheduleNotification({
      type,
      title,
      body,
      scheduleAt: scheduleDate,
      meta,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to schedule notification',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getScheduledNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await notificationService.getScheduledNotifications();
    res.status(201).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduled notifications',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteScheduledNotification = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID',
      });
    }

    await notificationService.deleteScheduledNotification(id);
    res.status(201).json({
      success: true,
      message: 'Scheduled notification deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete scheduled notification',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
