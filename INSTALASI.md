# Panduan Instalasi CinemaStream

Dokumen ini berisi dua cara menjalankan CinemaStream untuk latihan dan ujicoba:
1. **VPS** (Ubuntu / Debian) — untuk deploy production atau staging.
2. **XAMPP** (Windows / macOS / Linux) — untuk latihan & ujicoba lokal.

CinemaStream adalah aplikasi **Node.js + React + PostgreSQL**, jadi XAMPP di sini
dipakai sebagai *reverse proxy* (Apache) untuk meneruskan request ke Node, bukan
sebagai server PHP.

---

## Bagian 1 — Instalasi di VPS (Ubuntu 22.04 / 24.04)

### 1.1 Persyaratan
- VPS minimal 1 vCPU, 1 GB RAM, 10 GB disk.
- Akses SSH sebagai user `root` atau user dengan `sudo`.
- Domain (opsional, untuk HTTPS).

### 1.2 Update sistem & paket dasar
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential ca-certificates ufw
```

### 1.3 Install Node.js 20 + pnpm
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pnpm@10 pm2
node -v && pnpm -v
```

### 1.4 Install PostgreSQL 16
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

Buat database dan user:
```bash
sudo -u postgres psql <<'SQL'
CREATE USER cinemastream WITH PASSWORD 'GANTI_PASSWORD_KUAT';
CREATE DATABASE cinemastream OWNER cinemastream;
GRANT ALL PRIVILEGES ON DATABASE cinemastream TO cinemastream;
SQL
```

### 1.5 Clone & install proyek
```bash
sudo mkdir -p /var/www && cd /var/www
sudo git clone <URL_REPO_ANDA> cinemastream
sudo chown -R $USER:$USER cinemastream
cd cinemastream
pnpm install --frozen-lockfile
```

### 1.6 Konfigurasi environment
Buat file `.env` di root proyek:
```bash
cat > .env <<'EOF'
DATABASE_URL=postgresql://cinemastream:GANTI_PASSWORD_KUAT@localhost:5432/cinemastream
SESSION_SECRET=$(openssl rand -hex 32)
ADMIN_PASSWORD=ganti-password-admin
# AI translation (opsional — biarkan kosong jika tidak pakai):
# AI_INTEGRATIONS_OPENAI_BASE_URL=
# AI_INTEGRATIONS_OPENAI_API_KEY=
EOF
```

> Catatan: `AI_INTEGRATIONS_OPENAI_*` di-provision otomatis di Replit. Di luar
> Replit, isi dengan kredensial OpenAI Anda sendiri jika ingin fitur
> auto-translate aktif.

### 1.7 Push schema database & build
```bash
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/cinemastream run build
```

### 1.8 Jalankan dengan PM2
```bash
# Backend API (port 3001)
PORT=3001 pm2 start "pnpm --filter @workspace/api-server run start" \
  --name cinemastream-api

# Frontend statis disajikan oleh Nginx (lihat 1.9), atau jalankan vite preview:
PORT=3000 pm2 start "pnpm --filter @workspace/cinemastream run preview -- --host 0.0.0.0 --port 3000" \
  --name cinemastream-web

pm2 save
pm2 startup    # ikuti instruksi yang muncul agar auto-start saat reboot
```

### 1.9 Pasang Nginx sebagai reverse proxy
```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/cinemastream
```

