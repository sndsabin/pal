ALTER TABLE "user_preferences"
ADD "temperature_format" TEXT NOT NULL DEFAULT 'c' CHECK("temperature_format" IN ('c', 'f'));