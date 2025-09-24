interface ProductStatusBadgeProps {
  type: "active" | "inactive" | "low-stock" | "out-of-stock";
  label: string;
}

export function ProductStatusBadge({ type, label }: ProductStatusBadgeProps) {
  const getStatusStyles = (type: string) => {
    switch (type) {
      case "inactive":
        return "bg-gray-700 text-white";
      case "low-stock":
        return "bg-yellow-700 text-white";
      case "out-of-stock":
        return "bg-red-700 text-white";
      case "active":
      default:
        return "bg-green-700 text-white";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs rounded-full whitespace-nowrap min-w-[120px] justify-center ${getStatusStyles(
        type
      )}`}
    >
      {label}
    </span>
  );
}
