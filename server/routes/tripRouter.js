import express from "express";
import {
  createTrip,
  getTrip,
  updateTrip,
  startTrip,
  addStop,
  updateStop,
  addExpense
} from "../controllers/tripController.js";

import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/", isAuthenticated, createTrip);
router.get("/:groupId", isAuthenticated, getTrip);
router.put("/:tripId", isAuthenticated, updateTrip);
router.post("/:tripId/start", isAuthenticated, startTrip);
router.post("/:tripId/stops", isAuthenticated, addStop);
router.put("/:tripId/stops/:stopId", isAuthenticated, updateStop);
router.post("/:tripId/expense", isAuthenticated, addExpense);

export default router;