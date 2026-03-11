import express from "express";
import {
  createCommunity,
  getCommunities,
  getCommunity,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity
} from "../controllers/communityController.js";

import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/", isAuthenticated, createCommunity);
router.get("/", getCommunities);
router.get("/:id", getCommunity);
router.put("/:id", isAuthenticated, updateCommunity);
router.delete("/:id", isAuthenticated, deleteCommunity);
router.post("/:communityId/join", isAuthenticated, joinCommunity);
router.post("/:communityId/leave", isAuthenticated, leaveCommunity);

export default router;