import { Plus } from "lucide-react";

interface Props {
  title: string;
  description: string;
  buttonLabel: string;
  onButtonClick: () => void;
}

const EmptyLocation = ({ title, description, buttonLabel, onButtonClick }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm font-medium text-white/80">{title}</p>

      <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-blue-200/50">{description}</p>

      <button
        type="button"
        onClick={onButtonClick}
        className="mt-4 flex items-center gap-2 rounded-xl border border-blue-300/20 bg-[#0b1022] px-4 py-2 text-xs font-medium text-blue-100 transition hover:border-blue-300/30 hover:bg-[#121936]"
      >
        <Plus className="h-3.5 w-3.5" />
        {buttonLabel}
      </button>
    </div>
  );
};

export default EmptyLocation;
