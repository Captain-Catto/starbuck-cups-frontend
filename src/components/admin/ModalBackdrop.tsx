interface ModalBackdropProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalBackdrop({ children, className = "" }: ModalBackdropProps) {
  return (
    <div
      className={`fixed inset-0 bg-zinc-950 bg-opacity-50 flex items-center justify-center z-50 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
