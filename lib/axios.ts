import axios from "axios";
import { getCookie } from "./cookies";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getCookie("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Global Response Error Interceptor for unhandled network & server errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      if (!error.response) {
        // Network connection error
        toast.error("Gagal terhubung ke server", {
          description: "Periksa koneksi internet Anda atau coba beberapa saat lagi.",
        });
      } else if (error.response.status >= 500) {
        // Server internal error
        toast.error("Terjadi kesalahan pada server", {
          description: "Sistem mengalami gangguan sementara. Tim teknis sedang menanganinya.",
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;