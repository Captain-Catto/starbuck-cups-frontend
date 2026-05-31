import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

const SIZE_CLASSES = {
  sm: "size-4",
  md: "size-8",
  lg: "size-12",
};

export function LoadingSpinner({
  size = "md",
  text = "Loading…",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 bg-zinc-950 bg-opacity-90 flex items-center justify-center z-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <Loader2
          className={`${SIZE_CLASSES[size]} animate-spin text-zinc-400 mx-auto mb-2`}
        />
        {text && <p className="text-zinc-400 text-sm">{text}</p>}
      </div>
    </div>
  );
}

