import Trip from "../models/Trip.js";
import Group from "../models/Group.js";


// Create a new trip for a group
export const createTrip = async (req, res) => {
  try {

    const { groupId, source, destination, days, mode, budget } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        success: false
      });
    }

    if (!group.members.includes(req.user.userId)) {
      return res.status(403).json({
        message: "Not a group member",
        success: false
      });
    }

    const existingTrip = await Trip.findOne({ groupId });

    if (existingTrip) {
      return res.status(400).json({
        message: "Trip already exists for this group",
        success: false
      });
    }

    const trip = new Trip({
      groupId,
      source,
      destination,
      days,
      mode,
      budget
    });

    await trip.save();

    res.status(201).json({
      message: "Trip created successfully",
      trip,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// Get trip details for a group
export const getTrip = async (req, res) => {
  try {

    const { groupId } = req.params;

    const trip = await Trip.findOne({ groupId });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
        success: false
      });
    }

    res.status(200).json({
      trip,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// Update trip details
export const updateTrip = async (req, res) => {
  try {

    const { tripId } = req.params;
    const { source, destination, days, mode, budget } = req.body;

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
        success: false
      });
    }

    if (source) trip.source = source;
    if (destination) trip.destination = destination;
    if (days) trip.days = days;
    if (mode) trip.mode = mode;
    if (budget) trip.budget = budget;

    await trip.save();

    res.status(200).json({
      message: "Trip updated successfully",
      trip,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// Start the trip
export const startTrip = async (req, res) => {
  try {

    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
        success: false
      });
    }

    trip.tripStarted = true;

    await trip.save();

    res.status(200).json({
      message: "Trip started",
      trip,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// Add a stop to the trip
export const addStop = async (req, res) => {
  try {

    const { tripId } = req.params;
    const { name, reason } = req.body;

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
        success: false
      });
    }

    trip.stops.push({ name, reason });

    await trip.save();

    res.status(200).json({
      message: "Stop added",
      trip,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// Update stop details (mark as reached)
export const updateStop = async (req, res) => {
  try {

    const { tripId, stopId } = req.params;
    const { reached } = req.body;

    const trip = await Trip.findById(tripId);

    const stop = trip.stops.id(stopId);

    if (!stop) {
      return res.status(404).json({
        message: "Stop not found",
        success: false
      });
    }

    stop.reached = reached;

    await trip.save();

    res.status(200).json({
      message: "Stop updated",
      trip,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// Add an expense to the trip
export const addExpense = async (req, res) => {
  try {

    const { tripId } = req.params;
    const { amount, reason } = req.body;

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
        success: false
      });
    }

    trip.expenses.push({
      amount,
      reason,
      paidBy: req.user.userId
    });

    await trip.save();

    res.status(200).json({
      message: "Expense added",
      trip,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};