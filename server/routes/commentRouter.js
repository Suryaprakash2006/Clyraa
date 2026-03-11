import express from "express";
import {
  addComment,
  getPostComments,
  deleteComment,
  updateComment
} from "../controllers/commentController.js";

import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/", isAuthenticated, addComment);
router.get("/:postId", getPostComments);
router.delete("/:id", isAuthenticated, deleteComment);
router.put("/:id", isAuthenticated, updateComment);

export default router;