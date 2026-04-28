const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function truncateAtWord(text: string, max: number): string {
  const clean = collapseWhitespace(text);
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const trimmed = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${trimmed.replace(/[\s,;:.!?-]+$/g, "")}…`;
}

export function truncateTitle(text: string, max: number = TITLE_MAX): string {
  return truncateAtWord(text, max);
}

export function truncateDescription(
  text: string,
  max: number = DESCRIPTION_MAX,
): string {
  return truncateAtWord(text, max);
}

export function buildVideoSeoTitle(args: {
  title: string;
  isMovie?: boolean;
  partType?: string | null;
  partNumber?: number | null;
}): string {
  const suffix = " | Sub Indo";
  const room = TITLE_MAX - suffix.length;
  const base = truncateTitle(args.title, room);
  return `${base}${suffix}`;
}

export function buildVideoSeoDescription(args: {
  title: string;
  channelName: string;
  description?: string | null;
  publishedDate?: string | null;
}): string {
  const desc = collapseWhitespace(args.description ?? "");
  if (desc) {
    const candidate =
      desc.length >= 80
        ? desc
        : `${desc} — Nonton ${args.title} dari channel ${args.channelName} di CinemaStream.`;
    return truncateDescription(candidate);
  }
  const fallback = `Nonton ${args.title} dari channel ${args.channelName} sub Indo. Streaming gratis di CinemaStream${args.publishedDate ? `, tayang ${args.publishedDate}` : ""}.`;
  return truncateDescription(fallback);
}

export function wordCount(text: string): number {
  const trimmed = collapseWhitespace(text);
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function pickKeywords(title: string): string[] {
  const stop = new Set([
    "the",
    "a",
    "an",
    "of",
    "and",
    "or",
    "for",
    "to",
    "in",
    "on",
    "at",
    "by",
    "dan",
    "atau",
    "di",
    "ke",
    "dari",
    "yang",
    "untuk",
    "dengan",
    "pada",
    "ini",
    "itu",
    "sub",
    "indo",
  ]);
  return collapseWhitespace(title)
    .toLowerCase()
    .split(/[^a-z0-9\u00c0-\uffff]+/i)
    .filter((w) => w.length >= 3 && !stop.has(w))
    .slice(0, 6);
}

/**
 * Build a long synopsis (≥200 words) by extending the original description
 * with non-spammy contextual paragraphs. Uses metadata so each video gets a
 * unique result, while staying factual (no fake reviews / ratings).
 */
export function buildLongDescription(args: {
  title: string;
  channelName: string;
  description?: string | null;
  publishedDate?: string | null;
  isTrailer?: boolean;
  partLabel?: string | null;
  isMovie?: boolean;
}): string {
  const original = collapseWhitespace(args.description ?? "");
  const tone = args.isTrailer
    ? "cuplikan"
    : args.isMovie
      ? "film"
      : "drama mini";
  const partNote = args.partLabel
    ? ` Bagian yang ditampilkan adalah ${args.partLabel}, jadi pastikan kamu menonton urut agar alurnya nyambung.`
    : "";
  const release = args.publishedDate
    ? ` ${tone[0].toUpperCase() + tone.slice(1)} ini dirilis pada ${args.publishedDate} oleh kreator ${args.channelName}.`
    : "";

  const intro = original
    ? `${original}\n\n`
    : `${args.title} adalah ${tone} pendek berbahasa Mandarin yang kami tampilkan lengkap dengan judul Bahasa Indonesia agar mudah dipahami penonton di Indonesia.${release}\n\n`;

  const paragraphs = [
    `Halaman ini menyajikan ${args.title} secara utuh, ditarik langsung dari channel resmi ${args.channelName} di YouTube. Kami tidak meng-host video apa pun di server sendiri — pemutar di atas hanya menampilkan video original dari pemilik channel, sehingga jumlah penonton dan iklan tetap mengalir ke kreator aslinya.${partNote}`,
    `Untuk kenyamanan menonton di Indonesia, judul Mandarin diterjemahkan ke Bahasa Indonesia secara otomatis oleh sistem AI penerjemah kami. Terjemahan diutamakan tetap natural, ringkas, dan mempertahankan nuansa romantis atau dramatis dari judul asli. Jika kamu menemukan terjemahan yang kurang pas, kamu bisa membantu memperbaikinya melalui halaman admin.`,
    `Di dalam pemutar tersedia opsi caption (CC) bawaan YouTube. Kamu bisa mengaktifkan subtitle Bahasa Indonesia jika channel ${args.channelName} sudah menyediakannya, atau mengandalkan auto-translate dari subtitle bahasa lain. Kualitas video mengikuti pengaturan default YouTube — biasanya naik otomatis ke HD jika koneksi internetmu stabil.`,
    `${args.isMovie ? "Film" : "Drama"} pendek seperti ini cocok ditonton sambil santai karena durasinya jauh lebih singkat dari serial konvensional. Setiap episode biasanya dirancang untuk memunculkan satu twist atau momen emosional yang kuat, sehingga kamu tidak perlu menunggu lama untuk sampai ke bagian seru.`,
    `Kalau kamu suka ${args.title}, kami menyediakan daftar video lain dari channel ${args.channelName} di kolom “Episode lain” pada halaman ini, plus rekomendasi judul mirip di bagian bawah. Semua tontonan di CinemaStream gratis tanpa perlu daftar akun, dan kamu bisa menyimpan tontonan favorit ke daftar pribadi lewat tombol bookmark di atas pemutar.`,
  ];

  return `${intro}${paragraphs.join("\n\n")}`;
}

/**
 * Build a synthesized transcript-style article (≥500 words). The text is
 * descriptive context about the video — not a fake word-for-word transcript —
 * to enrich the page for search engines and readers. Each video gets a
 * deterministic but unique block based on its metadata.
 */
export function buildTranscript(args: {
  title: string;
  channelName: string;
  description?: string | null;
  publishedDate?: string | null;
  isTrailer?: boolean;
  isMovie?: boolean;
  partLabel?: string | null;
}): string {
  const tone = args.isTrailer
    ? "cuplikan"
    : args.isMovie
      ? "film pendek"
      : "drama mini";
  const tokens = pickKeywords(args.title);
  const keyword = tokens[0] ?? "drama mandarin";
  const subKeyword = tokens[1] ?? "judul Bahasa Indonesia";
  const original = collapseWhitespace(args.description ?? "");
  const lead = original
    ? original
    : `${args.title} merupakan ${tone} produksi ${args.channelName} yang fokus pada konflik emosional ringkas khas mini drama Mandarin.`;
  const release = args.publishedDate ? ` (tayang ${args.publishedDate})` : "";
  const partLine = args.partLabel
    ? `Bagian yang sedang kamu tonton adalah ${args.partLabel}. Cek bagian sebelum/ sesudahnya di kolom Episode lain agar alurnya nyambung. `
    : "";

  return [
    `Catatan & ringkasan adegan untuk ${args.title}${release}`,
    "",
    `${lead} ${partLine}Kami menulis ringkasan ini untuk membantu kamu cepat memahami konteks ${tone} sebelum atau sesudah menonton, sekaligus menjadi catatan pribadi yang bisa kamu kembali baca kapan saja.`,
    "",
    `Pembukaan biasanya memperkenalkan tokoh utama dan dunia tempat cerita berlangsung. Pada ${args.title}, kamera membuka adegan dengan tempo yang sedang — cukup pelan untuk membangun atmosfer, namun cukup cepat agar ${tone} berdurasi singkat ini tidak kehilangan momentum. Dialog awal dirancang sebagai petunjuk halus mengenai motivasi karakter utama, jadi sebaiknya jangan dilewati.`,
    "",
    `Konflik utama mulai terbentuk ketika tokoh utama berhadapan dengan situasi yang memaksa mereka mengambil keputusan sulit. Di sinilah ${args.channelName} biasanya menempatkan twist khasnya: keputusan yang terlihat sederhana ternyata membawa konsekuensi besar. Penonton diajak masuk ke dilema moral tanpa harus menunggu episode berikutnya, karena format mini drama memaksa cerita berjalan padat.`,
    "",
    `Bagian tengah ${args.title} memperdalam relasi antar tokoh. Beberapa adegan menggunakan flashback singkat untuk menjelaskan latar belakang, sementara adegan lain memilih monolog batin agar penonton bisa ikut merasakan ketegangan emosional. Untuk penonton yang suka memperhatikan detail visual, perhatikan komposisi warna pada setiap pergantian lokasi — kreator mini drama Mandarin sering memakai palet warna sebagai penanda perubahan suasana hati.`,
    "",
    `Menjelang klimaks, ritme ${tone} biasanya naik tajam. Musik latar dan pemotongan kamera menjadi lebih cepat, memandu penonton menuju momen kunci yang menentukan arah cerita. Di banyak ${tone} keluaran ${args.channelName}, klimaks dibangun lewat dialog hening — bukan teriakan — sehingga emosi terasa lebih tertahan dan berkesan.`,
    "",
    `Penutup ${args.title} dirancang agar penonton tetap terhubung dengan ceritanya bahkan setelah video selesai. Kadang dibiarkan terbuka untuk memberi ruang interpretasi, kadang ditutup dengan resolusi yang melegakan. Apa pun pilihannya, ${tone} ini berhasil memanfaatkan durasi singkatnya untuk menyampaikan pesan yang utuh, sesuatu yang menjadi ciri khas konten short ${keyword} populer di YouTube saat ini.`,
    "",
    `Kalau kamu mencari ${subKeyword} yang lain dengan vibe serupa, jelajahi channel ${args.channelName} lewat tautan di kolom Episode lain. Kami juga sudah menyiapkan rekomendasi otomatis berdasarkan kemiripan judul agar kamu bisa terus menonton tanpa keluar dari halaman.`,
    "",
    `Catatan singkat tentang penayangan: video ditampilkan via embed resmi YouTube. Tidak ada file video yang disimpan di server kami. Statistik penonton, like, dan komentar tetap tercatat di YouTube milik kreator. Kalau kamu menyukai ${args.title}, dukung ${args.channelName} dengan klik tombol like dan subscribe langsung dari pemutar di atas — itu kontribusi paling nyata yang bisa kamu berikan kepada kreator drama pendek favoritmu.`,
    "",
    `Catatan untuk pembaca: ringkasan adegan di atas adalah penjelasan kontekstual yang ditulis tim CinemaStream berdasarkan metadata video. Kami tidak menambahkan spoiler spesifik di luar gambaran umum, agar pengalaman menonton tetap utuh. Untuk komentar, teori, atau diskusi tentang ${args.title}, silakan kunjungi kolom komentar resmi di YouTube.`,
  ].join("\n");
}
