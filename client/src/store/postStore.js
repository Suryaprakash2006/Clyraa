import { create } from "zustand";
import api from "../api/axios";

export const usePostStore = create((set, get) => ({
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/posts");
      set({ posts: res.data.posts, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch posts",
        isLoading: false,
      });
    }
  },

  fetchPostById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/posts/${id}`);
      set({ currentPost: res.data.post, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch post",
        isLoading: false,
      });
    }
  },

  createPost: async (content, images, location, communityId) => {
    try {
      const res = await api.post("/posts", {
        content,
        images,
        location,
        communityId,
      });

      get().fetchPosts();

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  updatePost: async (postId, data) => {
    try {
      const res = await api.put(`/posts/${postId}`, data);

      set((state) => ({
        posts: state.posts.map((p) =>
          p._id === postId ? res.data.post : p
        ),
        currentPost:
          state.currentPost?._id === postId
            ? res.data.post
            : state.currentPost,
      }));

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);

      set((state) => ({
        posts: state.posts.filter((p) => p._id !== postId),
      }));
    } catch (error) {
      throw error;
    }
  },

  likePost: async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);

      set((state) => ({
        posts: state.posts.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: Array(res.data.likes).fill("temp"),
              }
            : p
        ),
      }));

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  clearCurrentPost: () => set({ currentPost: null }),
}));