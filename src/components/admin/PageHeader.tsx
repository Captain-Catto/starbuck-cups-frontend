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
    <div className={`flex justify-between items-center ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && <p className="text-gray-300 mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
