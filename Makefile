.PHONY: setup setup_git_config fmt fmt_check dev build-windows build-linux build-mac clean help

# setup app
setup:
	@make setup_git_config
	@echo "[INFO] Installing frontend dependencies..."
	cd frontend && npm install
	@echo "[OK] Setup complete"

# configure git config
setup_git_config:
	@echo "[INFO] Configuring git..."
	chmod +x .githooks/*
	git config core.hooksPath .githooks
	@echo "[OK] Git hooks enabled."
	
	git config commit.template .gitmessage
	@echo "[OK] Git commit template set."

# format all code
fmt:
	@echo "[INFO] Formatting Go..."
	gofmt -w .

	@echo "[INFO] Formatting frontend..."
	cd frontend && npm run format

# check formatting
fmt_check:
	@echo "[INFO] Checking Go formatting..."
	@test -z "$$(gofmt -l .)" || (echo "[X] Go files are not formatted. Run 'make fmt'"; exit 1)

	@echo "[INFO] Checking frontend formatting..."
	cd frontend && npm run format:check || (echo "[X] Frontend files are not formatted. Run 'make fmt'"; exit 1)

	@echo "[OK] Formatting OK!"

# run the app in development mode
dev:
	@make setup
	wails3 dev

# build the app for windows
build-windows:
	wails3 build GOOS=windows GOARCH=amd64

# build the app for linux
build-linux:
	wails3 build GOOS=linux GOARCH=amd64

# build the app for mac
build-mac:
	wails3 build GOOS=darwin GOARCH=universal

# clean build artifacts
clean:
	rm -rf bin/
	cd frontend && rm -rf dist

# help command
help:
	@echo "Available commands:"
	@echo "  make dev            Run the application in development mode"
	@echo "  make fmt            Format all go"
	@echo "  make build-windows  Build the app for Windows (64-bit)"
	@echo "  make build-linux    Build the app for Linux (64-bit)"
	@echo "  make build-mac      Build the app for macOS (universal)"
	@echo "  make clean          Clean build artifacts"
