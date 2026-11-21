CREATE TABLE "current_weather" (
	"id"	INTEGER NOT NULL,
	"location_id"	INTEGER NOT NULL UNIQUE,
	"description"	TEXT,
	"temperature"	REAL NOT NULL,
	"feels_like"	REAL,
	"condition"	TEXT,
	"icon"	TEXT,
	"created_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "fk_current_weather_user_location" FOREIGN KEY("location_id") REFERENCES "user_locations"("id") ON DELETE CASCADE
);

CREATE TRIGGER current_weather_updated_at
AFTER UPDATE ON current_weather
FOR EACH ROW
BEGIN
    UPDATE current_weather
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
END;