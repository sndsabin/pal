import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  message: string;
}

const TIME_DELAY = 5000; //5s

const ErrorCard = ({ message }: Props) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, TIME_DELAY);

    return () => clearTimeout(timer);
  }, [message]);

  if (!isVisible) {
    return null;
  }

  if (message.trim() === "") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-[9999] w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-xl border border-red-300/15 bg-[#1a1020] px-3.5 py-3 shadow-2xl">
      <div className="flex items-center gap-2.5">
        <AlertCircle className="h-4 w-4 shrink-0 text-red-300/80" />
        <div className="min-w-0">
          <p className="text-xs font-medium text-red-100/90">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorCard;
