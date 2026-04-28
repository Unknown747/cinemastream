import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Pencil,
  Save,
  X,
  Loader2,
  Check,
  Sparkles,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  useListChannels,
  useAddChannel,
  useRemoveChannel,
  useListAllVideos,
  useUpsertVideoOverride,
  useRemoveVideoOverride,
  useTranslateText,
  useGenerateSynopsis,
  useListArticles,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
  getListChannelsQueryKey,
  getListAllVideosQueryKey,
  getListArticlesQueryKey,
} from "@workspace/api-client-react";
import { ListArticlesResponseItem } from "@workspace/api-zod";
import type { z } from "zod/v4";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";

function ChannelForm() {
  const qc = useQueryClient();
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const add = useAddChannel({
    mutation: {
      onSuccess: () => {
        setHandle("");
        setError(null);
        qc.invalidateQueries({ queryKey: getListChannelsQueryKey() });
        qc.invalidateQueries({ queryKey: getListAllVideosQueryKey() });
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : "Gagal menambah channel";
        setError(msg);
      },
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!handle.trim()) return;
        add.mutate({ data: { handle: handle.trim() } });
      }}
      className="flex flex-col gap-2 sm:flex-row"
    >
      <input
        type="text"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        placeholder="@nama_channel atau URL channel YouTube"
        className="h-10 flex-1 rounded-md border border-border/60 bg-card/60 px-4 text-sm placeholder:text-foreground/40 focus:border-primary focus:outline-none"
        data-testid="input-channel-handle"
      />
      <Button
        type="submit"
        disabled={add.isPending || !handle.trim()}
        data-testid="button-add-channel"
      >
        {add.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        <span className="ml-2">Tambah Channel</span>
      </Button>
      {error && (
        <p className="text-sm text-destructive sm:ml-2 sm:self-center">{error}</p>
      )}
    </form>
  );
}

