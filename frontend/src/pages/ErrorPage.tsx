import { RefreshCcw } from "lucide-react";

interface Props {
  error: string;
  onRetry?: () => void;
}

const ErrorPage = ({ error, onRetry }: Props) => {
  const handleReload = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="h-full w-full overflow-hidden bg-[#02040a] font-sans text-white">
      <div className="relative flex h-full w-full flex-col overflow-hidden border border-white/15 shadow-[0_30px_80px_rgba(0,0,0,0.9)]">
        <div className="pointer-events-none absolute inset-0 bg-[#060917]/75 backdrop-blur-[2px]" />
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-0 h-48 bg-gradient-to-b from-blue-600/20 via-indigo-900/10 to-transparent" />
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full">
            <img src="/assets/logo.svg" alt="logo" />
          </div>

          <p className="max-w-[280px] text-xs leading-relaxed text-blue-200/50">{error}</p>

          <button
            type="button"
            onClick={handleReload}
            className="mt-6 flex w-full max-w-[220px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition hover:opacity-90 focus:outline-none"
          >
            <RefreshCcw className="h-4 w-4 shrink-0" />
            <span>Reload</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
