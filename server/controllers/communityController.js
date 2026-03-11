import Community from "../models/Community.js";
import User from "../models/User.js";

// Create a new community
export const createCommunity = async (req, res) => {
  try {

    const { name, location, description } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        message: "Name and location are required",
        success: false
      });
    }

    const community = new Community({
      name,
      location,
      description,
      admin: req.user.userId
    });

    await community.save();

    res.status(201).json({
      message: "Community created",
      community,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// Get all communities
export const getCommunities = async (req, res) => {
  try {

    const communities = await Community.find()
      .populate("admin", "name profile.profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      communities,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// Get a single community by ID
export const getCommunity = async (req, res) => {
  try {

    const { id } = req.params;

    const community = await Community.findById(id)
      .populate("admin", "name profile.profilePic");

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
        success: false
      });
    }

    res.status(200).json({
      community,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// Update a community
export const updateCommunity = async (req, res) => {
  try {

    const { id } = req.params;

    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
        success: false
      });
    }

    if (community.admin.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Not authorized",
        success: false
      });
    }

    const { name, location, description } = req.body;

    if (name) community.name = name;
    if (location) community.location = location;
    if (description) community.description = description;

    await community.save();

    res.status(200).json({
      message: "Community updated",
      community,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// Delete a community
export const deleteCommunity = async (req, res) => {
  try {

    const { id } = req.params;

    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
        success: false
      });
    }

    if (community.admin.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Not authorized",
        success: false
      });
    }

    await community.deleteOne();

    res.status(200).json({
      message: "Community deleted",
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

//Join a community
export const joinCommunity = async (req, res) => {
  try {

    const { communityId } = req.params;
    const userId = req.user.userId;

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
        success: false
      });
    }

    const user = await User.findById(userId);

    if (user.communitiesJoined.includes(communityId)) {
      return res.status(400).json({
        message: "Already joined this community",
        success: false
      });
    }

    user.communitiesJoined.push(communityId);

    await user.save();

    res.status(200).json({
      message: "Joined community successfully",
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      success: false
    });
  }
};

//Leave a community
export const leaveCommunity = async (req, res) => {
  try {

    const { communityId } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user.communitiesJoined.includes(communityId)) {
      return res.status(400).json({
        message: "You are not part of this community",
        success: false
      });
    }

    user.communitiesJoined = user.communitiesJoined.filter(
      id => id.toString() !== communityId
    );

    await user.save();

    res.status(200).json({
      message: "Left community successfully",
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      success: false
    });
  }
};
