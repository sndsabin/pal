package weather

type WeatherCondition string

const (
	ConditionClear        WeatherCondition = "clear"
	ConditionPartlyCloudy WeatherCondition = "partly_cloudy"
	ConditionCloudy       WeatherCondition = "cloudy"
	ConditionOvercast     WeatherCondition = "overcast"

	ConditionMist        WeatherCondition = "mist"
	ConditionFog         WeatherCondition = "fog"
	ConditionFreezingFog WeatherCondition = "freezing_fog"

	ConditionRainNearby          WeatherCondition = "rain_nearby"
	ConditionSnowNearby          WeatherCondition = "snow_nearby"
	ConditionSleetNearby         WeatherCondition = "sleet_nearby"
	ConditionFreezingDrizzleNear WeatherCondition = "freezing_drizzle_nearby"
	ConditionThunderstormNearby  WeatherCondition = "thunderstorm_nearby"

	ConditionBlowingSnow WeatherCondition = "blowing_snow"
	ConditionBlizzard    WeatherCondition = "blizzard"

	ConditionDrizzle         WeatherCondition = "drizzle"
	ConditionFreezingDrizzle WeatherCondition = "freezing_drizzle"
	ConditionRain            WeatherCondition = "rain"
	ConditionFreezingRain    WeatherCondition = "freezing_rain"
	ConditionSleet           WeatherCondition = "sleet"
	ConditionSnow            WeatherCondition = "snow"
	ConditionIcePellets      WeatherCondition = "ice_pellets"

	ConditionRainShowers      WeatherCondition = "rain_showers"
	ConditionSleetShowers     WeatherCondition = "sleet_showers"
	ConditionSnowShowers      WeatherCondition = "snow_showers"
	ConditionIcePelletShowers WeatherCondition = "ice_pellet_showers"

	ConditionRainThunderstorm WeatherCondition = "rain_thunderstorm"
	ConditionSnowThunderstorm WeatherCondition = "snow_thunderstorm"

	ConditionUnknown WeatherCondition = "unknown"
)

type WWOCondition struct {
	Code        int
	Description string
	Condition   WeatherCondition
}

