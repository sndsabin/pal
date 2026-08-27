package logging

import (
	"errors"
	"fmt"
	"io"
	"log/slog"
	"os"
	"path/filepath"
)

type Logger struct {
	Logger *slog.Logger
	file   *os.File
}

const (
	file         = "app.log"
	filePermMode = 0644
)

func New(logDir string) (*Logger, error) {
	if logDir == "" {
		return nil, errors.New("log dir cannot be empty")
	}

	path := filepath.Join(logDir, file)

	file, err := os.OpenFile(
		path,
		os.O_CREATE|os.O_WRONLY|os.O_APPEND,
		filePermMode,
	)
	if err != nil {
		return nil, fmt.Errorf("error creating log file: %w", err)
	}

	logger := slog.New(slog.NewTextHandler(
		io.MultiWriter(os.Stdout, file),
		&slog.HandlerOptions{
			Level: slog.LevelInfo,
		}),
	)

	return &Logger{
		Logger: logger,
		file:   file,
	}, nil
}

func (l *Logger) Info(msg string, args ...any) {
	l.Logger.Info(msg, args...)
}

func (l *Logger) Error(msg string, args ...any) {
	l.Logger.Error(msg, args...)
}

func (l *Logger) Debug(msg string, args ...any) {
	l.Logger.Debug(msg, args...)
}

func (l *Logger) Close() {
	if l.file != nil {
		l.file.Close()
	}
}
