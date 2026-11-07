CREATE TYPE "DeviceType" AS ENUM ('LIGHT', 'AIR_CONDITIONER', 'TV');
CREATE TABLE "Device" (
 "id" TEXT NOT NULL, "ownerId" TEXT NOT NULL, "name" TEXT NOT NULL,
 "type" "DeviceType" NOT NULL, "room" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Device_ownerId_idx" ON "Device"("ownerId");
ALTER TABLE "Device" ADD CONSTRAINT "Device_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
