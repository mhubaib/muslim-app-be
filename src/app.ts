import express from 'express';
import { apiKeyMiddleware } from './middlewares/apiKey.middleware.js';

import { getAllSurahs, getSurahById, getAyah } from './modules/quran/quran.controller.js';

import { getTodayPrayerTimes } from './modules/prayer/prayer.controller.js';

import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
} from './modules/event/event.controller.js';

import {
  sendNotification,
  scheduleNotification,
  getScheduledNotifications,
  deleteScheduledNotification,
} from './modules/notification/notification.controller.js';

import {
  registerDevice,
  updateDevicePreferences,
  getDeviceInfo,
  unregisterDevice,
  testNotification,
} from './modules/device/device.controller.js';

import { reverseGeocode } from './modules/location/location.controller.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Muslim App API is running',
    version: '1.0.0',
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.use(apiKeyMiddleware);

app.get('/quran/surah', getAllSurahs);
app.get('/quran/surah/:id', getSurahById);
app.get('/quran/ayah/:surahId/:ayahNumber', getAyah);

app.get('/prayer/today', getTodayPrayerTimes);
app.get('/location/reverse', reverseGeocode);

app.get('/events', getAllEvents);
app.get('/events/upcoming', getUpcomingEvents);
app.get('/events/:id', getEventById);
app.post('/events', createEvent);
app.put('/events/:id', updateEvent);
app.delete('/events/:id', deleteEvent);

app.post('/notification/send', sendNotification);
app.post('/notification/schedule', scheduleNotification);
app.get('/notification/scheduled', getScheduledNotifications);
app.delete('/notification/scheduled/:id', deleteScheduledNotification);

app.post('/device/register', registerDevice);
app.put('/device/:token/preferences', updateDevicePreferences);
app.get('/device/:token', getDeviceInfo);
app.delete('/device/:token', unregisterDevice);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

export default app;
