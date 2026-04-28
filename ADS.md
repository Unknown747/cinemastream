# Panduan Lengkap Iklan & Earning — CinemaStream

Dokumen ini berisi:
1. Cara setup AdSense end-to-end di CinemaStream
2. Semua slot & format iklan yang sudah didukung kode
3. Strategi maksimalkan RPM (revenue per mille / 1000 impression)
4. Network alternatif kalau AdSense ditolak
5. Hal yang harus dihindari supaya tidak kena banned
6. Metrik yang harus dipantau

> **TL;DR cara terapkan**: setelah AdSense disetujui, isi `VITE_ADSENSE_CLIENT` + 6 slot ID di `.env`, set `VITE_ADSENSE_AUTO_ADS=true`, lalu rebuild frontend. Semua sudah dipasang di kode.

---

## 1. Apply AdSense (langkah-demi-langkah)

### Syarat dasar sebelum apply
| Syarat | Status di project ini |
| --- | --- |
| Domain custom (bukan .replit.app / vercel.app / blogspot) | ⚠️ Anda yang siapkan |
| Minimal 15-20 halaman konten | ✅ Otomatis tergenerate dari channel |
| Halaman About, Contact, Privacy, Terms, DMCA | ✅ sudah ada di `/about`, `/contact`, dll |
| `ads.txt` | ✅ ada di `public/ads.txt` (tinggal isi pub-id) |
| Trafik organik konsisten (≥50 visit/hari) | ⚠️ Bangun dulu sebelum apply |
| Konten orisinal (tidak full reupload) | ✅ judul + sinopsis ditranslate AI = unik |
| HTTPS | ✅ via certbot di nginx |
| Mobile-friendly | ✅ design responsive |
| Site map + indexed di Google | ⚠️ submit manual di Search Console |

