import { create } from "zustand";
import api from "../api/axios";

export const useGroupStore = create((set, get) => ({
  groups: [],
  activeGroup: null,
  messages: [],
  isLoading: false,
  error: null,

  fetchUserGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/groups");
      set({ groups: res.data.groups, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch groups",
      });
    }
  },

  createGroup: async (name) => {
    try {
      const res = await api.post("/groups", { name });

      get().fetchUserGroups();

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  addMember: async (groupId, userId) => {
    try {
      const res = await api.post(`/groups/${groupId}/add-member`, { userId });

      // update local state
      set((state) => ({
        groups: state.groups.map((g) =>
          g._id === groupId ? res.data.group : g
        ),
        activeGroup:
          state.activeGroup?._id === groupId
            ? res.data.group
            : state.activeGroup,
      }));

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  removeMember: async (groupId, userId) => {
    try {
      const res = await api.post(`/groups/${groupId}/remove-member`, { userId });

      set((state) => ({
        groups: state.groups.map((g) =>
          g._id === groupId ? res.data.group : g
        ),
        activeGroup:
          state.activeGroup?._id === groupId
            ? res.data.group
            : state.activeGroup,
      }));

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  leaveGroup: async (groupId) => {
    try {
      await api.post(`/groups/${groupId}/leave`);

      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
        activeGroup:
          state.activeGroup?._id === groupId ? null : state.activeGroup,
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteGroup: async (groupId) => {
    try {
      await api.delete(`/groups/${groupId}`);

      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
        activeGroup:
          state.activeGroup?._id === groupId ? null : state.activeGroup,
      }));
    } catch (error) {
      throw error;
    }
  },

  setActiveGroup: (group) => set({ activeGroup: group }),

  fetchMessages: async (groupId) => {
    try {
      const res = await api.get(`/messages/${groupId}`);
      set({ messages: res.data });
    } catch (error) {
      console.error(error);
    }
  },

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setMessages: (messages) => set({ messages }),
}));