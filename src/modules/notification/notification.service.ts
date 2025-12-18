import admin from '../../config/firebase.js';
import prisma from '../../config/database.js';
import { NotificationType } from '../../generated/prisma/client.js';

interface SendNotificationDto {
  type: NotificationType;
  title: string;
  body: string;
  meta?: Record<string, any>;
}

interface ScheduleNotificationDto extends SendNotificationDto {
  scheduleAt: Date;
}

export class NotificationService {
  private formatData(data: Record<string, any>): Record<string, string> {
    if (!data) return {};
    const formatted: Record<string, string> = {};
    for (const key in data) {
      formatted[key] = String(data[key]);
    }
    return formatted;
  }

  async sendToTopic(data: SendNotificationDto) {
    try {
      const message = {
        notification: {
          title: data.title,
          body: data.body,
        },
        data: this.formatData(data.meta || {}),
        topic: data.type,
      };

      const response = await admin.messaging().send(message);
      console.log('Successfully sent message to topic:', data.type, response);

      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  async sendToDevice(token: string, data: SendNotificationDto) {
    try {
      const message = {
        notification: {
          title: data.title,
          body: data.body,
        },
        data: this.formatData(data.meta || {}),
        token: token,
      };

      const response = await admin.messaging().send(message);
      console.log('Successfully sent message to device:', token, response);

      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      console.error('Error sending notification to device:', error);
      throw error;
    }
  }

  async sendToMultipleDevices(tokens: string[], data: SendNotificationDto) {
    try {
      const message = {
        notification: {
          title: data.title,
          body: data.body,
        },
        data: this.formatData(data.meta || {}),
        tokens: tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`Successfully sent ${response.successCount} messages`);

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error('Error sending notifications to devices:', error);
      throw error;
    }
  }

  async scheduleNotification(data: ScheduleNotificationDto) {
    try {
      const notification = await prisma.notificationSchedule.create({
        data: {
          type: data.type,
          title: data.title,
          body: data.body,
          scheduleAt: data.scheduleAt,
          meta: data.meta || {},
        },
      });

      console.log('Notification scheduled:', notification.id);
      return notification;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  async getScheduledNotifications() {
    try {
      const notifications = await prisma.notificationSchedule.findMany({
        where: {
          scheduleAt: {
            gte: new Date(),
          },
        },
        orderBy: { scheduleAt: 'asc' },
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching scheduled notifications:', error);
      throw error;
    }
  }

  async processPendingNotifications() {
    try {
      const now = new Date();
      const pendingNotifications = await prisma.notificationSchedule.findMany({
        where: {
          scheduleAt: {
            lte: now,
          },
        },
      });

      console.log(`Processing ${pendingNotifications.length} pending notifications`);

      for (const notification of pendingNotifications) {
        try {
          await this.sendToTopic({
            type: notification.type,
            title: notification.title,
            body: notification.body,
            meta: notification.meta as Record<string, any>,
          });

          // Delete after sending
          await prisma.notificationSchedule.delete({
            where: { id: notification.id },
          });

          console.log(`Sent and deleted notification ${notification.id}`);
        } catch (error) {
          console.error(`Failed to send notification ${notification.id}:`, error);
        }
      }

      return pendingNotifications.length;
    } catch (error) {
      console.error('Error processing pending notifications:', error);
      throw error;
    }
  }

  async deleteScheduledNotification(id: number) {
    try {
      await prisma.notificationSchedule.delete({
        where: { id },
      });

      console.log('Scheduled notification deleted:', id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting scheduled notification:', error);
      throw error;
    }
  }
}
