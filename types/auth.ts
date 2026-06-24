/**
 * Auth types are defined and owned by the store to prevent interface/implementation drift.
 * This file re-exports them for backwards compatibility with existing imports.
 */
export type { AuthUser as User, AuthUser, AuthStore as AuthState, UserRole } from "@/app/store/auth.store";
