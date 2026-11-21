CREATE TABLE "hourly_weather" (
	"id"	INTEGER NOT NULL,
	"location_id"	INTEGER NOT NULL,
	"description"	TEXT,
	"temperature"	REAL NOT NULL,
	"feels_like"	REAL,
	"condition"	TEXT,
	"icon"	TEXT,
	"forecast_at" DATETIME NOT NULL,
	"created_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	UNIQUE("location_id","forecast_at"),
	CONSTRAINT "fk_hourly_weather_user_location" FOREIGN KEY("location_id") REFERENCES "user_locations"("id") ON DELETE CASCADE
);

CREATE TRIGGER hourly_weather_updated_at
AFTER UPDATE ON hourly_weather
FOR EACH ROW
BEGIN
    UPDATE hourly_weather
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
END;