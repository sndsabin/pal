package workspace

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type Workspace struct {
	RootDir string
	Dirs    WorkspaceDirs
}

type WorkspaceDirs struct {
	Db   string
	Logs string
}

const (
	dbDirName    string      = "db"
	LogsDirName  string      = "logs"
	DirPermMode  os.FileMode = 0755
	FilePermMode os.FileMode = 0644
)

func New(appName string) (*Workspace, error) {
	if appName == "" {
		return nil, errors.New("app name cannot be empty")
	}

	userConfigDir, err := os.UserConfigDir()
	if err != nil {
		return nil, err
	}

	// create necessary directories
	rootDir := filepath.Join(userConfigDir, appName)
	dbDir := filepath.Join(rootDir, dbDirName)
	logsDir := filepath.Join(rootDir, LogsDirName)

	for _, dir := range []string{rootDir, dbDir, logsDir} {
		err := os.MkdirAll(dir, DirPermMode)
		if err != nil {
			return nil, fmt.Errorf("error creating directory %q: %w", dir, err)
		}
	}

	return &Workspace{
		RootDir: rootDir,
		Dirs: WorkspaceDirs{
			Db:   dbDir,
			Logs: logsDir,
		},
	}, nil
}

func (w *Workspace) SyncEmbeddedDb(db []byte, appName string) error {
	if appName == "" {
		return errors.New("app name cannot be empty")
	}

	dbFile := filepath.Join(w.Dirs.Db, fmt.Sprintf("%s.sqlite", strings.ToLower(appName)))

	if fileExists(dbFile) {
		return nil
	}

	err := os.WriteFile(dbFile, db, FilePermMode)
	if err != nil {
		return err
	}

	return nil
}

func fileExists(path string) bool {
	_, err := os.Stat(path)

	return err == nil
}
