import { Clock, ChevronUp, ChevronDown } from "lucide-react";

interface Props {
  isExpanded: boolean;
  onToggle: () => void;
}

const TimeConverterBar = ({ isExpanded, onToggle }: Props) => {
  return (
    <div className="relative z-20 shrink-0 border-t border-white/15 bg-[#050814]/95 backdrop-blur-md">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-3.5 text-blue-200/80 transition-colors hover:bg-white/[0.03] hover:text-white focus:outline-none"
      >
        <div className="flex items-center space-x-2 text-xs font-medium">
          <Clock className="h-3.5 w-3.5 text-blue-400" />

          <span className="text-white/80">Time Converter</span>
        </div>

        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-white/60" />
        ) : (
          <ChevronUp className="h-4 w-4 text-white/60" />
        )}
      </button>
    </div>
  );
};

export default TimeConverterBar;