Isi dengan:
```nginx
server {
    listen 80;
    server_name domainanda.com;

    # Frontend (build statis)
    root /var/www/cinemastream/artifacts/cinemastream/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan & reload:
```bash
sudo ln -sf /etc/nginx/sites-available/cinemastream /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 1.10 Firewall & HTTPS
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# HTTPS gratis dari Let's Encrypt:
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d domainanda.com
```

### 1.11 Update aplikasi
```bash
cd /var/www/cinemastream
git pull
pnpm install --frozen-lockfile
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/cinemastream run build
pm2 restart cinemastream-api
sudo systemctl reload nginx
```

---

## Bagian 2 — Latihan Lokal dengan XAMPP

XAMPP cocok untuk **belajar konfigurasi web server**. Karena CinemaStream pakai
Node.js (bukan PHP), Apache di XAMPP dipakai untuk *reverse proxy* ke Node.

### 2.1 Install XAMPP
1. Download dari <https://www.apachefriends.org>.
2. Install (Windows: "Run as Administrator"; macOS: drag ke Applications).
3. Buka **XAMPP Control Panel** → start **Apache**.

### 2.2 Install Node.js & PostgreSQL terpisah
XAMPP **tidak menyediakan** Node.js atau PostgreSQL, install manual:

- **Node.js 20**: <https://nodejs.org> (pilih LTS).
- **pnpm**: setelah Node terinstall, jalankan di terminal:
  ```bash
  npm install -g pnpm@10
  ```
- **PostgreSQL 16**: <https://www.postgresql.org/download/>
  (saat instalasi, ingat user/password `postgres`).

> Catatan: XAMPP punya MariaDB, tapi proyek ini pakai PostgreSQL. Jangan pakai
> MariaDB untuk proyek ini.

### 2.3 Siapkan database
Buka **pgAdmin** (terinstall bareng PostgreSQL) atau terminal:
```sql
CREATE USER cinemastream WITH PASSWORD 'cinemastream';
CREATE DATABASE cinemastream OWNER cinemastream;
```

### 2.4 Clone & setup proyek
Di terminal (PowerShell / Bash):
```bash
git clone <URL_REPO_ANDA> cinemastream
cd cinemastream
pnpm install
```

Buat file `.env`:
```env
DATABASE_URL=postgresql://cinemastream:cinemastream@localhost:5432/cinemastream
SESSION_SECRET=ujicoba-rahasia-lokal
ADMIN_PASSWORD=admin123
```

Push schema:
```bash
pnpm --filter @workspace/db run push
```

### 2.5 Jalankan aplikasi (development)
Buka **dua terminal**:

Terminal 1 — backend:
```bash
PORT=3001 pnpm --filter @workspace/api-server run dev
```

Terminal 2 — frontend:
```bash
PORT=3000 pnpm --filter @workspace/cinemastream run dev
```

Buka <http://localhost:3000>.

### 2.6 (Opsional) Konfigurasi Apache XAMPP sebagai proxy
Agar bisa diakses lewat <http://cinemastream.local> (rasanya seperti di server
sungguhan), aktifkan modul proxy Apache.

Edit `xampp/apache/conf/httpd.conf`, hilangkan `#` di baris berikut:
```apache
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule rewrite_module modules/mod_rewrite.so
```

Tambahkan virtual host di `xampp/apache/conf/extra/httpd-vhosts.conf`:
```apache
<VirtualHost *:80>
    ServerName cinemastream.local

    ProxyPreserveHost On
    ProxyPass /api/ http://127.0.0.1:3001/api/
    ProxyPassReverse /api/ http://127.0.0.1:3001/api/

    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>
```

Tambah baris di file `hosts`:
- Windows: `C:\Windows\System32\drivers\etc\hosts`
- macOS / Linux: `/etc/hosts`
```
127.0.0.1   cinemastream.local
```

Restart Apache lewat XAMPP Control Panel, lalu buka
<http://cinemastream.local>.

---

## Troubleshooting cepat

| Masalah | Penyebab umum | Solusi |
|---|---|---|
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL belum jalan | `sudo systemctl start postgresql` (Linux) atau buka XAMPP/pgAdmin dan start service |
| `Port 3000 already in use` | Aplikasi lain pakai port | Ganti `PORT=3010` di env atau matikan aplikasi lain |
| Halaman putih setelah build | Path asset salah | Pastikan menjalankan `vite preview` dari folder build, atau Nginx `root` benar |
| `403 Forbidden` di `/api/` | Apache modul proxy belum aktif | Aktifkan `mod_proxy` & `mod_proxy_http`, restart Apache |
| AI translate "service unavailable" | Env AI kosong di luar Replit | Isi `AI_INTEGRATIONS_OPENAI_*` atau abaikan fitur ini |

---

## Ringkasan port default

| Layanan | Port |
|---|---|
| Frontend (Vite) | 3000 |
| Backend (Express) | 3001 |
| PostgreSQL | 5432 |
| Apache (XAMPP) | 80 |
| Nginx (VPS) | 80 / 443 |
