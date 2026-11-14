import { ReactNode } from "react";

import { TONE_AMBER, TONE_BLUE } from "../../constants";

interface Props {
  fraction: number; // 1: full ring, 0:  empty
  tone: typeof TONE_BLUE | typeof TONE_AMBER;
  children: ReactNode;
}

const SIZE = 156;
const STROKE = 6;
const RADIUS = 72;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TimerRing = ({ fraction, tone, children }: Props) => {
  const gradientId = tone === TONE_BLUE ? "timer-ring-blue" : "timer-ring-amber";
  const [from, to] = tone === TONE_BLUE ? ["#3b82f6", "#6366f1"] : ["#fbbf24", "#f97316"];

  const clamped = Math.min(1, Math.max(0, fraction));

  return (
    <div className="relative shrink-0 self-center" style={{ width: SIZE, height: SIZE }}>
      {tone === TONE_AMBER && (
        <div className="absolute inset-1.5 rounded-full shadow-[0_0_44px_rgba(251,191,36,0.18)]" />
      )}

      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
        className="relative -rotate-90"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        </defs>

        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={STROKE}
        />

        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
          className="transition-[stroke-dashoffset] duration-300 ease-linear"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
};

export default TimerRing;
