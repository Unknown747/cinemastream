# Deploy CinemaStream ke VPS

Panduan ringkas untuk deploy CinemaStream di VPS sendiri (Ubuntu/Debian).
Catatan: kalau Anda deploy via Replit Deployments, semua step ini tidak perlu — tinggal klik **Publish**.

---

## 1. Prasyarat di VPS

- Node.js **20+** dan `pnpm` (`npm i -g pnpm`)
- PostgreSQL 14+ (lokal di VPS atau eksternal: Neon / Supabase / Railway)
- Nginx (untuk reverse proxy + HTTPS)
- (Opsional) `pm2` atau `systemd` untuk auto-restart

---

## 2. Clone & install

```bash
git clone <repo-url> cinemastream
cd cinemastream
pnpm install
```

---

## 3. Setup environment variables

Salin contoh, lalu edit:

```bash
cp .env.example .env
nano .env
```

Yang **wajib** diisi:

| Variable | Untuk apa |
| --- | --- |
| `DATABASE_URL` | Koneksi PostgreSQL |
| `ADMIN_PASSWORD` | Login halaman `/admin` |
| `SESSION_SECRET` | Cookie signing (random ≥32 char) |
| `COOKIE_SECRET` | Cookie signing (random ≥32 char) |
| `SITE_URL` | URL publik (untuk sitemap/SEO) |
| `CORS_ORIGIN` | Domain frontend yang boleh hit API |

Generate secret cepat:

```bash
openssl rand -base64 48
```

### Pilihan provider AI (untuk auto-translate Mandarin → Indonesia)

Set 3 variabel ini sesuai provider yang Anda pakai:

| Provider | `AI_INTEGRATIONS_OPENAI_BASE_URL` | `AI_MODEL` | Catatan |
| --- | --- | --- | --- |
| **OpenAI** | `https://api.openai.com/v1` | `gpt-4o-mini` | Paling stabil, $0.15 / 1M token input |
| **DeepSeek** | `https://api.deepseek.com/v1` | `deepseek-chat` | Paling murah, bagus utk Mandarin |
| **Groq** | `https://api.groq.com/openai/v1` | `llama-3.1-70b-versatile` | Tier gratis lumayan, sangat cepat |
| **OpenRouter** | `https://openrouter.ai/api/v1` | bebas (cek katalog) | Bisa pilih banyak model |
| **Ollama lokal** | `http://localhost:11434/v1` | `llama3.1` | Gratis, tapi VPS butuh GPU/RAM besar |

`AI_INTEGRATIONS_OPENAI_API_KEY` = API key dari provider yang dipilih.

> Kalau 3 variabel AI di atas dikosongkan, fitur translate **otomatis dinonaktifkan** (tidak crash). Judul/sinopsis akan tampil apa adanya dari YouTube.

---

## 4. Push schema database

```bash
pnpm --filter @workspace/db run push
```

---

## 5. Build

```bash
# Frontend (hasil di artifacts/cinemastream/dist)
pnpm --filter @workspace/cinemastream run build

# API server (hasil di artifacts/api-server/dist)
pnpm --filter @workspace/api-server run build
```

> Variabel `VITE_*` (AdSense) harus diset **sebelum** build frontend, karena di-inline ke bundle JavaScript.

---

## 6. Jalankan API server (production)

Gunakan systemd:

```ini
# /etc/systemd/system/cinemastream-api.service
[Unit]
Description=CinemaStream API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/cinemastream
EnvironmentFile=/var/www/cinemastream/.env
ExecStart=/usr/bin/node artifacts/api-server/dist/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now cinemastream-api
sudo systemctl status cinemastream-api
```

Atau dengan pm2:

```bash
pm2 start artifacts/api-server/dist/index.js --name cinemastream-api
pm2 save && pm2 startup
```

---

## 7. Nginx reverse proxy + serve frontend

```nginx
# /etc/nginx/sites-available/cinemastream
server {
    listen 80;
    server_name cinemastream.id www.cinemastream.id;

    # Frontend statis (hasil vite build)
    root /var/www/cinemastream/artifacts/cinemastream/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets (vite menambahkan hash ke filename)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/cinemastream /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

HTTPS gratis dengan Let's Encrypt:

```bash
sudo certbot --nginx -d cinemastream.id -d www.cinemastream.id
```

---

## 8. Update / deploy ulang

```bash
cd /var/www/cinemastream
git pull
pnpm install
pnpm --filter @workspace/db run push       # kalau ada migrasi schema
pnpm --filter @workspace/cinemastream run build
pnpm --filter @workspace/api-server run build
sudo systemctl restart cinemastream-api
```

---

## Cheat-sheet env vars (singkat)

```env
# Wajib
DATABASE_URL=postgresql://...
ADMIN_PASSWORD=...
SESSION_SECRET=...   # openssl rand -base64 48
COOKIE_SECRET=...    # openssl rand -base64 48
SITE_URL=https://cinemastream.id
CORS_ORIGIN=https://cinemastream.id

# AI (opsional, tapi judul Mandarin tidak akan ditranslate kalau kosong)
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini

# Server (opsional)
PORT=8080
NODE_ENV=production
LOG_LEVEL=info

# AdSense (opsional, set SEBELUM build frontend)
VITE_ADSENSE_CLIENT=ca-pub-...
VITE_ADSENSE_SLOT_HOME_TOP=...
```
