package database

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"time"
)

//go:embed migrations/*.sql
var migrationFS embed.FS

const migrationDir = "migrations"
const QueryTimeoutDuration = 5 * time.Second

func Migrate(db *sql.DB) error {
	files, err := migrationFS.ReadDir(migrationDir)
	if err != nil {
		return fmt.Errorf("something went wrong when reading migration directory: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), QueryTimeoutDuration)
	defer cancel()

	query := `PRAGMA user_version`

	row := db.QueryRowContext(ctx, query)

	var currentVersion int

	err = row.Scan(
		&currentVersion,
	)
	if err != nil {
		return err
	}

	if currentVersion > len(files) {
		return fmt.Errorf("unsupported database version: %d", currentVersion)
	}

	for i := currentVersion; i < len(files); i++ {
		sql, err := migrationFS.ReadFile(migrationDir + "/" + files[i].Name())
		if err != nil {
			return err
		}

		tx, err := db.Begin()
		if err != nil {
			return err
		}

		_, err = tx.Exec(string(sql))
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("error executing sql query %s:%w", files[i].Name(), err)
		}

		_, err = tx.Exec(fmt.Sprintf("PRAGMA user_version = %d", i+1))
		if err != nil {
			tx.Rollback()
			return err
		}

		err = tx.Commit()
		if err != nil {
			return err
		}
	}

	return nil
}