function ChannelList() {
  const qc = useQueryClient();
  const channels = useListChannels({
    query: { queryKey: getListChannelsQueryKey(), staleTime: 30_000 },
  });
  const remove = useRemoveChannel({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListChannelsQueryKey() });
        qc.invalidateQueries({ queryKey: getListAllVideosQueryKey() });
      },
    },
  });

  if (channels.isLoading) {
    return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
  }

  if (!channels.data || channels.data.length === 0) {
    return (
      <p className="text-sm text-foreground/60">Belum ada channel.</p>
    );
  }

  return (
    <ul className="divide-y divide-border/60 rounded-md border border-border/60 bg-card/40">
      {channels.data.map((c) => (
        <li
          key={c.id}
          className="flex items-center gap-3 p-3"
          data-testid={`row-channel-${c.id}`}
        >
          {c.thumbnailUrl && (
            <img
              src={c.thumbnailUrl}
              alt={c.name}
              className="h-10 w-10 shrink-0 rounded-full object-cover"
              loading="lazy"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{c.name}</div>
            <div className="truncate text-xs text-foreground/60">{c.handle}</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm(`Hapus channel "${c.name}"?`)) {
                remove.mutate({ id: c.id });
              }
            }}
            disabled={remove.isPending}
            aria-label="Hapus channel"
            data-testid={`button-remove-channel-${c.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}

interface VideoRowProps {
  video: {
    videoId: string;
    title: string;
    originalTitle: string;
    description: string;
    originalDescription: string;
    hasOverride: boolean;
    thumbnailUrl: string;
    channelName: string;
  };
}

function VideoRow({ video }: VideoRowProps) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setTitle(video.title);
    setDescription(video.description);
  }, [video.title, video.description]);

  const upsert = useUpsertVideoOverride({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListAllVideosQueryKey() });
        setEditing(false);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1500);
      },
    },
  });
  const remove = useRemoveVideoOverride({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListAllVideosQueryKey() });
      },
    },
  });
  const translate = useTranslateText({
    mutation: {
      onSuccess: (data) => {
        if (data?.translation) setTitle(data.translation);
      },
    },
  });
  const synopsis = useGenerateSynopsis({
    mutation: {
      onSuccess: (data) => {
        if (data?.synopsis) setDescription(data.synopsis);
      },
    },
  });

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row" data-testid={`row-video-${video.videoId}`}>
      <img
        src={video.thumbnailUrl}
        alt={video.title}
        loading="lazy"
        className="h-auto w-full max-w-[180px] shrink-0 rounded object-cover"
      />
      <div className="min-w-0 flex-1">
        {!editing ? (
          <>
            <h3 className="text-sm font-semibold leading-snug">{video.title}</h3>
            {video.hasOverride && (
              <p className="mt-1 text-xs text-foreground/50">
                Asli: <span className="line-clamp-1 italic">{video.originalTitle}</span>
              </p>
            )}
            <p className="mt-1 text-xs text-foreground/60">{video.channelName}</p>
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                data-testid={`button-edit-${video.videoId}`}
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="ml-1.5">Edit Judul</span>
              </Button>
              {video.hasOverride && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove.mutate({ videoId: video.videoId })}
                  disabled={remove.isPending}
                  data-testid={`button-revert-${video.videoId}`}
                >
                  Reset ke Asli
                </Button>
              )}
              {savedFlash && (
                <span className="inline-flex items-center gap-1 text-xs text-green-500">
                  <Check className="h-3.5 w-3.5" /> Tersimpan
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs uppercase tracking-wider text-foreground/60">
                Judul (Bahasa Indonesia)
              </label>
              <button
                type="button"
                onClick={() =>
                  translate.mutate({ data: { text: video.originalTitle } })
                }
                disabled={translate.isPending}
                className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                data-testid={`button-ai-translate-${video.videoId}`}
                title={`Terjemahkan judul asli: ${video.originalTitle}`}
              >
                {translate.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Terjemahkan dengan AI
              </button>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              data-testid={`input-title-${video.videoId}`}
            />
            {translate.isError && (
              <p className="text-xs text-destructive">
                AI gagal menerjemahkan. Coba lagi.
              </p>
            )}
            <div className="mt-2 flex items-center justify-between gap-2">
              <label className="text-xs uppercase tracking-wider text-foreground/60">
                Sinopsis (opsional)
              </label>
              <button
                type="button"
                onClick={() =>
                  synopsis.mutate({
                    data: {
                      title: title || video.originalTitle,
                      channelName: video.channelName ?? null,
                    },
                  })
                }
                disabled={synopsis.isPending || !(title || video.originalTitle)}
                className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                data-testid={`button-ai-synopsis-${video.videoId}`}
                title="Tulis sinopsis singkat Bahasa Indonesia berdasarkan judul"
              >
                {synopsis.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Buat Sinopsis dengan AI
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Tulis 2–3 kalimat tentang drama ini, atau klik tombol AI di atas."
              className="rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              data-testid={`textarea-description-${video.videoId}`}
            />
            {synopsis.isError && (
              <p className="text-xs text-destructive">
                AI gagal membuat sinopsis. Coba lagi.
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <Button
                size="sm"
                onClick={() =>
                  upsert.mutate({
                    videoId: video.videoId,
                    data: { title, description },
                  })
                }
                disabled={upsert.isPending}
                data-testid={`button-save-${video.videoId}`}
              >
                {upsert.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                <span className="ml-1.5">Simpan</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setTitle(video.title);
                  setDescription(video.description);
                }}
              >
                <X className="h-3.5 w-3.5" />
                <span className="ml-1.5">Batal</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

function VideoOverrideList() {
  const videos = useListAllVideos({
    query: { queryKey: getListAllVideosQueryKey(), staleTime: 30_000 },
  });
  const [filter, setFilter] = useState("");

  if (videos.isLoading) {
    return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
  }
  if (!videos.data || videos.data.length === 0) {
    return <p className="text-sm text-foreground/60">Belum ada video.</p>;
  }
  const filtered = filter.trim()
    ? videos.data.filter(
        (v) =>
          v.title.toLowerCase().includes(filter.toLowerCase()) ||
          v.originalTitle.toLowerCase().includes(filter.toLowerCase()),
      )
    : videos.data;

  return (
    <div>
      <input
        type="search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Cari judul..."
        className="mb-3 h-10 w-full rounded-md border border-border/60 bg-card/60 px-4 text-sm placeholder:text-foreground/40 focus:border-primary focus:outline-none"
        data-testid="input-filter-videos"
      />
      <ul className="divide-y divide-border/60 rounded-md border border-border/60 bg-card/40">
        {filtered.map((v) => (
          <VideoRow key={v.videoId} video={v} />
        ))}
      </ul>
    </div>
  );
}

export default function AdminPage() {
  return (
    <>
      <Seo
        title="Admin — Kelola Channel & Judul | CinemaStream"
        description="Halaman admin untuk mengelola channel YouTube dan menerjemahkan judul drama ke Bahasa Indonesia."
        path="/admin"
        noindex
      />

      <section className="pt-28 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-serif text-4xl tracking-tight">Admin</h1>
            <p className="mt-2 text-foreground/70">
              Kelola channel YouTube yang ditampilkan di halaman Drama dan ganti
              judul ke Bahasa Indonesia.
            </p>
          </motion.div>

          <section className="mt-10">
            <h2 className="mb-3 font-serif text-2xl">Channel</h2>
            <p className="mb-4 text-sm text-foreground/60">
              Tambah channel YouTube. Daftar video akan ter-update otomatis saat
              channel meng-upload episode baru.
            </p>
            <ChannelForm />
            <div className="mt-4">
              <ChannelList />
            </div>
          </section>

          <section className="mt-12">
            <h2 className="mb-3 font-serif text-2xl">Judul & Deskripsi</h2>
            <p className="mb-4 text-sm text-foreground/60">
              Ganti judul Cina ke Bahasa Indonesia. Reset kapan saja untuk
              kembali ke judul asli.
            </p>
            <VideoOverrideList />
          </section>

          <section className="mt-12">
            <div className="flex items-end justify-between mb-3">
              <h2 className="font-serif text-2xl">Artikel & Berita</h2>
            </div>
            <p className="mb-4 text-sm text-foreground/60">
              Tulis artikel editorial original (ulasan, panduan, berita drama)
              untuk meningkatkan kredibilitas SEO. Format Markdown didukung.
            </p>
            <ArticleAdmin />
          </section>
        </div>
      </section>
    </>
  );
}

type Article = z.infer<typeof ListArticlesResponseItem>;

function emptyArticle() {
  return {
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    channelId: "",
    status: "draft" as "draft" | "published",
    author: "Tim CinemaStream",
  };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function ArticleAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Article | null>(null);
  const [draft, setDraft] = useState(emptyArticle());
  const [error, setError] = useState<string | null>(null);

  const list = useListArticles(
    { includeDrafts: true },
    {
      query: {
        queryKey: getListArticlesQueryKey({ includeDrafts: true }),
        staleTime: 10_000,
      },
    },
  );
  const channels = useListChannels({
    query: { queryKey: getListChannelsQueryKey(), staleTime: 60_000 },
  });

  const create = useCreateArticle({
    mutation: {
      onSuccess: () => {
        setDraft(emptyArticle());
        setError(null);
        qc.invalidateQueries({ queryKey: getListArticlesQueryKey({ includeDrafts: true }) });
        qc.invalidateQueries({ queryKey: getListArticlesQueryKey() });
      },
      onError: (err: unknown) =>
        setError(err instanceof Error ? err.message : "Gagal menyimpan artikel"),
    },
  });
  const update = useUpdateArticle({
    mutation: {
      onSuccess: () => {
        setEditing(null);
        setError(null);
        qc.invalidateQueries({ queryKey: getListArticlesQueryKey({ includeDrafts: true }) });
        qc.invalidateQueries({ queryKey: getListArticlesQueryKey() });
      },
      onError: (err: unknown) =>
        setError(err instanceof Error ? err.message : "Gagal menyimpan artikel"),
    },
  });
  const remove = useDeleteArticle({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListArticlesQueryKey({ includeDrafts: true }) });
        qc.invalidateQueries({ queryKey: getListArticlesQueryKey() });
      },
    },
  });

  const startEdit = (a: Article) => {
    setEditing(a);
    setDraft({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      coverImage: a.coverImage ?? "",
      channelId: a.channelId ?? "",
      status: a.status,
      author: a.author,
    });
  };

  const submit = () => {
    if (!draft.title.trim() || !draft.excerpt.trim() || !draft.content.trim()) {
      setError("Judul, ringkasan, dan isi wajib diisi.");
      return;
    }
    const payload = {
      slug: draft.slug.trim() || slugify(draft.title),
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim(),
      content: draft.content,
      coverImage: draft.coverImage.trim() || null,
      channelId: draft.channelId.trim() || null,
      status: draft.status,
      author: draft.author.trim() || "Tim CinemaStream",
    };
    if (editing) {
      update.mutate({ id: editing.id, data: payload });
    } else {
      create.mutate({ data: payload });
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft(emptyArticle());
    setError(null);
  };

  const isPending = create.isPending || update.isPending;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/60 bg-card/40 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="font-medium">
            {editing ? `Edit: ${editing.title}` : "Tulis artikel baru"}
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={draft.title}
            onChange={(e) => {
              const v = e.target.value;
              setDraft((d) => ({
                ...d,
                title: v,
                slug: editing ? d.slug : slugify(v),
              }));
            }}
            placeholder="Judul artikel"
            className="h-10 rounded-md border border-border/60 bg-background px-4 text-sm sm:col-span-2"
            data-testid="input-article-title"
          />
          <input
            value={draft.slug}
            onChange={(e) =>
              setDraft((d) => ({ ...d, slug: slugify(e.target.value) }))
            }
            placeholder="slug-url-artikel"
            className="h-10 rounded-md border border-border/60 bg-background px-4 text-sm font-mono"
            data-testid="input-article-slug"
          />
          <input
            value={draft.author}
            onChange={(e) => setDraft((d) => ({ ...d, author: e.target.value }))}
            placeholder="Penulis"
            className="h-10 rounded-md border border-border/60 bg-background px-4 text-sm"
            data-testid="input-article-author"
          />
          <input
            value={draft.coverImage}
            onChange={(e) => setDraft((d) => ({ ...d, coverImage: e.target.value }))}
            placeholder="URL gambar cover (opsional)"
            className="h-10 rounded-md border border-border/60 bg-background px-4 text-sm sm:col-span-2"
            data-testid="input-article-cover"
          />
          <select
            value={draft.channelId}
            onChange={(e) => setDraft((d) => ({ ...d, channelId: e.target.value }))}
            className="h-10 rounded-md border border-border/60 bg-background px-4 text-sm"
            data-testid="select-article-channel"
          >
            <option value="">Tanpa channel terkait</option>
            {channels.data?.map((c) => (
              <option key={c.channelId} value={c.channelId}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={draft.status}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                status: e.target.value as "draft" | "published",
              }))
            }
            className="h-10 rounded-md border border-border/60 bg-background px-4 text-sm"
            data-testid="select-article-status"
          >
            <option value="draft">Draf</option>
            <option value="published">Publikasikan</option>
          </select>
          <textarea
            value={draft.excerpt}
            onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
            placeholder="Ringkasan singkat (untuk SEO meta description & kartu artikel, ~160 karakter)"
            rows={2}
            className="rounded-md border border-border/60 bg-background px-4 py-2 text-sm sm:col-span-2"
            data-testid="textarea-article-excerpt"
          />
          <textarea
            value={draft.content}
            onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
            placeholder={`# Judul artikel\n\nTulis isi artikel di sini menggunakan **Markdown**.\n\n- Daftar\n- Item kedua\n\n[Link ke channel](/channel/UCxxxx)`}
            rows={12}
            className="rounded-md border border-border/60 bg-background px-4 py-3 text-sm font-mono leading-relaxed sm:col-span-2"
            data-testid="textarea-article-content"
          />
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={submit} disabled={isPending} data-testid="button-save-article">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="ml-2">
              {editing ? "Simpan perubahan" : "Simpan artikel"}
            </span>
          </Button>
          {editing && (
            <Button variant="ghost" onClick={cancelEdit} data-testid="button-cancel-article">
              <X className="h-4 w-4" />
              <span className="ml-2">Batal edit</span>
            </Button>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-medium text-sm uppercase tracking-wider text-foreground/60">
          Daftar artikel
        </h3>
        {list.isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : (list.data ?? []).length === 0 ? (
          <p className="text-sm text-foreground/60">Belum ada artikel.</p>
        ) : (
          <ul className="divide-y divide-border/60 rounded-md border border-border/60 bg-card/40">
            {(list.data ?? []).map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {a.status === "published" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        <Eye className="h-3 w-3" />
                        Publik
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-semibold text-foreground/60">
                        <EyeOff className="h-3 w-3" />
                        Draf
                      </span>
                    )}
                    <p className="truncate text-sm font-medium">{a.title}</p>
                  </div>
                  <p className="mt-1 truncate text-xs text-foreground/50 font-mono">
                    /blog/{a.slug}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(a)}
                    data-testid={`button-edit-article-${a.slug}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Hapus artikel "${a.title}"?`)) {
                        remove.mutate({ id: a.id });
                      }
                    }}
                    data-testid={`button-delete-article-${a.slug}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
