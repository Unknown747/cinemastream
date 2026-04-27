import { Link } from "wouter";
import { motion } from "framer-motion";
import { Languages, Tv2, RefreshCw, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/seo";

const values = [
  {
    icon: Languages,
    title: "Judul yang langsung kamu paham",
    text: "Judul Mandarin diterjemahkan otomatis ke Bahasa Indonesia menggunakan AI penerjemah profesional, lalu disimpan agar episode berikutnya muncul instan.",
  },
  {
    icon: RefreshCw,
    title: "Selalu update sendiri",
    text: "Setiap channel YouTube yang kamu daftarkan akan dipantau. Tiap upload baru, daftar drama langsung ikut update — kamu tinggal nonton.",
  },
  {
    icon: Tv2,
    title: "Pemutar bersih, bebas iklan",
    text: "Drama diputar via embed YouTube resmi. Tidak ada iklan tambahan dari kami, tidak ada pop-up, dan tidak perlu daftar akun apa pun.",
  },
  {
    icon: Heart,
    title: "Fokus drama China",
    text: "Hanya drama Mandarin pilihan dan mini series. Tanpa konten lain yang mengganggu pengalaman menonton kamu.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Apakah CinemaStream gratis?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ya, sepenuhnya gratis. Semua drama diputar lewat embed YouTube tanpa biaya berlangganan dan tanpa perlu akun.",
      },
    },
    {
      "@type": "Question",
      name: "Bagaimana judul Mandarin bisa muncul dalam Bahasa Indonesia?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sistem kami otomatis mendeteksi judul Mandarin dan menerjemahkannya ke Bahasa Indonesia menggunakan AI penerjemah, lalu menyimpan hasilnya supaya kunjungan berikutnya tampil instan.",
      },
    },
    {
      "@type": "Question",
      name: "Bagaimana cara menambah drama baru?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Buka halaman Admin, tempel handle channel YouTube (@nama_channel) atau URL channel-nya, lalu klik Tambah Channel. Episode-episodenya akan otomatis muncul di halaman Drama.",
      },
    },
    {
      "@type": "Question",
      name: "Apakah video disimpan di server CinemaStream?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tidak. Semua video tetap berada di YouTube dan hanya di-embed oleh CinemaStream. Hak cipta tetap milik kreator masing-masing.",
      },
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <Seo
        title="Tentang CinemaStream"
        description="CinemaStream adalah situs nonton drama China dan mini series Mandarin dengan judul Bahasa Indonesia, update otomatis dari channel YouTube pilihan."
        path="/about"
        keywords={[
          "tentang cinemastream",
          "situs drama china",
          "drama china sub indo",
          "drama mandarin terjemahan indonesia",
        ]}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Beranda", item: "/" },
              { "@type": "ListItem", position: 2, name: "Tentang", item: "/about" },
            ],
          },
          faqJsonLd,
        ]}
      />

      <section className="pt-32 sm:pt-44 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-sm font-mono uppercase tracking-widest text-primary mb-4">
              Tentang
            </p>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl tracking-tight text-balance leading-[1.05]">
              Drama China, lebih mudah dinikmati.
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-foreground/80 leading-relaxed text-balance">
              CinemaStream dibuat untuk pencinta drama China di Indonesia.
              Daripada harus menebak arti judul Mandarin atau mencari satu per
              satu di YouTube, kami merangkum drama dari channel pilihan,
              menerjemahkan judulnya ke Bahasa Indonesia, dan menampilkannya
              dalam tampilan yang bersih dan nyaman ditonton.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="rounded-2xl border border-card-border bg-card p-7"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5">
                  <v.icon className="h-5 w-5" />
                </div>
                <h2 className="font-serif text-xl tracking-tight mb-2">
                  {v.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {v.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-12">
          <h2 className="font-serif text-3xl tracking-tight mb-8">
            Pertanyaan yang sering diajukan
          </h2>
          <div className="space-y-6">
            {faqJsonLd.mainEntity.map((q) => (
              <div
                key={q.name}
                className="rounded-xl border border-border/60 bg-card/40 p-6"
              >
                <h3 className="font-medium text-lg mb-2">{q.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {q.acceptedAnswer.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-12 text-center">
          <Link href="/drama" data-testid="link-about-browse">
            <Button
              size="lg"
              className="rounded-full px-8 h-12 text-base font-semibold"
            >
              Mulai Nonton
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
