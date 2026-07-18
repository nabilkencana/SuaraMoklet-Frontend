# 📣 SuaraMoklet Frontend

> **Your Voice, Better School**  
> Platform pengaduan dan penyampaian aspirasi siswa SMK Telkom Malang secara digital, transparan, dan terstruktur.

---

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-State_Management-blue?style=for-the-badge)](https://github.com/pmndrs/zustand)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

## 📝 Ringkasan Proyek

**SuaraMoklet** (juga dikenal sebagai *SuaraKita*) dirancang khusus untuk memfasilitasi komunikasi dua arah yang transparan antara warga sekolah (siswa, orang tua, guru, dan staf) dengan pihak tata kelola sekolah. Aplikasi ini membantu mempercepat alur penanganan masalah terkait sarana prasarana, kesiswaan, kurikulum, hubungan industri (hubin), dan administrasi tata usaha secara digital.

Aplikasi frontend ini dibangun menggunakan **Next.js 16 (App Router)** dan dikombinasikan dengan **Tailwind CSS v4** untuk memberikan visual yang premium, responsif, dan interaktif.

---

## ⚡ Fitur Utama

### 🔒 1. Autentikasi & Keamanan Tingkat Edge
- **Role-Based Access Control (RBAC)**: Pembagian akses berdasarkan peran pengguna: `USER`, `UNIT_MEMBER`, `UNIT_PIC`, `SUPER_PIC`, dan `SUPERADMIN`.
- **Edge Route Protection**: Manajemen rute terlindungi di tingkat middleware (`proxy.ts`) untuk verifikasi token akses JWT sebelum halaman dirender oleh klien.
- **Persistent Session**: Integrasi Zustand store dengan Cookies (`accessToken`) dan Local Storage untuk mempertahankan sesi login secara aman.

### 📝 2. Formulir Pengaduan Multi-Step & Opsi Anonim
- Formulir pengaduan interaktif yang memandu pengguna langkah-demi-langkah (multi-step form).
- Fitur **Kirim Sebagai Anonim** demi privasi pelapor (identitas aman di database untuk kebutuhan verifikasi sekolah tetapi tersembunyi dari publik).
- Mengunggah berkas bukti pendukung berupa gambar/dokumen dengan batas ukuran tertentu.

### 📈 3. Sistem Dukungan & Keluhan Populer (Trending)
- Siswa lain dapat memberikan suara dukungan (**upvote**) pada keluhan publik.
- Keluhan dengan dukungan tinggi secara otomatis naik ke bagian **Trending Complaints** untuk mendapatkan prioritas penanganan lebih cepat dari pihak sekolah.

### 💬 4. Diskusi Interaktif & Komentar Bertingkat
- Kolom komentar bertingkat (*comment threading*) pada setiap halaman keluhan.
- Pelapor dan pihak pengelola (Unit PIC / Admin) dapat berdiskusi secara langsung untuk mengklarifikasi masalah atau memberikan pembaruan status.

### ⏳ 5. Visual Timeline Penanganan Keluhan
- Alur kerja status pengaduan yang jelas dan transparan: `NEW` ➔ `WAITING_RESPONSE` ➔ `IN_PROGRESS` ➔ `WAITING_USER` ➔ `CLOSED`.
- Visualisasi tahapan dalam bentuk garis waktu (*timeline*) yang dinamis di halaman detail pengaduan.

### 📊 6. Dashboard Khusus Peran (Role Dashboard)
- **Pelapor (User)**: Memantau riwayat pengaduan mandiri, status respons, dan dukungan yang didapat.
- **Unit PIC & Member**: Dashboard untuk melihat keluhan masuk yang didelegasikan ke unitnya (Sarpras, Kesiswaan, dll.), memperbarui status, dan menuliskan penyelesaian kasus.
- **Superadmin**: Panel manajemen penuh untuk mengelola pengguna, menambahkan/mengedit unit sekolah, memantau metrik performa respon unit, serta mengonfigurasi sistem.

---

## 🛠️ Stack Teknologi

Berikut adalah teknologi utama yang digunakan pada repositori frontend:

*   **Core Framework:** [Next.js 16.2.9 (App Router)](https://nextjs.org/)
*   **Library UI/UX:** [React 19](https://react.dev/) & [Lucide React](https://lucide.dev/) (Icons)
*   **Desain & Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [PostCSS](https://postcss.org/)
*   **State Management:** [Zustand 5.0.14](https://github.com/pmndrs/zustand)
*   **HTTP Client:** [Axios 1.18.1](https://axios-http.com/) (dilengkapi dengan Interceptor & API mapper helper)
*   **Form Handling:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) (Schema validation)
*   **Notifikasi Toast:** [Sonner](https://github.com/emilkowalski/sonner)

---

## 📂 Struktur Direktori

Berikut penjelasan singkat mengenai struktur folder di dalam `suaramoklet-frontend`:

```text
suaramoklet-frontend/
├── app/                  # Routing utama Next.js (App Router)
│   ├── (auth)/           # Rute untuk login dan register
│   ├── admin/            # Dashboard dan panel kelola khusus Superadmin
│   ├── complaints/       # Halaman daftar, buat, dan detail keluhan
│   ├── dashboard/        # Dashboard default pengguna/staf
│   ├── profile/          # Halaman pengaturan profil & keamanan akun
│   ├── store/            # Zustand global stores (e.g., auth.store.ts)
│   ├── unit/             # Dashboard manajemen keluhan tingkat unit kerja
│   ├── layout.tsx        # Layout utama aplikasi (mengandung Toast Provider, dll.)
│   └── page.tsx          # Landing page interaktif SuaraMoklet
├── components/           # Komponen UI yang dapat digunakan kembali
│   ├── auth/             # Komponen pendukung login/register
│   ├── complaints/       # Komponen visual keluhan (e.g. form, list)
│   ├── shared/           # Komponen global (Header, Footer, ComplaintCard)
│   └── ui/               # Atom components reusable (Badge, Button, Card, dll.)
├── features/             # Modul logika khusus per fitur (comments, complaints, profile)
├── hooks/                # Custom React hooks
├── lib/                  # Utilitas eksternal, konfigurasi Axios, & helper Cookies
├── public/               # File aset statis (logo, gambar ilustrasi)
├── types/                # Definisi tipe data TypeScript global
├── proxy.ts              # Konfigurasi proxy & route protection middleware
└── package.json          # Berkas konfigurasi dependensi npm
```

---

## 🚀 Langkah Instalasi & Menjalankan Lokal

Ikuti langkah-langkah berikut untuk menjalankan proyek frontend di lingkungan lokal Anda:

### 1. Prasyarat
Pastikan Anda telah menginstal:
- **Node.js** (versi 18.x atau yang terbaru direkomendasikan)
- **npm** atau **yarn** / **pnpm**

### 2. Kloning & Masuk ke Direktori
```bash
git clone <repository-url>
cd suaramoklet-frontend
```

### 3. Instalasi Dependensi
Jalankan perintah berikut untuk menginstal semua pustaka pendukung:
```bash
npm install
```

### 4. Konfigurasi Environment Variables
Buat file bernama `.env` di root direktori frontend dan tambahkan URL backend API Anda:
```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

### 5. Menjalankan Server Pengembangan
Mulai server pengembangan Next.js lokal:
```bash
npm run dev
```
Setelah server berjalan, buka peramban Anda dan kunjungi: [http://localhost:3000](http://localhost:3000)

### 6. Build Produksi
Untuk melakukan kompilasi proyek sebelum dideploy ke server produksi:
```bash
npm run build
npm run start
```

---

## 🔗 Integrasi Backend

Frontend ini dirancang untuk berkomunikasi dengan [suaramoklet-backend](file:///Users/nabilkencana/Project%20/SuaraMoklet/suaramoklet-backend) yang dibangun menggunakan **NestJS**, **Prisma ORM**, dan database **MySQL**. Pastikan service backend Anda sudah aktif sebelum mencoba fitur pengiriman data dan autentikasi.

---

## 🤝 Kontribusi

1. Buat branch baru untuk fitur Anda (`git checkout -b feature/FiturBaru`).
2. Lakukan commit pada perubahan Anda (`git commit -m 'Menambahkan fitur baru X'`).
3. Lakukan push ke branch tersebut (`git push origin feature/FiturBaru`).
4. Buat Pull Request (PR) baru untuk diulas oleh rekan tim.
