import express from "express";
import {
  createTrip,
  getTrip,
  updateTrip,
  startTrip,
  addStop,
  updateStop,
  addExpense,
  getActiveTrip,
  endTrip,
  restartTrip,
  addPackingItem,
  togglePackingItem,
  addNote,
  getPastTrips,
  getSingleTrip
} from "../controllers/tripController.js";

import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.get("/active", isAuthenticated, getActiveTrip);
router.post("/", isAuthenticated, createTrip);
router.get("/:groupId", isAuthenticated, getTrip);
router.get("/past/:groupId", isAuthenticated, getPastTrips);
router.get("/single/:tripId", isAuthenticated, getSingleTrip);
router.put("/:tripId", isAuthenticated, updateTrip);
router.post("/:tripId/start", isAuthenticated, startTrip);
router.post("/:tripId/stops", isAuthenticated, addStop);
router.put("/:tripId/stops/:stopId", isAuthenticated, updateStop);
router.post("/:tripId/expense", isAuthenticated, addExpense);

router.post("/:tripId/end", isAuthenticated, endTrip);
router.post("/:tripId/restart", isAuthenticated, restartTrip);

router.post("/:tripId/packing", isAuthenticated, addPackingItem);
router.put("/:tripId/packing/:itemId", isAuthenticated, togglePackingItem);

router.post("/:tripId/notes", isAuthenticated, addNote);

export default router;