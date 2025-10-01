# Manajemen Stok Bago

Sistem manajemen inventaris berbasis QR code untuk produk furnitur. Sistem ini memungkinkan pelacakan produk melalui kode QR unik di berbagai lokasi dengan pemantauan stok real-time.

## Fitur Utama

- **Sistem QR Code**: Generate dan scan kode QR unik untuk produk
- **Manajemen Produk**: Registrasi, pengeditan, dan pelacakan produk
- **Multiple Lokasi**: Lacak produk di TOKO, GUDANG KEPATHIAN, GUDANG NGUNUT
- **Dashboard Analitik**: Tren registrasi, distribusi stok, dan metrik pengguna
- **Manajemen Template**: Predefined kategori dan nama produk
- **Notifikasi Stok Rendah**: Peringatan otomatis saat stok menipis
- **Audit Trail**: Catatan lengkap semua aktivitas pengguna

## Teknologi yang Digunakan

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Autentikasi**: Session-based
- **QR Generation**: Built-in functionality

## Persyaratan Sistem

- Node.js dan npm
- Akses ke layanan Supabase

## Instalasi

### 1. Clone atau buat proyek
```bash
cd C:\Users\LENOVO\Documents\scripts\bago-stock
```

### 2. Instal dependensi
```bash
npm install
cd server && npm install
```

### 3. Konfigurasi Supabase
1. Buat akun di [supabase.com](https://supabase.com)
2. Buat proyek baru
3. Dapatkan kredensial Anda di `Settings` > `API`
4. Update file `server/.env` dengan kredensial Supabase Anda:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
```

### 4. Setup Database
1. Buka SQL Editor di dashboard Supabase
2. Jalankan skrip dari file `database_schema.sql` untuk membuat tabel

## Pengguna Default

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Manager | manager | manager123 |
| Staff | staff1 | staff123 |
| Staff | staff2 | staff123 |

## Struktur Proyek

```
bago-stock/
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── config/            # Configuration
│   ├── middleware/        # Express middleware
│   ├── package.json       # Backend dependencies
│   └── server.js          # Main server file
├── src/                   # React frontend source
│   ├── components/        # React components
│   ├── pages/             # React pages
│   ├── utils/             # Helper functions
│   └── contexts/          # React contexts
├── public/                # Public assets
├── database_schema.sql    # Skema database Supabase
├── SUPABASE_SETUP.md      # Panduan setup Supabase
├── .env                   # Konfigurasi lingkungan
├── package.json           # Frontend dependencies & scripts
└── server/.env            # Backend configuration
```

## API Endpoints

- `POST /api/auth` - Login/logout
- `GET /api/products` - Dapatkan daftar produk
- `POST /api/products` - Daftarkan produk baru
- `PUT /api/products` - Update produk
- `DELETE /api/products/:id` - Hapus produk
- `GET/POST /api/qr` - Generate kode QR
- `POST /api/scan` - Scan kode QR
- `GET/POST/PUT/DELETE /api/templates` - Manajemen template produk

## Jalankan Aplikasi

### Development
```bash
# Terminal 1: Run the backend server
npm run server:dev

# Terminal 2: Run the frontend development server
npm run dev
```

### Or run both simultaneously
```bash
npm run dev:full
```

## Production Build

### Quick Start (Recommended)
```bash
# For production deployment - single port
npm start

# For development
npm run dev:full
```

### Option 1: Separate Frontend & Backend (Development)
For development - Run frontend and backend separately:

1. Build the React frontend:
```bash
npm run build
```

2. Start the backend server:
```bash
npm run server
# Or development mode with nodemon:
npm run server:dev
```

### Option 2: Single Port Deployment (Production)
For production - Serve both frontend and backend from single port (recommended for Cloudflare Tunnel):

## Windows (Command Prompt/PowerShell):
```bash
# One command setup:
npm run production

# Or step-by-step:
npm run build
npm run production:win
```

## Linux/Mac:
```bash
# One command setup:
npm run production

# Or step-by-step:
npm run build
NODE_ENV=production npm run server
```

## What happens:
- ✅ Build React frontend into `dist/` folder
- ✅ Start Express server on port 5000
- ✅ Serve React app from Express for all non-API routes
- ✅ Handle API calls on `/api/*` routes
- ✅ Use Cloudflare Tunnel with only port 5000

## Cloudflare Tunnel Setup

### Single Port Deployment (Recommended)
For production, use the single-port deployment which serves both frontend and API from port 5000:

1. Configure your `.env` file:
```env
VITE_API_BASE_URL=/api
```

2. Build and start production server:
```bash
npm run production
```

3. Tunnel only port 5000:
```bash
cloudflared tunnel --url http://localhost:5000
```

### Development Setup (Multiple Ports)
If you prefer separate development servers:

1. Development with separate servers:
```bash
npm run dev:full
```

2. Tunnel both ports:
```bash
# Terminal 1: Frontend on port 3000
cloudflared tunnel --url http://localhost:3000 &

# Terminal 2: Backend on port 5000
cloudflared tunnel --url http://localhost:5000 &
```

### Custom Domain Configuration
If using a custom domain, update the configuration accordingly:

```env
# For custom domain deployment
VITE_API_BASE_URL=https://yourdomain.com/api
```

Update `vite.config.js` allowedHosts as needed for your domain.

### Troubleshooting Cloudflare Tunnel Issues

1. **API URL not recognized**: Ensure `VITE_API_BASE_URL` is set to the correct tunnel URL
2. **CORS errors**: Add tunnel hostnames to Vite's `allowedHosts`
3. **Session cookies**: Ensure `withCredentials: true` in API calls work across domains
4. **Port conflicts**: Make sure ports 3000 and 5000 are free

## Catatan Pengembangan

- Sesi pengguna berlangsung 12 jam
- Semua aktivitas pengguna direkam di `activity_logs`
- Produk harus didaftarkan dengan template yang telah ditentukan
- Peringatan stok rendah diaktifkan saat stok ≤ threshold

## Lisensi

Proyek ini adalah bagian dari sistem Manajemen Stok Bago untuk keperluan internal.
