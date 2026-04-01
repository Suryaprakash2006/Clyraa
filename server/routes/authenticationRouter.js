import express from "express";
import {
  register,
  login,
  logout,
  updateProfile,
  searchUsers,
  getUserProfile,
  toggleFollow,
  changePassword,
  toggleSavePost
} from "../controllers/authenticationController.js";

import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.put("/profile/update", isAuthenticated, updateProfile);
router.get("/search", isAuthenticated, searchUsers);
router.get("/profile/details/:id", isAuthenticated, getUserProfile);
router.post("/profile/:id/follow", isAuthenticated, toggleFollow);
router.put("/profile/password", isAuthenticated, changePassword);
router.post("/profile/save-post/:postId", isAuthenticated, toggleSavePost);

export default router;