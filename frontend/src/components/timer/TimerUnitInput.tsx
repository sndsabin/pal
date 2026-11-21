import { zeroPad } from "../../time";

interface Props {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}

const TimerUnitInput = ({ label, value, max, onChange }: Props) => {
  const clamp = (value: string, max: number) => {
    const intVal = Number.parseInt(value, 10);

    if (Number.isNaN(intVal)) {
      return 0;
    }

    return Math.min(Math.max(intVal, 0), max);
  };

  return (
    <label className="flex flex-col items-center gap-1">
      <input
        type="number"
        name={label}
        min={0}
        max={max}
        value={zeroPad(value)}
        aria-label={label}
        onChange={(e) => onChange(clamp(e.target.value, max))}
        onFocus={(e) => e.target.select()}
        className="h-[52px] w-[84px] [appearance:textfield] rounded-xl border border-white/15 bg-[#050814] text-center text-[30px] font-light text-white tabular-nums transition focus:border-blue-400 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <span className="text-[10px] tracking-[0.12em] text-blue-200/70 uppercase">{label}</span>
    </label>
  );
};

export default TimerUnitInput;
