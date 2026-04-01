import Group from "../models/Group.js";

// Create a new group
export const createGroup = async (req, res) => {
  try {

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Group name required",
        success: false
      });
    }

    const group = new Group({
      name,
      admin: req.user.userId,
      members: [req.user.userId]
    });

    await group.save();

    res.status(201).json({
      message: "Group created successfully",
      group,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


//Get Groups of Logged-in User
export const getUserGroups = async (req, res) => {
  try {

    const userId = req.user.userId;

    const groups = await Group.find({
      members: userId
    })
      .populate("admin", "name")
      .populate("members", "name profile.profilePic");

    res.status(200).json({
      groups,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// Add member to group (admin only)
export const addMember = async (req, res) => {
  try {

    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        success: false
      });
    }

    if (group.admin.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Only admin can add members",
        success: false
      });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({
        message: "User already in group",
        success: false
      });
    }

    group.members.push(userId);

    await group.save();

    res.status(200).json({
      message: "Member added",
      group,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// remove member from group (Admin only)
export const removeMember = async (req, res) => {
  try {

    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        success: false
      });
    }

    // check admin
    if (group.admin.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Only admin can remove members",
        success: false
      });
    }

    // prevent admin removal
    if (userId === group.admin.toString()) {
      return res.status(400).json({
        message: "Admin cannot be removed",
        success: false
      });
    }

    if (!group.members.includes(userId)) {
      return res.status(400).json({
        message: "User is not in the group",
        success: false
      });
    }

    group.members = group.members.filter(
      member => member.toString() !== userId
    );

    await group.save();

    res.status(200).json({
      message: "Member removed successfully",
      group,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

//Leave group
export const leaveGroup = async (req, res) => {
  try {

    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        success: false
      });
    }

    group.members = group.members.filter(
      member => member.toString() !== req.user.userId
    );

    await group.save();

    res.status(200).json({
      message: "Left group successfully",
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Delete group (Admin only)
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        success: false
      });
    }

    // check admin
    if (group.admin.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Only admin can delete the group",
        success: false
      });
    }

    await Group.findByIdAndDelete(groupId);

    res.status(200).json({
      message: "Group deleted successfully",
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};