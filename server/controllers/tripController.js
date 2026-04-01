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

    const existingTrip = await Trip.findOne({ groupId, tripCompleted: false });

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

    const trip = await Trip.findOne({ groupId, tripCompleted: false });

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


// Get all past completed trips for a group
export const getPastTrips = async (req, res) => {
  try {
    const { groupId } = req.params;

    const trips = await Trip.find({ groupId, tripCompleted: true }).sort({ updatedAt: -1 });

    res.status(200).json({
      trips,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// Get a single trip by ID
export const getSingleTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);

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

    // Check if user already has an active trip
    const userGroups = await Group.find({ members: req.user.userId }).select('_id');
    const groupIds = userGroups.map(g => g._id);

    const activeGlobalTrip = await Trip.findOne({
      groupId: { $in: groupIds },
      tripStarted: true
    });

    if (activeGlobalTrip && activeGlobalTrip._id.toString() !== tripId) {
      return res.status(400).json({
        message: "You already have an active trip running in another group.",
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

// Get the active global trip for the user across all their groups
export const getActiveTrip = async (req, res) => {
  try {
    const userGroups = await Group.find({ members: req.user.userId }).select('_id');
    const groupIds = userGroups.map(g => g._id);

    const trip = await Trip.findOne({
      groupId: { $in: groupIds },
      tripStarted: true
    });

    if (!trip) {
      return res.status(200).json({
        trip: null,
        success: true
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

// End the trip
export const endTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found", success: false });
    }

    trip.tripCompleted = true;
    trip.tripStarted = false; // Mark as no longer active

    await trip.save();

    res.status(200).json({
      message: "Trip ended successfully",
      trip,
      success: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Restart the trip
export const restartTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found", success: false });
    }

    // Check if user already has an active global trip
    const userGroups = await Group.find({ members: req.user.userId }).select('_id');
    const groupIds = userGroups.map(g => g._id);

    const activeGlobalTrip = await Trip.findOne({
      groupId: { $in: groupIds },
      tripStarted: true
    });

    if (activeGlobalTrip && activeGlobalTrip._id.toString() !== tripId) {
      return res.status(400).json({
        message: "You already have an active trip running in another group.",
        success: false
      });
    }

    trip.tripCompleted = false;
    trip.tripStarted = true;

    await trip.save();

    res.status(200).json({
      message: "Trip restarted successfully",
      trip,
      success: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Add a packing list item
export const addPackingItem = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { item } = req.body;

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found", success: false });
    }

    if (trip.tripCompleted) {
      return res.status(400).json({ message: "Cannot modify a completed trip", success: false });
    }

    trip.packingList.push({ item, addedBy: req.user.userId });
    await trip.save();

    res.status(200).json({ message: "Item added to packing list", trip, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Toggle packing item status
export const togglePackingItem = async (req, res) => {
  try {
    const { tripId, itemId } = req.params;
    const { isPacked } = req.body;

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found", success: false });
    }

    if (trip.tripCompleted) {
      return res.status(400).json({ message: "Cannot modify a completed trip", success: false });
    }

    const item = trip.packingList.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found", success: false });
    }

    item.isPacked = isPacked;
    await trip.save();

    res.status(200).json({ message: "Item status updated", trip, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Add a note
export const addNote = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { title, content } = req.body;

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found", success: false });
    }

    if (trip.tripCompleted) {
      return res.status(400).json({ message: "Cannot modify a completed trip", success: false });
    }

    trip.notes.push({ title, content, addedBy: req.user.userId });
    await trip.save();

    res.status(200).json({ message: "Note added", trip, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};