### Step apply
1. Buka https://www.google.com/adsense/start/
2. Pilih region: **Indonesia**, mata uang: **IDR** (atau USD, lebih sering dibayar Wise)
3. Verifikasi alamat (kartu pos akan dikirim setelah saldo $10)
4. Tambah situs Anda → AdSense kasih kode `<script>` 
5. Salin **publisher ID** (`ca-pub-XXXXXXXXXXXXXXXX`)
6. Edit `public/ads.txt`:
   ```
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
7. Set di `.env`:
   ```
   VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
   VITE_ADSENSE_AUTO_ADS=true
   ```
8. Rebuild frontend (`pnpm --filter @workspace/cinemastream build`)
9. Submit "Site for review" di AdSense dashboard

Review biasanya 1-14 hari. Kalau ditolak alasan paling umum: konten kurang, traffic rendah, navigasi membingungkan, atau halaman legal kurang lengkap (cek bagian "Hindari ban" di bawah).

---

## 2. Semua slot iklan yang sudah dipasang di kode

| Variable env | Posisi tampil | Format yang disarankan di AdSense | Komentar |
| --- | --- | --- | --- |
| `VITE_ADSENSE_CLIENT` | global | — | Publisher ID Anda |
| `VITE_ADSENSE_AUTO_ADS` | global | — | `true` = aktifkan Auto Ads |
| `VITE_ADSENSE_SLOT_HOME_TOP` | Beranda — di atas grid Tontonan Terbaru | **Display – Responsive** | Banner besar, viewport mobile pertama |
| `VITE_ADSENSE_SLOT_IN_ARTICLE` | Halaman drama (di antara player & related) + Beranda mid | **In-article** | RPM tinggi, native feel |
| `VITE_ADSENSE_SLOT_SIDEBAR` | Halaman drama detail (sidebar kanan / bawah mobile) | **Display – Responsive** | Kolom samping |
| `VITE_ADSENSE_SLOT_CHANNEL_BOTTOM` | Halaman channel — bawah grid | **Display – Responsive** | Tail of long page |
| `VITE_ADSENSE_SLOT_BLOG_BOTTOM` | Halaman list artikel — bawah | **Display – Responsive** | Footer area |
| `VITE_ADSENSE_SLOT_STICKY_BOTTOM` | **Sticky di bawah layar (semua halaman, kecuali /admin & /dmca)** | **Display – Responsive** atau Anchor | **Format paling profit untuk mobile.** Ada tombol close ✕ |

### Cara bikin Slot ID di AdSense Dashboard
1. Login dashboard → **Ads → By ad unit → Display ads**
2. Klik "+" → kasih nama (mis. `home-top`, `sticky-bottom`)
3. Pilih ukuran: **Responsive** (auto adjust)
4. Klik Create → AdSense kasih snippet, ambil bagian `data-ad-slot="1234567890"`
5. Tempel angka itu ke env var yang sesuai
6. **TIDAK PERLU** copy-paste seluruh `<script>` snippet — kode CinemaStream sudah otomatis load AdSense library sekali saja

---

## 3. Auto Ads (penting!)

Auto Ads = Google scan halaman Anda otomatis dan pasang iklan di tempat yang paling profitable (banyak posisi yang manusia tidak terpikir, mis. anchor ads, vignette ads, in-feed di antara grid).

**Sangat disarankan dipakai bersamaan dengan slot manual.**

### Mengaktifkan
1. AdSense Dashboard → **Ads → By site → Edit**
2. Toggle **"Auto ads"** ke ON
3. Pilih format yang diizinkan:
   - ✅ **Display ads** (banner)
   - ✅ **In-page ads**
   - ✅ **Anchor ads** (sticky bawah — penting!)
   - ✅ **In-article ads**
   - ⚠️ **Vignette ads** (full-screen interstitial) — RPM tinggi tapi ganggu UX, opsional
   - ❌ Hindari **Page-level mobile interstitial** untuk konten — mengganggu video play
4. Set di env:
   ```
   VITE_ADSENSE_AUTO_ADS=true
   ```
5. Rebuild

> Auto Ads naikkan revenue **20-40%** rata-rata, tanpa code tambahan.

---

## 4. Strategi maksimalkan RPM

RPM = pendapatan per 1000 view. Indonesia umumnya $0.5-3 untuk konten hiburan. Cara naikkin:

### A. Format viewable yang tinggi
- **Above the fold ad** — slot pertama yang langsung kelihatan di mobile = `VITE_ADSENSE_SLOT_HOME_TOP`. Pastikan tinggi minimum 250px supaya viewable rate >70%.
- **Sticky bottom** — viewable rate hampir 100%, RPM 2-4× banner biasa.
- **In-article** — di antara konten artikel/sinopsis, dianggap "native", CTR 2× display.

### B. Kepadatan iklan (jangan terlalu sedikit)
Aturan empiris untuk drama/streaming site:
- 1 iklan **above the fold**
- 1 iklan **per 600px scroll** (mobile)
- 1 sticky anchor **selalu kelihatan**
- Total: 4-6 iklan di halaman ~1500px scroll

Jangan terlalu jarang (revenue rendah) atau terlalu rapat (banned + UX hancur).

### C. Lazy load YouTube embed
Kode CinemaStream pakai `youtube-nocookie.com` + facade thumbnail (lihat `streaming-player.tsx`). Pertahankan ini — kalau iframe YouTube langsung di-load, page weight naik 700KB+ → Largest Contentful Paint lambat → Google turunkan ranking → traffic turun.

### D. Ad refresh untuk sticky (opsional, advanced)
Refresh sticky ad tiap 30 detik kalau user diam. Belum diimplementasi karena rawan dianggap invalid traffic. Kalau mau, baca:
- https://support.google.com/adsense/answer/9189957 (refresh policy resmi AdSense)
- Hanya refresh saat ad keluar viewport lalu masuk lagi (intersection observer)

### E. Cek "Page RPM" per URL di AdSense dashboard
- **Performance → Sites/URL channels** — set channel per kategori halaman
- URL channel example: `*/film/*`, `*/blog/*`, `/`
- Page yang RPM rendah = optimize ad position di sana
- Page yang RPM tinggi = perbanyak content/promosi traffic ke pattern itu

### F. Geo-targeting
RPM beda per negara: US/UK/AU bisa 5-10× Indonesia. Kalau bisa narik traffic dari diaspora Indonesia di luar negeri (komunitas FB Indonesia di Singapura/Australia), itu bonus.

---

## 5. Network alternatif (kalau AdSense ditolak / sebagai 2nd layer)

| Network | Approve | RPM (ID) | Format kuat | Catatan |
| --- | --- | --- | --- | --- |
| **AdSense** | Susah, butuh quality | $0.5-3 | Display, in-article, anchor | Standard emas |
| **Adsterra** | Cepat (1 hari) | $0.3-1.5 | Popunder, native, push | Cocok 2nd layer, nggak rewel konten |
| **PropellerAds** | Cepat | $0.3-1 | Push notif, in-page push, popunder | Push notif paling kuat |
| **HilltopAds** | Cepat | $0.4-1.2 | Pop, native, video | Fokus traffic streaming |
| **Galaksion** | Sedang | $0.5-1.5 | Direct link, social bar | Bagus untuk Asia |
| **Ezoic** | Butuh ≥10rb pageview/bln | $1-4 | All formats + AI optimize | Hybrid dengan AdSense, RPM naik 30-50% |
| **Mediavine** | Butuh ≥50rb sesi/bln | $2-8 | Premium video player | Standard premium publisher |
| **Raptive (AdThrive)** | Butuh ≥100rb/bln | $3-12 | Premium | Sulit qualify |

### Strategi hybrid yang umum
- **Primary**: AdSense (Display + Auto Ads + Sticky Anchor)
- **Secondary**: Adsterra **1 popunder** (max 1 popunder/sesi, jangan lebih)
- **Push notif**: PropellerAds atau OneSignal
- **Direct link**: Adsterra Direct Link untuk button "Download" palsu (kontroversial, hindari kalau ingin AdSense aman)

> ⚠️ JANGAN pasang **popunder dari banyak network** sekaligus — UX buruk dan AdSense bisa banned karena dianggap "bad user experience".

---

## 6. Push Notification = revenue gratis

Push notif dijual berdasarkan jumlah subscriber. Setelah ada 10rb subscriber Indonesia, network bayar $0.5-2 per 1000 push delivered.

### Cara setup PropellerAds Push (paling mudah)
1. Daftar https://propellerads.com → verifikasi situs
2. Pilih **Push Notifications** → ambil snippet kode
3. Tempel sebelum `</body>` di `index.html`
4. Selesai — visitor akan dapat prompt "Allow notification?"
5. Earning otomatis masuk

### Atau pakai OneSignal (lebih kontrol)
- Anda owner subscriber, bisa kirim notif sendiri ("Episode baru!") + monetize via partner network
- Setup di https://onesignal.com → ambil app ID → tambah SDK web

> Tip: prompt "Allow notification" baru muncul **setelah user nonton 1 video** (bukan langsung saat masuk situs) supaya conversion 3-5× lebih tinggi.

---

## 7. Affiliate yang nyambung untuk drama China

Audience drama China = mostly cewek Indonesia 18-40, suka skincare/fashion/novel.

| Program | Komisi | Cara pasang |
| --- | --- | --- |
| **Shopee Affiliate** | 1.5-7% | Banner bawah player + widget "Skincare ala drama" |
| **Lazada Affiliate** | 4-12% | Sidebar produk fashion |
| **TikTok Shop Affiliate** | 5-15% | In-article banner |
| **Tokopedia Affiliate** | 1-7% | Footer atau widget |
| **Tiket.com / Klook** | 4-8% | "Paket tour ke China" di blog |
| **Viu / WeTV / iQiyi** | varies | "Episode tamat? lanjut nonton di Viu" |

Tempat tempel terbaik:
- **Bawah player** — user baru selesai nonton, mood beli tinggi
- **Akhir artikel blog** — review drama → "produk yg dipakai"
- **Sidebar drama detail**

---

## 8. SEO yang langsung dampak ke earning

Earning = traffic × RPM. Traffic dari SEO = paling sustainable.

### Quick wins
1. **Submit sitemap ke Google Search Console**
   - Sitemap URL: `https://yourdomain.com/sitemap.xml` & `/api/sitemap-drama.xml`
   - Tambah ke Search Console → Sitemaps → Submit
2. **Submit ke Bing Webmaster** (gratis, 5% extra traffic)
3. **Cek "Coverage" report** — pastikan semua halaman ter-index
4. **Title tag** per halaman ≤60 char, mengandung keyword utama (sudah otomatis di `seo.tsx`)
5. **Description** per halaman 150-160 char, ada call-to-action

### Keyword targeting drama China di Indonesia
Top keywords (cek di Google Trends ID):
- "drama china sub indo"
- "nonton drama china"
- "drama china terbaru"
- "drama china balas dendam"
- "drama china ceo tampan"
- "drama china istri pengganti"
- "mini drama china"
- "short drama mandarin"

Bikin halaman list per keyword. CinemaStream punya sistem **tag detection** (`detectTags` di `lib/video-meta.ts`) yang bisa dipakai untuk auto-grouping.

### Konten unik = bobot SEO tinggi
- ✅ Auto translate judul (sudah ada)
- ✅ Auto generate sinopsis 200+ kata (sudah ada via `generateIndonesianSynopsis`)
- ⏳ TODO: Auto generate artikel review per drama (1 artikel = 1 halaman index baru)
- ⏳ TODO: Page kategori (genre, tema, tahun) — auto-list video matching tag

### Site speed
AdSense aware terhadap speed. Pastikan:
- LCP <2.5s
- FID <100ms
- CLS <0.1

Cek: https://pagespeed.web.dev/?url=yourdomain.com

CinemaStream sudah optimal di sini (lazy load, preconnect, no extra CSS framework).

---

## 9. Hindari hal-hal yang bikin banned

### Pelanggaran AdSense umum (banned permanen kalau ketahuan)
- ❌ **Klik iklan sendiri** — pakai IP berbeda pun ketahuan via fingerprint
- ❌ **Minta orang klik** ("klik iklan untuk dukung situs ini" → instant ban)
- ❌ **Auto-click / bot click**
- ❌ **Pasang iklan di halaman tanpa konten** (404, login, kosong)
- ❌ **Iklan di halaman copyright violation** (situs bajakan film penuh)
- ❌ **Konten dewasa eksplisit**, judi, narkoba, senjata
- ❌ **Lebih dari 1 sticky anchor sekaligus** (max 1 di halaman)
- ❌ **Modal popup** yang menutup iklan
- ❌ **Iklan dalam frame** transparan / hidden

### Yang aman tapi sering disalah-paham
- ✅ Embed YouTube → aman karena yang share trafik adalah Google sendiri
- ✅ Translate judul/sinopsis dengan AI → konten dianggap orisinal
- ✅ Multiple ads per halaman → asal **rasio konten:iklan** masih ≥70:30
- ✅ Sticky bottom → resmi didukung AdSense (Anchor format)

### Sebelum apply, cek:
- ✅ Disclaimer YouTube ada di setiap halaman (sudah, di `YouTubeAttribution`)
- ✅ Footer disclaimer "kami tidak menyimpan file" (sudah, di `Footer`)
- ✅ Halaman DMCA berfungsi (sudah, `/dmca`)
- ✅ Privacy policy mention cookies + AdSense (cek `/privacy` mengandung kata "cookies" & "third party advertising")

---

## 10. Metrik yang harus dipantau (mingguan)

### Di AdSense Dashboard
| Metrik | Target sehat | Action kalau buruk |
| --- | --- | --- |
| **Page RPM** | ≥$1 untuk Indonesia | Tambah slot, aktifkan Auto Ads, naikkan kepadatan |
| **CTR** | 1-3% | Kalau <0.5% → posisi iklan kurang strategis |
| **Active View Viewable** | ≥70% | Kalau rendah → iklan terlalu di bawah, naikkan |
| **Coverage** | ≥95% | Kalau rendah → demand kurang, tambah Auto Ads |
| **Invalid Click Rate** | <10% | Kalau tinggi → traffic spam, audit source |

### Di Google Analytics / Search Console
| Metrik | Target | Action |
| --- | --- | --- |
| Sesi organik / hari | naik tiap minggu | Lihat "Konten machine" |
| Avg session duration | ≥2 menit | User watching = banyak ad impression |
| Pageviews per session | ≥2.5 | Internal linking + "Related videos" |
| Bounce rate | <60% | Page speed + UX |
| Top landing page | drama detail | Optimize halaman ini paling agresif |

---

## 11. Roadmap penerapan (urutan eksekusi)

### Minggu 1 — Fondasi
- [x] Mount sticky bottom anchor di App.tsx ✅
- [x] Auto Ads support via env var ✅
- [x] Single AdSense script load (bukan per-slot) ✅
- [ ] Daftar AdSense (manual oleh Anda)
- [ ] Beli domain custom + setup HTTPS
- [ ] Submit sitemap ke Search Console
- [ ] Tambah 10-20 channel drama populer

### Minggu 2-3 — Trafik
- [ ] Auto-generate review artikel per video (saya bisa bantu kode)
- [ ] Page kategori per tag/genre (auto-listing)
- [ ] Internal linking: "Drama serupa" widget di detail
- [ ] PWA install prompt

### Minggu 4 — Diversifikasi income
- [ ] Pasang Adsterra atau PropellerAds sebagai secondary
- [ ] OneSignal push notification
- [ ] Affiliate Shopee di footer
- [ ] Cek RPM per page channel di AdSense

### Bulan 2+ — Optimasi
- [ ] A/B test posisi sticky (top vs bottom)
- [ ] A/B test kepadatan iklan
- [ ] Cek qualify Ezoic (≥10rb pageview)
- [ ] Tambah komentar (Disqus) untuk session length

---

## 12. Cheat sheet env vars iklan

```env
# ===== AdSense =====
VITE_ADSENSE_CLIENT=ca-pub-1234567890123456
VITE_ADSENSE_AUTO_ADS=true

VITE_ADSENSE_SLOT_HOME_TOP=1111111111
VITE_ADSENSE_SLOT_IN_ARTICLE=2222222222
VITE_ADSENSE_SLOT_SIDEBAR=3333333333
VITE_ADSENSE_SLOT_CHANNEL_BOTTOM=4444444444
VITE_ADSENSE_SLOT_BLOG_BOTTOM=5555555555
VITE_ADSENSE_SLOT_STICKY_BOTTOM=6666666666
```

> **Penting**: variabel `VITE_*` di-inline saat build. Setiap kali ganti slot ID, harus **rebuild frontend** (`pnpm --filter @workspace/cinemastream build`) baru efeknya kelihatan.

---

## Referensi resmi

- AdSense Help: https://support.google.com/adsense
- Auto Ads Guide: https://support.google.com/adsense/answer/9261306
- Anchor Ads (sticky): https://support.google.com/adsense/answer/9011429
- ads.txt: https://support.google.com/adsense/answer/7532444
- Policy violations checklist: https://support.google.com/adsense/answer/48182
- Page Experience signals (SEO): https://developers.google.com/search/docs/appearance/page-experience

---

**Pertanyaan?** Buka issue atau diskusi — dokumen ini akan terus diperbarui seiring proyek tumbuh.
