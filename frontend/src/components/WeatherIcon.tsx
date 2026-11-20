import { describeWeather } from "../weatherCodes";

import { TONE_SUN } from "../constants";

interface Props {
  condition: string;
  isDay: boolean;
  className?: string;
}

const WeatherIcon = ({ condition, isDay, className = "" }: Props) => {
  const { label, Icon, tone } = describeWeather(condition, isDay);

  return (
    <Icon
      role="img"
      aria-label={label}
      className={`${tone === TONE_SUN ? "text-amber-300" : "text-blue-200"} ${className}`}
    />
  );
};

export default WeatherIcon;
