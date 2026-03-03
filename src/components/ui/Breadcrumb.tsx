import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
              >
                {isFirst && <Home className="w-4 h-4" />}
                {item.label}
              </Link>
            ) : (
              <span className="flex items-center gap-1 text-white">
                {isFirst && <Home className="w-4 h-4" />}
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="w-4 h-4 text-zinc-600" />}
          </div>
        );
      })}
    </nav>
  );
}
