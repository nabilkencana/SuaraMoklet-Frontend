import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSlaStatus(createdAt: string | Date) {
  const createdDate = new Date(createdAt);
  const slaDeadline = new Date(createdDate.getTime() + 48 * 60 * 60 * 1000);
  const now = new Date();
  
  const diffMs = slaDeadline.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 0) {
    const overdueHours = Math.abs(diffHours);
    return {
      text: `SLA Terlewat ${overdueHours} Jam`,
      color: "bg-red-600 text-white",
    };
  } else if (diffHours === 0) {
    return {
      text: `Target SLA: <1 Jam`,
      color: "bg-orange-500 text-white",
    };
  } else if (diffHours <= 12) {
    return {
      text: `Target SLA: ${diffHours} Jam`,
      color: "bg-orange-500 text-white",
    };
  } else {
    return {
      text: `Target SLA: ${diffHours} Jam`,
      color: "bg-emerald-500 text-white",
    };
  }
}
