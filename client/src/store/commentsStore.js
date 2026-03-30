import { create } from "zustand";
import api from "../api/axios";

export const useCommentStore = create((set, get) => ({
  comments: {},
  isLoading: false,
  error: null,

  fetchComments: async (postId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/comments/${postId}`);
      set((state) => ({
        comments: {
          ...state.comments,
          [postId]: res.data.comments,
        },
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch comments",
      });
    }
  },

  addComment: async (postId, text) => {
    try {
      const res = await api.post("/comments", { postId, text });

      set((state) => ({
  comments: {
    ...state.comments,
    [postId]: [
      res.data.comment,
      ...(state.comments[postId] || []),
    ],
  },
}));

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  deleteComment: async (postId , commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);

      set((state) => ({
    comments: {
      ...state.comments,
      [postId]: state.comments[postId].filter(
        (c) => c._id !== commentId
      ),
    },
  }));
    } catch (error) {
      throw error;
    }
  },

  updateComment: async (postId, commentId, text) => {
  try {
    console.log("Updating comment:", commentId, text);

    const res = await api.put(`/comments/${commentId}`, { text });

    set((state) => ({
      comments: {
        ...state.comments,
        [postId]: (state.comments[postId] || []).map((c) =>
          c._id === commentId ? res.data.comment : c
        ),
      },
    }));

    return res.data;
  } catch (error) {
    throw error;
  }
},

  clearComments: () => set({ comments: {} }),
}));