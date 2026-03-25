import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post("/auth/login", { email, password });
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      return res.data;
    } catch (error) {
      set({ error: error.response?.data?.message || "Login failed", isLoading: false });
      throw error;
    }
  },

  register: async (name, email, phone, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post("/auth/register", { name, email, phone, password });
      set({ isLoading: false });
      return res.data;
    } catch (error) {
      set({ error: error.response?.data?.message || "Registration failed", isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error("Logout error", error);
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.put("/auth/profile/update", data);
      set({ user: res.data.user, isLoading: false });
      return res.data;
    } catch (error) {
      set({ error: error.response?.data?.message || "Update failed", isLoading: false });
      throw error;
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  updateUserLocal: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: "auth-storage", // unique name for localStorage
    }
  )
);
