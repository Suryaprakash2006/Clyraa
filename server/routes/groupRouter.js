import express from "express";
import {
  createGroup,
  getUserGroups,
  addMember,
  removeMember,
  leaveGroup
} from "../controllers/groupController.js";

import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/", isAuthenticated, createGroup);
router.get("/", isAuthenticated, getUserGroups);
router.post("/:groupId/add-member", isAuthenticated, addMember);
router.post("/:groupId/remove-member", isAuthenticated, removeMember);
router.post("/:groupId/leave", isAuthenticated, leaveGroup);

export default router;