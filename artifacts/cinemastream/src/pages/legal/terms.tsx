import { Seo } from "@/components/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";

const LAST_UPDATED = "27 April 2026";

export default function TermsPage() {
  return (
    <>
      <Seo
        title="Syarat & Ketentuan"
        description="Syarat dan ketentuan penggunaan situs CinemaStream — agregator drama China dengan judul Bahasa Indonesia."
        path="/terms"
      />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <Breadcrumbs
          items={[
            { label: "Beranda", href: "/" },
            { label: "Syarat & Ketentuan" },
          ]}
          className="mb-6"
        />
        <p className="text-sm text-foreground/60">
          Terakhir diperbarui: {LAST_UPDATED}
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl tracking-tight mt-3 mb-8">
          Syarat & Ketentuan
        </h1>

        <div className="space-y-6 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="font-serif text-2xl mt-8 mb-3 text-foreground">
              Penerimaan ketentuan
            </h2>
            <p>
              Dengan mengakses dan menggunakan CinemaStream, Anda menyetujui
              syarat dan ketentuan ini. Jika Anda tidak setuju, mohon tidak
              menggunakan situs ini.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl mt-8 mb-3 text-foreground">
              Sifat layanan
            </h2>
            <p>
              CinemaStream adalah agregator yang menampilkan video drama China
              dari YouTube melalui pemutar embed resmi. Kami tidak menyimpan
              file video, tidak mengunggah ulang konten, dan tidak mengklaim
              kepemilikan atas video apa pun. Semua video tetap berada di
              YouTube dan diatur oleh{" "}
              <a
                href="https://www.youtube.com/t/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Persyaratan Layanan YouTube
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl mt-8 mb-3 text-foreground">
              Terjemahan judul
            </h2>
            <p>
              Judul Mandarin pada video diterjemahkan secara otomatis ke
              Bahasa Indonesia menggunakan AI sebagai layanan kemudahan bagi
              penonton Indonesia. Terjemahan bersifat indikatif dan dapat
              berbeda dari judul resmi yang diberikan kreator. Judul asli
              selalu tersedia melalui tautan YouTube di setiap halaman drama.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl mt-8 mb-3 text-foreground">
              Hak cipta
            </h2>
            <p>
              Hak cipta atas video sepenuhnya milik kreator dan/atau pemegang
              hak masing-masing. Jika Anda adalah pemegang hak dan ingin
              video tertentu tidak ditampilkan di CinemaStream, silakan hubungi
              kami melalui halaman{" "}
              <a href="/dmca" className="text-primary hover:underline">
                DMCA
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl mt-8 mb-3 text-foreground">
              Batasan tanggung jawab
            </h2>
            <p>
              CinemaStream disediakan "sebagaimana adanya" tanpa jaminan
              apapun. Kami tidak bertanggung jawab atas: ketersediaan video di
              YouTube, akurasi terjemahan, kerusakan akibat penggunaan situs,
              atau konten dari pihak ketiga termasuk iklan.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl mt-8 mb-3 text-foreground">
              Penggunaan yang dilarang
            </h2>
            <p>
              Anda dilarang menggunakan situs ini untuk: menyebarluaskan
              konten ilegal, mengganggu operasional situs, mengumpulkan data
              pengguna lain, atau melakukan scraping otomatis.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
