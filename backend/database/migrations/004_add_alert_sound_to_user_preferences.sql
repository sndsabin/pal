ALTER TABLE "user_preferences"
ADD "alert_sound" INTEGER NOT NULL DEFAULT 1 CHECK("alert_sound" IN (1, 0));