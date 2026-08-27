import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  message: string;
}

const TIME_DELAY = 5000; //5s

const ErrorCard = ({ message }: Props) => {
  const [isVisible, setIsVisible] = useState(Boolean(message));

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, TIME_DELAY);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return;
  }

  return (
    <div className="mt-4 rounded-xl border border-red-300/15 bg-red-500/[0.06] px-3.5 py-3">
      <div className="flex items-center gap-2.5">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300/80" />

        <div className="min-w-0">
          <p className="text-xs font-medium text-red-100/90">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorCard;
