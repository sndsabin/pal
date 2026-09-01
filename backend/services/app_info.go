package services

type ApplicationInfoService struct {
	name    string
	version string
}

type ApplicationInfo struct {
	Name    string `json:"name"`
	Version string `json:"version"`
}

func NewApplicationInfoService(name string, version string) *ApplicationInfoService {
	return &ApplicationInfoService{
		name:    name,
		version: version,
	}
}

func (ai *ApplicationInfoService) GetAppInfo() ApplicationInfo {
	return ApplicationInfo{
		Name:    ai.name,
		Version: ai.version,
	}
}
