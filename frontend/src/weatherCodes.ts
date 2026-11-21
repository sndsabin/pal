import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  Cloudy,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Snowflake,
  Wind,
} from "lucide-react";

import { TONE_SKY, TONE_SUN } from "./constants";
import { WeatherDescription, WeatherCondition } from "./types";

export const describeWeather = (condition: string, isDay: boolean): WeatherDescription => {
  switch (condition) {
    case WeatherCondition.ConditionClear:
      return {
        label: "Clear",
        Icon: isDay ? Sun : Moon,
        tone: isDay ? TONE_SUN : TONE_SKY,
      };

    case WeatherCondition.ConditionPartlyCloudy:
      return {
        label: "Partly cloudy",
        Icon: isDay ? CloudSun : CloudMoon,
        tone: isDay ? TONE_SUN : TONE_SKY,
      };

    case WeatherCondition.ConditionCloudy:
      return {
        label: "Cloudy",
        Icon: Cloud,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionOvercast:
      return {
        label: "Overcast",
        Icon: Cloudy,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionMist:
      return {
        label: "Mist",
        Icon: CloudFog,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionFog:
      return {
        label: "Fog",
        Icon: CloudFog,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionFreezingFog:
      return {
        label: "Freezing fog",
        Icon: CloudFog,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionRainNearby:
      return {
        label: "Rain nearby",
        Icon: CloudRain,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionSnowNearby:
      return {
        label: "Snow nearby",
        Icon: CloudSnow,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionSleetNearby:
      return {
        label: "Sleet nearby",
        Icon: Snowflake,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionFreezingDrizzleNear:
      return {
        label: "Freezing drizzle nearby",
        Icon: CloudDrizzle,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionThunderstormNearby:
      return {
        label: "Thunderstorm nearby",
        Icon: CloudLightning,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionBlowingSnow:
      return {
        label: "Blowing snow",
        Icon: Wind,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionBlizzard:
      return {
        label: "Blizzard",
        Icon: Wind,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionDrizzle:
      return {
        label: "Drizzle",
        Icon: CloudDrizzle,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionFreezingDrizzle:
      return {
        label: "Freezing drizzle",
        Icon: Snowflake,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionRain:
      return {
        label: "Rain",
        Icon: CloudRain,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionFreezingRain:
      return {
        label: "Freezing rain",
        Icon: CloudRain,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionSleet:
      return {
        label: "Sleet",
        Icon: Snowflake,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionSnow:
      return {
        label: "Snow",
        Icon: CloudSnow,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionIcePellets:
      return {
        label: "Ice pellets",
        Icon: Snowflake,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionRainShowers:
      return {
        label: "Rain showers",
        Icon: CloudRain,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionSleetShowers:
      return {
        label: "Sleet showers",
        Icon: Snowflake,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionSnowShowers:
      return {
        label: "Snow showers",
        Icon: CloudSnow,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionIcePelletShowers:
      return {
        label: "Ice pellet showers",
        Icon: Snowflake,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionRainThunderstorm:
      return {
        label: "Rain with thunder",
        Icon: CloudLightning,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionSnowThunderstorm:
      return {
        label: "Snow with thunder",
        Icon: CloudLightning,
        tone: TONE_SKY,
      };

    case WeatherCondition.ConditionUnknown:
    default:
      return {
        label: "Unknown",
        Icon: Cloud,
        tone: TONE_SKY,
      };
  }
};
