import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = "md",
  text = "Đang tải...",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <Loader2
          className={`${sizeClasses[size]} animate-spin text-zinc-400 mx-auto mb-2`}
        />
        {text && <p className="text-zinc-400 text-sm">{text}</p>}
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <LoadingSpinner size="lg" text="Đang tải trang..." />
    </div>
  );
}

export function ComponentLoader({ text }: { text?: string }) {
  return (
    <div className="min-h-[200px] bg-black flex items-center justify-center">
      <LoadingSpinner text={text} />
    </div>
  );
}
