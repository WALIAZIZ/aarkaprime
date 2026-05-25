import { create } from "zustand";

export type AppView =
  | "landing"
  | "login"
  | "register"
  | "dashboard"
  | "properties"
  | "add-property"
  | "edit-property"
  | "property-detail"
  | "generate"
  | "leads"
  | "settings"
  | "pricing"
  | "admin";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  country?: string;
  role: string;
  plan: string;
  monthlyGenerationsUsed?: number;
  monthlyGenerationsLimit?: number;
  activeListings?: number;
  maxListings?: number;
}

interface AppState {
  // View state
  view: AppView;
  previousView: AppView | null;

  // Selected property
  selectedPropertyId: string | null;

  // User state
  user: AuthUser | null;
  isLoading: boolean;

  // UI state
  sidebarOpen: boolean;
  isGenerating: boolean;

  // Toasts
  toasts: Toast[];

  // Actions
  setView: (view: AppView) => void;
  goBack: () => void;
  selectProperty: (id: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setGenerating: (generating: boolean) => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: "landing",
  previousView: null,
  selectedPropertyId: null,
  user: null,
  isLoading: true,
  sidebarOpen: false,
  isGenerating: false,
  toasts: [],

  setView: (view) =>
    set((state) => ({ view, previousView: state.view, sidebarOpen: false })),

  goBack: () =>
    set((state) => ({
      view: state.previousView || "dashboard",
      previousView: null,
    })),

  selectProperty: (id) => set({ selectedPropertyId: id }),

  setUser: (user) => set({ user, isLoading: false }),

  setLoading: (loading) => set({ isLoading: loading }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setGenerating: (generating) => set({ isGenerating: generating }),

  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: Math.random().toString(36).substring(2, 9) },
      ],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
