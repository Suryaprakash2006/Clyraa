import { create } from "zustand";
import api from "../api/axios";

export const useCommunityStore = create((set, get) => ({
  communities: [],
  currentCommunity: null,
  isLoading: false,
  error: null,

  fetchCommunities: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/communities");
      set({ communities: res.data.communities, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch communities",
      });
    }
  },

  fetchCommunityById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/communities/${id}`);
      set({ currentCommunity: res.data.community, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch community",
      });
    }
  },

  createCommunity: async (name, location, description) => {
    try {
      const res = await api.post("/communities", {
        name,
        location,
        description,
      });

      get().fetchCommunities();

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  updateCommunity: async (id, data) => {
    try {
      const res = await api.put(`/communities/${id}`, data);

      set((state) => ({
        communities: state.communities.map((c) =>
          c._id === id ? res.data.community : c
        ),
        currentCommunity: res.data.community,
      }));

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  deleteCommunity: async (id) => {
    try {
      await api.delete(`/communities/${id}`);

      set((state) => ({
        communities: state.communities.filter((c) => c._id !== id),
        currentCommunity: null,
      }));
    } catch (error) {
      throw error;
    }
  },

  joinCommunity: async (communityId) => {
    try {
      const res = await api.post(`/communities/${communityId}/join`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  leaveCommunity: async (communityId) => {
    try {
      const res = await api.post(`/communities/${communityId}/leave`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  clearCurrentCommunity: () => set({ currentCommunity: null }),
}));