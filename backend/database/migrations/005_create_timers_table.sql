CREATE TABLE "timers" (
	"id" INTEGER NOT NULL,
	"name" TEXT,
	"duration" INTEGER NOT NULL,
	"status" TEXT NOT NULL DEFAULT 'running' CHECK("status" IN ('running', 'paused', 'completed')),
	"created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"paused_at" DATETIME,
	"updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TRIGGER timers_updated_at
AFTER UPDATE ON "timers"
FOR EACH ROW
BEGIN
	UPDATE timers
	SET updated_at = CURRENT_TIMESTAMP
	WHERE id = OLD.id;
END;