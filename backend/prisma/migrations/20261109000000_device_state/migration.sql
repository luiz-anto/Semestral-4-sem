ALTER TABLE "Device"
  ADD COLUMN "isOn" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "brightness" INTEGER,
  ADD COLUMN "temperature" INTEGER,
  ADD COLUMN "channel" INTEGER,
  ADD COLUMN "volume" INTEGER;

-- Dispositivos que ja existiam passam a ter o valor padrao do seu tipo.
UPDATE "Device" SET "brightness" = 100 WHERE "type" = 'LIGHT';
UPDATE "Device" SET "temperature" = 22 WHERE "type" = 'AIR_CONDITIONER';
UPDATE "Device" SET "channel" = 1, "volume" = 20 WHERE "type" = 'TV';
