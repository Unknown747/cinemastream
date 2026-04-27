import { Seo } from "@/components/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function DmcaPage() {
  return (
    <>
      <Seo
        title="Kebijakan DMCA & Pengaduan Hak Cipta"
        description="Kebijakan DMCA CinemaStream — cara melaporkan video yang melanggar hak cipta agar dihapus dari halaman kami."
        path="/dmca"
      />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <Breadcrumbs
          items={[
            { label: "Beranda", href: "/" },
            { label: "DMCA" },
          ]}
          className="mb-6"
        />
        <h1 className="font-serif text-4xl sm:text-5xl tracking-tight mt-3 mb-6">
          Kebijakan DMCA
        </h1>

        <div className="space-y-6 text-foreground/80 leading-relaxed">
          <section>
            <p>
              CinemaStream menghormati hak kekayaan intelektual. Semua video
              ditampilkan melalui embed resmi YouTube — kami tidak menyimpan
              atau menyajikan ulang file video apa pun. Untuk menghapus video
              dari sumber asalnya, silakan ajukan{" "}
              <a
                href="https://www.youtube.com/copyright_complaint_form"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                klaim DMCA langsung ke YouTube
              </a>
              . Setelah video dihapus dari YouTube, otomatis tidak akan tampil
              lagi di CinemaStream.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl mt-8 mb-3 text-foreground">
              Permintaan penghapusan dari halaman kami
            </h2>
            <p>
              Jika Anda pemegang hak dan ingin video tertentu tidak ditampilkan
              di halaman CinemaStream (meskipun masih tersedia di YouTube),
              kirim permintaan tertulis melalui halaman{" "}
              <a href="/contact" className="text-primary hover:underline">
                Kontak
              </a>{" "}
              berisi:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              <li>Nama, alamat, dan kontak Anda yang bisa dihubungi</li>
              <li>URL halaman CinemaStream yang ingin dihapus</li>
              <li>URL video YouTube terkait</li>
              <li>
                Pernyataan bahwa Anda adalah pemegang hak atau diberi kuasa
                untuk bertindak atas nama pemegang hak
              </li>
              <li>
                Tanda tangan elektronik (cukup nama lengkap di bagian akhir
                surat)
              </li>
            </ul>
            <p className="mt-3">
              Kami akan meninjau dan memproses permintaan dalam 7×24 jam kerja.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl mt-8 mb-3 text-foreground">
              Klaim balik
            </h2>
            <p>
              Jika Anda yakin video Anda dihapus karena kesalahan, Anda dapat
              mengirim klaim balik melalui halaman Kontak dengan mencantumkan
              alasan dan bukti kepemilikan.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