// weather condition codes and their corresponding descriptions.
// https://wwo-www-test.worldweatheronline.com/weather-api/docs/weather-icons/
var WWOConditions = map[int]WWOCondition{
	113: {
		Code:        113,
		Description: "Sunny / Clear",
		Condition:   ConditionClear,
	},
	116: {
		Code:        116,
		Description: "Partly Cloudy",
		Condition:   ConditionPartlyCloudy,
	},
	119: {
		Code:        119,
		Description: "Cloudy",
		Condition:   ConditionCloudy,
	},
	122: {
		Code:        122,
		Description: "Overcast",
		Condition:   ConditionOvercast,
	},
	143: {
		Code:        143,
		Description: "Mist",
		Condition:   ConditionMist,
	},
	176: {
		Code:        176,
		Description: "Patchy rain nearby",
		Condition:   ConditionRainNearby,
	},
	179: {
		Code:        179,
		Description: "Patchy snow nearby",
		Condition:   ConditionSnowNearby,
	},
	182: {
		Code:        182,
		Description: "Patchy sleet nearby",
		Condition:   ConditionSleetNearby,
	},
	185: {
		Code:        185,
		Description: "Patchy freezing drizzle nearby",
		Condition:   ConditionFreezingDrizzleNear,
	},
	200: {
		Code:        200,
		Description: "Thundery outbreaks in nearby",
		Condition:   ConditionThunderstormNearby,
	},
	227: {
		Code:        227,
		Description: "Blowing snow",
		Condition:   ConditionBlowingSnow,
	},
	230: {
		Code:        230,
		Description: "Blizzard",
		Condition:   ConditionBlizzard,
	},
	248: {
		Code:        248,
		Description: "Fog",
		Condition:   ConditionFog,
	},
	260: {
		Code:        260,
		Description: "Freezing fog",
		Condition:   ConditionFreezingFog,
	},
	263: {
		Code:        263,
		Description: "Patchy light drizzle",
		Condition:   ConditionDrizzle,
	},
	266: {
		Code:        266,
		Description: "Light drizzle",
		Condition:   ConditionDrizzle,
	},
	281: {
		Code:        281,
		Description: "Freezing drizzle",
		Condition:   ConditionFreezingDrizzle,
	},
	284: {
		Code:        284,
		Description: "Heavy freezing drizzle",
		Condition:   ConditionFreezingDrizzle,
	},
	293: {
		Code:        293,
		Description: "Patchy light rain",
		Condition:   ConditionRain,
	},
	296: {
		Code:        296,
		Description: "Light rain",
		Condition:   ConditionRain,
	},
	299: {
		Code:        299,
		Description: "Moderate rain at times",
		Condition:   ConditionRain,
	},
	302: {
		Code:        302,
		Description: "Moderate rain",
		Condition:   ConditionRain,
	},
	305: {
		Code:        305,
		Description: "Heavy rain at times",
		Condition:   ConditionRain,
	},
	308: {
		Code:        308,
		Description: "Heavy rain",
		Condition:   ConditionRain,
	},
	311: {
		Code:        311,
		Description: "Light freezing rain",
		Condition:   ConditionFreezingRain,
	},
	314: {
		Code:        314,
		Description: "Moderate or heavy freezing rain",
		Condition:   ConditionFreezingRain,
	},
	317: {
		Code:        317,
		Description: "Light sleet",
		Condition:   ConditionSleet,
	},
	320: {
		Code:        320,
		Description: "Moderate or heavy sleet",
		Condition:   ConditionSleet,
	},
	323: {
		Code:        323,
		Description: "Patchy light snow",
		Condition:   ConditionSnow,
	},
	326: {
		Code:        326,
		Description: "Light snow",
		Condition:   ConditionSnow,
	},
	329: {
		Code:        329,
		Description: "Patchy moderate snow",
		Condition:   ConditionSnow,
	},
	332: {
		Code:        332,
		Description: "Moderate snow",
		Condition:   ConditionSnow,
	},
	335: {
		Code:        335,
		Description: "Patchy heavy snow",
		Condition:   ConditionSnow,
	},
	338: {
		Code:        338,
		Description: "Heavy snow",
		Condition:   ConditionSnow,
	},
	350: {
		Code:        350,
		Description: "Ice pellets",
		Condition:   ConditionIcePellets,
	},
	353: {
		Code:        353,
		Description: "Light rain shower",
		Condition:   ConditionRainShowers,
	},
	356: {
		Code:        356,
		Description: "Moderate or heavy rain shower",
		Condition:   ConditionRainShowers,
	},
	359: {
		Code:        359,
		Description: "Torrential rain shower",
		Condition:   ConditionRainShowers,
	},
	362: {
		Code:        362,
		Description: "Light sleet showers",
		Condition:   ConditionSleetShowers,
	},
	365: {
		Code:        365,
		Description: "Moderate or heavy sleet showers",
		Condition:   ConditionSleetShowers,
	},
	368: {
		Code:        368,
		Description: "Light snow showers",
		Condition:   ConditionSnowShowers,
	},
	371: {
		Code:        371,
		Description: "Moderate or heavy snow showers",
		Condition:   ConditionSnowShowers,
	},
	374: {
		Code:        374,
		Description: "Light showers of ice pellets",
		Condition:   ConditionIcePelletShowers,
	},
	377: {
		Code:        377,
		Description: "Moderate or heavy showers of ice pellets",
		Condition:   ConditionIcePelletShowers,
	},
	386: {
		Code:        386,
		Description: "Patchy light rain in area with thunder",
		Condition:   ConditionRainThunderstorm,
	},
	389: {
		Code:        389,
		Description: "Moderate or heavy rain in area with thunder",
		Condition:   ConditionRainThunderstorm,
	},
	392: {
		Code:        392,
		Description: "Patchy light snow in area with thunder",
		Condition:   ConditionSnowThunderstorm,
	},
	395: {
		Code:        395,
		Description: "Moderate or heavy snow in area with thunder",
		Condition:   ConditionSnowThunderstorm,
	},
}

func LookupWWOCondition(code int) WeatherCondition {
	condition, ok := WWOConditions[code]

	if !ok {
		return ConditionUnknown
	}

	return condition.Condition
}
