import dotenv from 'dotenv';
import cron from 'node-cron';
import app from './app.js';
import prisma from './config/database.js';
import { QuranService } from './modules/quran/quran.service.js';
import { PrayerService } from './modules/prayer/prayer.service.js';
import { NotificationService } from './modules/notification/notification.service.js';
import { PrayerNotificationService } from './modules/prayer/prayer-notification.service.js';
import { DeviceTokenService } from './modules/device/device.service.js';
// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

const quranService = new QuranService();
const prayerService = new PrayerService();
const notificationService = new NotificationService();
const prayerNotificationService = new PrayerNotificationService();
const deviceTokenService = new DeviceTokenService();

async function initializeServer() {
  try {
    console.log('🚀 Starting Muslim App Backend...');

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Initialize Quran cache
    console.log('📖 Initializing Quran cache...');
    await quranService.initializeQuranCache();
    console.log('✅ Quran cache ready');

    // Setup cron jobs
    setupCronJobs();

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log('📡 Ready to accept requests');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

function setupCronJobs() {
  // Clean old prayer cache every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('🧹 Running daily cache cleanup...');
    try {
      await prayerService.cleanOldCache();
      console.log('✅ Cache cleanup completed');
    } catch (error) {
      console.error('❌ Cache cleanup failed:', error);
    }
  });

  // Schedule daily prayer notifications at 1 AM
  cron.schedule('0 1 * * *', async () => {
    console.log('📅 Scheduling daily prayer notifications...');
    try {
      const scheduled = await prayerNotificationService.scheduleDailyPrayerNotifications();
      console.log(`✅ Scheduled ${scheduled} prayer notifications`);
    } catch (error) {
      console.error('❌ Failed to schedule prayer notifications:', error);
    }
  });

  // Process pending prayer notifications every minute
  cron.schedule('* * * * *', async () => {
    try {
      const sent = await prayerNotificationService.processPendingPrayerNotifications();
      if (sent > 0) {
        console.log(`📬 Sent ${sent} prayer notifications`);
      }
    } catch (error) {
      console.error('❌ Failed to process prayer notifications:', error);
    }
  });

  // Process other pending notifications every minute
  cron.schedule('* * * * *', async () => {
    try {
      const processed = await notificationService.processPendingNotifications();
      if (processed > 0) {
        console.log(`📬 Processed ${processed} pending notifications`);
      }
    } catch (error) {
      console.error('❌ Failed to process notifications:', error);
    }
  });

  // Clean inactive devices every week (Sunday at 2 AM)
  cron.schedule('0 2 * * 0', async () => {
    console.log('🧹 Cleaning inactive devices...');
    try {
      const cleaned = await deviceTokenService.cleanInactiveDevices();
      console.log(`✅ Cleaned ${cleaned} inactive devices`);
    } catch (error) {
      console.error('❌ Failed to clean inactive devices:', error);
    }
  });

  // Clean old notifications every day at 3 AM
  cron.schedule('0 3 * * *', async () => {
    console.log('🧹 Cleaning old notifications...');
    try {
      const cleaned = await prayerNotificationService.cleanOldNotifications();
      console.log(`✅ Cleaned ${cleaned} old notifications`);
    } catch (error) {
      console.error('❌ Failed to clean old notifications:', error);
    }
  });

  console.log('⏰ Cron jobs scheduled');
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
  process.exit(0);
});

initializeServer();
