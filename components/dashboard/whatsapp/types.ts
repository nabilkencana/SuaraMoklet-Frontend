export type WaConnectionStatus = "offline" | "disconnected" | "online" | "connecting";

export interface WhatsAppLog {
  id: string;
  to: string;
  message: string;
  status: "SUCCESS" | "FAILED";
  errorMessage?: string;
  createdAt: string;
}

export interface WhatsAppTemplate {
  name: string;
  title?: string;
  content: string;
  description?: string;
}
