# Analisis Project .docx — SuaraMoklet

Dokumen ini berisi analisis detail dari file [Project .docx](file:///Users/nabilkencana/Project%20/SuaraMoklet/suaramoklet-frontend/Project%20.docx) yang ditemukan di folder `suaramoklet-frontend`. Analisis ini mencakup informasi ringkasan proyek, pembagian tugas (sprint), kesesuaian implementasi saat ini, serta perbandingan skema database (Prisma).

---

## 📋 Ringkasan Proyek

- **Nama Proyek**: SuaraMoklet (dalam beberapa bagian dokumen ditulis *SuaraKita*)
- **Tagline**: *Your Voice, Better School*
- **Tujuan**: Aplikasi pelaporan keluhan dan aspirasi warga sekolah (siswa, orang tua, guru, karyawan) untuk meningkatkan kualitas pelayanan sekolah.
- **Periode Proyek**: 1 Juli – 31 Agustus 2025 (9 Sprint)
- **Komposisi Tim**: 
  - 1 Backend Developer (NestJS)
  - 1 Frontend Developer (Next.js)

---

## 🗓️ Jadwal Sprint & Status Implementasi

Berdasarkan struktur folder di `suaramoklet-frontend` dan `suaramoklet-backend`, berikut adalah rangkuman dari 9 Sprint yang dijadwalkan beserta analisis statusnya saat ini:

| Sprint | Periode | Fokus Utama | Status Kemajuan & Analisis |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | 1–7 Juli | Setup, Auth, Database | **Sebagian Besar Selesai**:<br>- FE folder structure (`FE-02`) sudah dibuat.<br>- Auth store (`FE-04`) di Zustand sudah tersedia.<br>- Backend prisma schema sudah didefinisikan. |
| **Sprint 2** | 8–14 Juli | Core Backend API | **Dalam Proses** (Backend memiliki struktur modul di `src/` untuk complaints, comments, dll). |
| **Sprint 3** | 15–21 Juli | Unit, Role & Forwarding | Belum diintegrasikan penuh di frontend. |
| **Sprint 4** | 22–28 Juli | FE Foundation + Landing Page | Halaman landing page (`app/page.tsx`) sudah ada dengan mock data. |
| **Sprint 5** | 29 Juli–4 Agt | Core FE (Keluhan & Komentar) | Halaman detail dan form komentar perlu dihubungkan dengan backend. |
| **Sprint 6** | 5–11 Agustus | Dashboard Unit & Superadmin | Halaman dashboard unit dan admin berada di direktori `app/dashboard`. |
| **Sprint 7** | 12–18 Agustus | Notifikasi, Polish & Edge Cases | Modul notifikasi tersedia di database namun perlu integrasi UI. |
| **Sprint 8** | 19–25 Agustus | Testing & Deployment | Docker dan konfigurasi deploy sudah disiapkan di backend. |
| **Sprint 9** | 26–31 Agustus | Final QA, Dokumentasi, Handover | Tahap finalisasi. |

---

## 🛠️ Analisis Teknologi & Stack

| Layer | Rekomendasi Dokumen | Implementasi Aktual | Catatan |
| :--- | :--- | :--- | :--- |
| **Backend** | NestJS, Prisma, PostgreSQL | NestJS, Prisma, **MySQL** | Backend bermigrasi ke MySQL untuk kompatibilitas dengan MAMPP/XAMPP lokal. |
| **Frontend** | Next.js 14, Tailwind CSS, Axios | Next.js 16, Tailwind CSS v4, Zustand, Axios, Zod, Sonner | Frontend menggunakan Next.js 16 (terbaru) dengan Tailwind CSS v4 yang memiliki konfigurasi build modern. |
| **Testing** | Jest + Supertest (BE) | Tersedia di folder `test/` backend | Siap untuk dijalankan. |

---

## 🗄️ Perbandingan Skema Prisma (Rekomendasi vs Aktual)

Terdapat beberapa perbedaan krusial antara draf rekomendasi skema Prisma yang tercantum di `.docx` dengan file skema riil di [schema.prisma](file:///Users/nabilkencana/Project%20/SuaraMoklet/suaramoklet-backend/prisma/schema.prisma):

### 1. Perbaikan Sintaks Hubungan (Relations)
- **Rekomendasi (.docx)**:
  ```prisma
  unit  Unit @relation(fields: [unitId], references: [unitId: id])
  ```
  Sintaks ini salah/tidak valid dalam Prisma.
- **Aktual (schema.prisma)**:
  ```prisma
  unit Unit @relation(fields: [unitId], references: [id])
  ```
  Ini sudah diperbaiki dengan benar di repositori backend aktual.

### 2. Penanganan Status Keluhan (`ComplaintStatus`)
- **Rekomendasi (.docx)**:
  ```prisma
  enum ComplaintStatus {
    NEW
    WAITING_RESPONSE
    WAITING_USER
    CLOSED
  }
  
  model Complaint {
    status      ComplaintStatus     @default(OPEN) // OPEN tidak ada di enum!
  }
  ```
  Terdapat ketidaksesuaian karena nilai default `@default(OPEN)` tidak ada di dalam `enum ComplaintStatus`.
- **Aktual (schema.prisma)**:
  ```prisma
  enum ComplaintStatus {
    NEW
    WAITING_RESPONSE
    WAITING_USER
    IN_PROGRESS
    CLOSED
  }
  
  model Complaint {
    status      ComplaintStatus     @default(NEW)
  }
  ```
  Nilai default diatur ke `NEW` dan status tambahan `IN_PROGRESS` telah ditambahkan untuk alur kerja yang lebih realistis.

### 3. Komentar Bertingkat (`Comment Threading`)
- **Rekomendasi (.docx)**:
  ```prisma
  model Comment {
    comment_by  ENUM (USER / ADMIN) // Sintaks tidak valid
    parent    Comment?   @relation("CommentThread", fields: [parentId], references: [id]) // field parentId belum dideklarasikan
  }
  ```
  Terdapat kesalahan deklarasi enum dan field relasi yang hilang.
- **Aktual (schema.prisma)**:
  ```prisma
  enum CommentBy {
    USER
    ADMIN
  }

  model Comment {
    comment_by  CommentBy
    parentId    String?
    parent      Comment?       @relation("CommentThread", fields: [parentId], references: [id])
    replies     Comment[]      @relation("CommentThread")
  }
  ```
  Skema aktual telah mendefinisikan enum `CommentBy` secara terpisah dan menambahkan field `parentId` dengan benar untuk mendukung komentar bertingkat.

### 4. Pilihan Database
- **Rekomendasi (.docx)**: Menggunakan `provider = "postgresql"`
- **Aktual (schema.prisma)**: Menggunakan `provider = "mysql"` yang diarahkan ke database MySQL lokal.

---

## 🚀 Langkah Selanjutnya untuk Frontend
1. **Verifikasi API URL**: Pastikan konfigurasi `.env` di frontend mengarah ke port server backend NestJS (biasanya `http://localhost:3000` atau port proxy yang didefinisikan di `proxy.ts`).
2. **Koneksi State Management**: Selesaikan integrasi komponen Login & Register dengan `useAuthStore` untuk menyimpan token JWT.
3. **Migrasi Data Keluhan**: Ganti data dummy/mock yang ada di `app/page.tsx` dengan memanggil API `GET /complaints` menggunakan Axios wrapper dari `lib/api.ts`.
