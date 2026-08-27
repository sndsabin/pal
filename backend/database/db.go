package database

import (
	"context"
	"database/sql"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

const pingTimeoutDuration = 5 * time.Second

func Open(dsn string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", dsn)
	if err != nil {
		return nil, err
	}

	dbCtx, cancel := context.WithTimeout(context.Background(), pingTimeoutDuration)
	defer cancel()

	err = db.PingContext(dbCtx)
	if err != nil {
		db.Close()
		return nil, err
	}

	return db, nil
}
