import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; href?: string };

type BreadcrumbsProps = {
  items: Crumb[];
  className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-xs text-foreground/60 ${className ?? ""}`}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="inline-flex items-center gap-1.5">
              {c.href && !isLast ? (
                <Link
                  href={c.href}
                  className="hover:text-foreground transition-colors"
                  data-testid={`link-breadcrumb-${i}`}
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "text-foreground/80" : ""}
                >
                  {c.label}
                </span>
              )}
              {!isLast && <ChevronRight className="h-3 w-3 text-foreground/30" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
