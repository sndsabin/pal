package main

import (
	"embed"
	"errors"
	"fmt"
	"os"
	"pal/backend"
	"pal/backend/workspace"
	"path/filepath"
	"runtime"

	"log"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

const (
	AppName         = "pal"
	AppVersion      = "0.0.3"
	AppDescription  = "A system tray app for staying in sync with moments across the world."
	windowShowEvent = "window:show"
	windowHideEvent = "window:hide"
)

//go:embed assets/icons/icon.png
var icon []byte

//go:embed assets/icons/icon-dark.png
var iconDark []byte

//go:embed assets/icons/mac-icon-template.png
var macIconTemplate []byte

//go:embed all:frontend/dist
var assets embed.FS

func createWindow(app *application.App) *application.WebviewWindow {
	window := app.Window.NewWithOptions(application.WebviewWindowOptions{
		Name:             fmt.Sprintf("%s Window", AppName),
		Title:            AppName,
		Width:            400,
		Height:           520,
		Frameless:        true, // no title bar
		AlwaysOnTop:      true, // popup above other windows
		Hidden:           true,
		HideOnFocusLost:  true,
		HideOnEscape:     true,
		DisableResize:    true,
		BackgroundColour: application.NewRGB(6, 7, 15),
		URL:              "/",
		Windows: application.WindowsWindow{
			HiddenOnTaskbar: true,
		},
	})

	window.RegisterHook(events.Common.WindowClosing, func(event *application.WindowEvent) {
		window.Hide()
		event.Cancel()
	})

	window.OnWindowEvent(events.Common.WindowShow, func(e *application.WindowEvent) {
		app.Event.Emit(windowShowEvent)
	})

	window.OnWindowEvent(events.Common.WindowHide, func(event *application.WindowEvent) {
		app.Event.Emit(windowHideEvent)
	})

	return window
}

// main function serves as the application's entry point.
func main() {
	initCrashLog()

	backendApp, err := backend.New(AppName, AppVersion)
	if err != nil {
		log.Fatal("error initializing backend: ", err)
	}

	// Create a new Wails application by providing the necessary options.
	app := application.New(application.Options{
		Name:        AppName,
		Description: AppDescription,
		Services: []application.Service{
			application.NewService(backendApp.LocationService),
			application.NewService(backendApp.UserPreferenceService),
			application.NewService(backendApp.ApplicationInfoService),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ActivationPolicy: application.ActivationPolicyAccessory,
		},
		Windows: application.WindowsOptions{
			DisableQuitOnLastWindowClosed: true,
		},
	})

	app.OnShutdown(func() {
		backendApp.Close()
	})

	// auto start
	if err := app.Autostart.Enable(); err != nil {
		if !errors.Is(err, application.ErrAutostartNotSupported) {
			backendApp.Logger.Logger.Error("error autostarting: " + err.Error())
		}
	}

	// system tray
	systemTray := app.SystemTray.New()

	systemTray.SetIcon(icon)
	systemTray.SetDarkModeIcon(iconDark)
	systemTray.SetTooltip(AppName)

	// Use the template icon on macOS so the icon respects light/dark modes.
	if runtime.GOOS == "darwin" {
		systemTray.SetTemplateIcon(macIconTemplate)
	}

	/**
	* Menu
	*
	* The default behaviour is:
	* Left-click tray icon → Toggle window visibility
	* Right-click tray icon → Show menu (if set)
	* Window positioned near tray icon
	*
	* But in linux, both clicks are registered as left click
	* so menu and window both shows no matter if user left clicks or right clicks
	* https://github.com/wailsapp/wails/issues/4494#issuecomment-3516137608
	*
	 */
	menu := app.NewMenu()
	menu.Add("Quit").OnClick(func(data *application.Context) {
		app.Quit()
	})

	systemTray.SetMenu(menu)

	// window
	window := createWindow(app)
	systemTray.AttachWindow(window)
	systemTray.WindowOffset(5) // doesn't work on wayland

	// Run the application. This blocks until the application has been exited.
	err = app.Run()

	// If an error occurred while running the application, log it and exit.
	if err != nil {
		log.Fatal(err)
	}
}

func initCrashLog() {
	dir, err := os.UserConfigDir()
	if err != nil {
		dir = os.TempDir()
	}

	logsDir := filepath.Join(dir, AppName, workspace.LogsDirName)
	err = os.MkdirAll(logsDir, workspace.DirPermMode)
	if err != nil {
		return
	}

	filePath := filepath.Join(dir, "startup-error.log")
	file, err := os.OpenFile(filePath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, workspace.FilePermMode)
	if err != nil {
		return
	}

	log.SetOutput(file)
}
