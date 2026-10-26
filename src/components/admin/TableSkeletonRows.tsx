interface TableSkeletonRowsProps {
  colSpan: number;
  rows?: number;
  label?: string;
}

/**
 * Loading placeholder for an admin table body. Matches the pulsing rows of each route's
 * loading.tsx so the page does not swap from one loading style to another once it mounts.
 */
export function TableSkeletonRows({
  colSpan,
  rows = 8,
  label = "Đang tải…",
}: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td colSpan={colSpan} className="h-16" aria-hidden="true" />
        </tr>
      ))}
      <tr>
        <td colSpan={colSpan} className="sr-only" role="status">
          {label}
        </td>
      </tr>
    </>
  );
}
