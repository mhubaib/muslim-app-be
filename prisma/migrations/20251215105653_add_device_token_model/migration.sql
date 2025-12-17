-- AlterTable
ALTER TABLE "NotificationSchedule" ADD COLUMN     "deviceTokenId" INTEGER,
ADD COLUMN     "sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sentAt" TIMESTAMP(3);

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
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceToken_token_key" ON "DeviceToken"("token");

-- CreateIndex
CREATE INDEX "DeviceToken_token_idx" ON "DeviceToken"("token");

-- CreateIndex
CREATE INDEX "NotificationSchedule_scheduleAt_sent_idx" ON "NotificationSchedule"("scheduleAt", "sent");

-- CreateIndex
CREATE INDEX "NotificationSchedule_deviceTokenId_idx" ON "NotificationSchedule"("deviceTokenId");

-- AddForeignKey
ALTER TABLE "NotificationSchedule" ADD CONSTRAINT "NotificationSchedule_deviceTokenId_fkey" FOREIGN KEY ("deviceTokenId") REFERENCES "DeviceToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;
