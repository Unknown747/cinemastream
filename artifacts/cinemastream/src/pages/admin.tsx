import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Trash2, Pencil, Save, X, Loader2, Check, Sparkles } from "lucide-react";
import {
  useListChannels,
  useAddChannel,
  useRemoveChannel,
  useListAllVideos,
  useUpsertVideoOverride,
  useRemoveVideoOverride,
  useTranslateText,
  getListChannelsQueryKey,
  getListAllVideosQueryKey,
} from "@workspace/api-client-react";
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
            <label className="mt-2 text-xs uppercase tracking-wider text-foreground/60">
              Deskripsi (opsional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              data-testid={`textarea-description-${video.videoId}`}
            />
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
        </div>
      </section>
    </>
  );
}
