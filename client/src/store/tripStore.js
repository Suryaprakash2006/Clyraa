import { create } from "zustand";
import api from "../api/axios";

export const useTripStore = create((set) => ({
  activeTrip: null,
  pastTrips: [],
  isLoading: false,
  error: null,

  fetchTripInfo: async (groupId, tripId = null) => {
    set({ isLoading: true, error: null });
    try {
      const url = tripId ? `/trips/single/${tripId}` : `/trips/${groupId}`;
      const res = await api.get(url);
      set({ activeTrip: res.data.trip, isLoading: false });
    } catch (error) {
      set({ activeTrip: null, isLoading: false });
    }
  },

  fetchPastTrips: async (groupId) => {
    try {
      const res = await api.get(`/trips/past/${groupId}`);
      set({ pastTrips: res.data.trips });
    } catch (error) {
      console.error("Error fetching past trips:", error);
    }
  },

  fetchGlobalActiveTrip: async () => {
    try {
      const res = await api.get('/trips/active');
      return res.data.trip;
    } catch (error) {
      console.error("Error fetching global active trip:", error);
      return null;
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

  endTrip: async (tripId) => {
    try {
      const res = await api.post(`/trips/${tripId}/end`);
      set({ activeTrip: res.data.trip });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  restartTrip: async (tripId) => {
    try {
      const res = await api.post(`/trips/${tripId}/restart`);
      set({ activeTrip: res.data.trip });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  addPackingItem: async (tripId, data) => {
    try {
      const res = await api.post(`/trips/${tripId}/packing`, data);
      set({ activeTrip: res.data.trip });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  togglePackingItem: async (tripId, itemId, isPacked) => {
    try {
      const res = await api.put(`/trips/${tripId}/packing/${itemId}`, { isPacked });
      set({ activeTrip: res.data.trip });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  addNote: async (tripId, data) => {
    try {
      const res = await api.post(`/trips/${tripId}/notes`, data);
      set({ activeTrip: res.data.trip });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  clearTrip: () => set({ activeTrip: null }),
}));