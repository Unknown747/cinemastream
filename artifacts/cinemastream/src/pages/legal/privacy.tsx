import { Seo } from "@/components/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";

const LAST_UPDATED = "27 April 2026";

export default function PrivacyPage() {
  return (
    <>
      <Seo
        title="Kebijakan Privasi"
        description="Kebijakan privasi CinemaStream — bagaimana kami menangani data pengunjung, cookie, iklan pihak ketiga, dan layanan analitik."
        path="/privacy"
      />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-28 pb-20 prose prose-invert">
        <Breadcrumbs
          items={[
            { label: "Beranda", href: "/" },
            { label: "Kebijakan Privasi" },
          ]}
          className="mb-6"
        />
        <p className="text-sm text-foreground/60">
          Terakhir diperbarui: {LAST_UPDATED}
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl tracking-tight mt-3 mb-8">
          Kebijakan Privasi
        </h1>

        <div className="space-y-6 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="font-serif text-2xl mt-8 mb-3 text-foreground">
              Ringkasan
            </h2>
            <p>
              CinemaStream adalah situs agregator drama China yang menampilkan
              video di-embed dari YouTube. Kami menghormati privasi Anda dan
              tidak meminta Anda mendaftar akun atau memberikan informasi
              pribadi untuk menonton.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl mt-8 mb-3 text-foreground">
              Data yang kami kumpulkan
            </h2>
            <p>
              Server kami secara otomatis mencatat informasi standar yang
              dikirim browser Anda saat mengakses situs: alamat IP, jenis
              browser, waktu kunjungan, dan halaman yang dibuka. Data ini
              digunakan hanya untuk keperluan keamanan dan diagnostik server.
            </p>
            <p>
              Kami tidak menjual atau membagikan data ini kepada pihak ketiga
              kecuali diwajibkan oleh hukum.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl mt-8 mb-3 text-foreground">
              Cookie & layanan pihak ketiga
            </h2>
            <p>
              CinemaStream menggunakan beberapa layanan pihak ketiga yang dapat
              menempatkan cookie pada browser Anda:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>YouTube</strong> — pemutar video di-embed dari YouTube.
                YouTube dapat menempatkan cookie sesuai{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Kebijakan Privasi Google
                </a>
                .
              </li>
              <li>
                <strong>Google AdSense</strong> — iklan ditampilkan oleh Google
                AdSense. Google dapat menggunakan cookie iklan untuk
                menayangkan iklan berdasarkan kunjungan Anda ke situs ini dan
                situs lain di Internet. Anda dapat menonaktifkan iklan
                personalisasi melalui{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Pengaturan Iklan Google
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl mt-8 mb-3 text-foreground">
              Konten dari pihak ketiga
            </h2>
            <p>
              Semua video yang Anda lihat di CinemaStream ditampilkan melalui
              embed resmi YouTube. Kami tidak menyimpan, mengunggah ulang, atau
              memodifikasi konten video. Hak cipta dan tanggung jawab penuh
              atas konten video berada di tangan kreator asal masing-masing.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl mt-8 mb-3 text-foreground">
              Hak Anda
            </h2>
            <p>
              Anda berhak meminta penjelasan, koreksi, atau penghapusan data
              yang kami simpan tentang Anda. Hubungi kami di halaman{" "}
              <a href="/contact" className="text-primary hover:underline">
                Kontak
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl mt-8 mb-3 text-foreground">
              Perubahan kebijakan
            </h2>
            <p>
              Kebijakan ini dapat diperbarui sewaktu-waktu. Tanggal pembaruan
              terakhir tercantum di bagian atas halaman ini.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
