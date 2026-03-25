import { create } from "zustand";
import api from "../api/axios";

export const useTripStore = create((set) => ({
  activeTrip: null,
  isLoading: false,
  error: null,

  fetchTripInfo: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/trips/${groupId}`);
      set({ activeTrip: res.data.trip, isLoading: false });
    } catch (error) {
      set({ activeTrip: null, isLoading: false });
    }
  },

  createTrip: async (data) => {
    try {
      const res = await api.post("/trips", data);
      set({ activeTrip: res.data.trip });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  updateTrip: async (tripId, data) => {
    try {
      const res = await api.put(`/trips/${tripId}`, data);
      set({ activeTrip: res.data.trip });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  startTrip: async (tripId) => {
    try {
      const res = await api.post(`/trips/${tripId}/start`);
      set({ activeTrip: res.data.trip });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  addStop: async (tripId, data) => {
    try {
      const res = await api.post(`/trips/${tripId}/stops`, data); // ✅ FIXED
      set({ activeTrip: res.data.trip });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  updateStop: async (tripId, stopId, data) => {
    try {
      const res = await api.put(`/trips/${tripId}/stops/${stopId}`, data);
      set({ activeTrip: res.data.trip });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  addExpense: async (tripId, data) => {
    try {
      const res = await api.post(`/trips/${tripId}/expense`, data);
      set({ activeTrip: res.data.trip });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  clearTrip: () => set({ activeTrip: null }),
}));