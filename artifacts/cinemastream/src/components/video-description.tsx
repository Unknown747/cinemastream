import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  description: string | null | undefined;
  channelName?: string | null;
  /** When true the synopsis was written by the editor (override). */
  hasOverride?: boolean;
}

const URL_RE = /https?:\/\/[^\s)]+/g;

function linkify(line: string, lineKey: string) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(URL_RE);
  while ((match = re.exec(line)) !== null) {
    if (match.index > lastIndex) parts.push(line.slice(lastIndex, match.index));
    const url = match[0];
    parts.push(
      <a
        key={`${lineKey}-${match.index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="text-primary hover:underline break-all"
      >
        {url}
      </a>,
    );
    lastIndex = match.index + url.length;
  }
  if (lastIndex < line.length) parts.push(line.slice(lastIndex));
  return parts;
}

export function VideoDescription({
  description,
  channelName,
  hasOverride,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const paragraphs = useMemo(() => {
    const text = (description ?? "").trim();
    if (!text) return [];
    return text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [description]);

  if (paragraphs.length === 0) {
    return (
      <div className="mt-3 rounded-lg border border-dashed border-border/60 bg-card/30 p-4 text-sm text-foreground/60 leading-relaxed">
        Belum ada sinopsis untuk episode ini.
        {channelName ? (
          <>
            {" "}
            Tonton videonya di atas untuk melihat ceritanya langsung dari{" "}
            <span className="text-foreground/80">{channelName}</span>.
          </>
        ) : null}
      </div>
    );
  }

  const showToggle = paragraphs.length > 2 || paragraphs[0].length > 320;
  const visible = expanded ? paragraphs : paragraphs.slice(0, 2);

  return (
    <div className="mt-3">
      <div className="space-y-3 text-sm text-foreground/85 leading-relaxed">
        {visible.map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {linkify(p, `p${i}`)}
          </p>
        ))}
      </div>
      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          data-testid="button-toggle-description"
        >
          {expanded ? (
            <>
              Ringkas
              <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Baca selengkapnya
              <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      )}
      {!hasOverride && (
        <p className="mt-3 text-[11px] uppercase tracking-wider text-foreground/40">
          Sinopsis diolah dari deskripsi video oleh kreator{" "}
          {channelName ?? ""}.
        </p>
      )}
    </div>
  );
}
