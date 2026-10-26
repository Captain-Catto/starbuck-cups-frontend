interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <div>
        <h1 className="text-xl font-bold text-white sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 hidden text-gray-300 sm:block">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
