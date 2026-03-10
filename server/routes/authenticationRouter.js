import express from "express";
import {
  register,
  login,
  logout,
  updateProfile
} from "../controllers/authenticationController.js";

import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.put("/profile/update", isAuthenticated, updateProfile);

export default router;