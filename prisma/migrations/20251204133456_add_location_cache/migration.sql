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
CREATE INDEX "LocationCache_lat_lon_idx" ON "LocationCache"("lat", "lon");

-- CreateIndex
CREATE UNIQUE INDEX "LocationCache_lat_lon_key" ON "LocationCache"("lat", "lon");
