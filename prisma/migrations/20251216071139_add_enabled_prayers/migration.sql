-- AlterTable
ALTER TABLE "DeviceToken" ADD COLUMN     "enabledPrayers" JSONB DEFAULT '{"fajr":true,"dhuhr":true,"asr":true,"maghrib":true,"isha":true}';
