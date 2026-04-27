import { Link } from "wouter";
import { ChevronRight, type LucideIcon } from "lucide-react";

type SectionHeadingProps = {
  eyebrow?: string;
  eyebrowIcon?: LucideIcon;
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
};

export function SectionHeading({
  eyebrow,
  eyebrowIcon: Icon,
  title,
  description,
  href,
  hrefLabel = "Lihat semua",
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
      <div>
        {eyebrow && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            {Icon && <Icon className="h-3 w-3" />}
            {eyebrow}
          </div>
        )}
        <h2 className="mt-2 font-serif text-3xl sm:text-4xl tracking-tight text-balance">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0"
          data-testid={`link-section-${href.replace(/\//g, "-")}`}
        >
          {hrefLabel} <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
