-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('AZAN', 'EVENT_ISLAMIC', 'CUSTOM');

-- CreateTable
CREATE TABLE "PrayerCache" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fajr" TEXT NOT NULL,
    "dhuhr" TEXT NOT NULL,
    "asr" TEXT NOT NULL,
    "maghrib" TEXT NOT NULL,
    "isha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrayerCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "deviceId" TEXT,
    "platform" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" TEXT,
    "enablePrayerNotifications" BOOLEAN NOT NULL DEFAULT true,
    "enableEventNotifications" BOOLEAN NOT NULL DEFAULT true,
    "notifyBeforePrayer" INTEGER NOT NULL DEFAULT 5,
    "enabledPrayers" JSONB DEFAULT '{"fajr":true,"dhuhr":true,"asr":true,"maghrib":true,"isha":true}',
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSchedule" (
    "id" SERIAL NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "scheduleAt" TIMESTAMP(3) NOT NULL,
    "meta" JSONB,
    "deviceTokenId" INTEGER,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IslamicEvent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dateHijri" TEXT NOT NULL,
    "estimatedGregorian" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IslamicEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Surah" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "englishName" TEXT,
    "numberOfAyahs" INTEGER NOT NULL,
    "revelationType" TEXT,

    CONSTRAINT "Surah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ayah" (
    "id" SERIAL NOT NULL,
    "numberInSurah" INTEGER NOT NULL,
    "surahId" INTEGER NOT NULL,
    "page" INTEGER,
    "juz" INTEGER,
    "textArabic" TEXT NOT NULL,
    "textLatin" TEXT,
    "textTranslation" TEXT,

    CONSTRAINT "Ayah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationCache" (
    "id" SERIAL NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "postalCode" TEXT,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrayerCache_date_key" ON "PrayerCache"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceToken_token_key" ON "DeviceToken"("token");

-- CreateIndex
CREATE INDEX "DeviceToken_token_idx" ON "DeviceToken"("token");

-- CreateIndex
CREATE INDEX "NotificationSchedule_scheduleAt_sent_idx" ON "NotificationSchedule"("scheduleAt", "sent");

-- CreateIndex
CREATE INDEX "NotificationSchedule_deviceTokenId_idx" ON "NotificationSchedule"("deviceTokenId");

-- CreateIndex
CREATE INDEX "Ayah_surahId_idx" ON "Ayah"("surahId");

-- CreateIndex
CREATE INDEX "LocationCache_lat_lon_idx" ON "LocationCache"("lat", "lon");

-- CreateIndex
CREATE UNIQUE INDEX "LocationCache_lat_lon_key" ON "LocationCache"("lat", "lon");

-- AddForeignKey
ALTER TABLE "NotificationSchedule" ADD CONSTRAINT "NotificationSchedule_deviceTokenId_fkey" FOREIGN KEY ("deviceTokenId") REFERENCES "DeviceToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ayah" ADD CONSTRAINT "Ayah_surahId_fkey" FOREIGN KEY ("surahId") REFERENCES "Surah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
