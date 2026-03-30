import express from "express";
import {
  createPost,
  getPosts,
  getSinglePost,
  updatePost,
  deletePost,
  likePost,
  addToCommunity,
  getCommunityPosts
} from "../controllers/postController.js";

import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/", isAuthenticated, createPost);
router.get("/", getPosts);
router.get("/:id", getSinglePost);
router.put("/:id", isAuthenticated, updatePost);
router.delete("/:id", isAuthenticated, deletePost);
router.post("/:id/like", isAuthenticated, likePost);
router.post("/:id/community", isAuthenticated, addToCommunity);
router.get("/community/:communityId", isAuthenticated, getCommunityPosts);

export default router;