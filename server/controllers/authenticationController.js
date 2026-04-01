import User from "../models/User.js";
import Community from "../models/Community.js";
import Post from "../models/Post.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// REGISTER
export const register = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required", success: false });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully", success: true });
  }
  catch (error) {
    console.error("Error in register controller: ", error);
    res.status(500).json({ message: "Server error", success: false });
  }
}

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required", success: false });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid email", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password", success: false });
    }

    const tokenData = {
      userId: user._id,
    }
    const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: "1d" });

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profile: user.profile,
      communitiesJoined: user.communitiesJoined,
      savedPosts: user.savedPosts,
      followers: user.followers,
      following: user.following,
    };

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000
      })
      .json({
        message: `Welcome back ${user.name}`,
        user: userResponse,
        success: true
      });
  }
  catch (error) {
    console.error("Error in login controller: ", error);
    res.status(500).json({ message: "Server error", success: false });
  }
}


// LOGOUT
export const logout = (req, res) => {
  try {
    return res.status(200).clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production"
    }).json({ message: "Logged out successfully", success: true });
  } catch (error) {
    console.error("Error in logout controller: ", error);
    res.status(500).json({ message: "Server error", success: false });
  }
}


// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, profile } = req.body;

    const updatedData = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email.toLowerCase();
    if (phone) updatedData.phone = phone;
    if (profile?.bio) updatedData["profile.bio"] = profile.bio;
    if (profile?.profilePic) updatedData["profile.profilePic"] = profile.profilePic;
    if (profile?.travelledPlaces) updatedData["profile.travelledPlaces"] = profile.travelledPlaces;

    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        message: "No data provided to update",
        success: false
      });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.userId, { $set: updatedData }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser, success: true });


  }
  catch (error) {
    console.error("Error in updateProfile controller: ", error);
    res.status(500).json({ message: "Server error", success: false });
  }
}

// SEARCH USERS
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === "") {
      return res.status(200).json({ users: [], success: true });
    }

    // Escape regex characters to prevent ReDoS
    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, "i");

    const users = await User.find({
      $or: [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
      ]
    }).select("_id name email profile.profilePic");

    res.status(200).json({ users, success: true });
  } catch (error) {
    console.error("Error in searchUsers controller: ", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// GET USER PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .populate("followers", "name profile.profilePic")
      .populate("following", "name profile.profilePic")
      .populate("communitiesJoined", "name location description")
      .populate({
        path: "savedPosts",
        populate: [
          { path: "postedBy", select: "name profile.profilePic" },
          { path: "communityId", select: "name" }
        ]
      });

    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const totalPosts = await Post.countDocuments({ postedBy: id });
    const totalCommunities = await Community.countDocuments({ admin: id });
    
    const uploadedPosts = await Post.find({ postedBy: id })
      .populate("postedBy", "name profile.profilePic")
      .populate("communityId", "name location")
      .populate("likes", "name profile.profilePic")
      .sort({ createdAt: -1 });

    const communitiesCreated = await Community.find({ admin: id })
      .populate("admin", "name profile.profilePic");

    res.status(200).json({
      user,
      stats: {
        totalPosts,
        totalCommunities
      },
      uploadedPosts,
      communitiesCreated,
      success: true
    });
  } catch (error) {
    console.error("Error in getUserProfile controller: ", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// TOGGLE FOLLOW
export const toggleFollow = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const activeUserId = req.user.userId;

    if (targetUserId === activeUserId) {
      return res.status(400).json({ message: "You cannot follow yourself", success: false });
    }

    const activeUser = await User.findById(activeUserId);
    const targetUser = await User.findById(targetUserId);

    if (!activeUser || !targetUser) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const isFollowing = activeUser.following.includes(targetUserId);

    if (isFollowing) {
      activeUser.following = activeUser.following.filter(id => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== activeUserId);
    } else {
      activeUser.following.push(targetUserId);
      targetUser.followers.push(activeUserId);
    }

    await activeUser.save();
    await targetUser.save();

    res.status(200).json({ 
      message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
      isFollowing: !isFollowing,
      success: true 
    });

  } catch (error) {
    console.error("Error in toggleFollow controller: ", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    const user = await User.findById(userId).select("+password");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password", success: false });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully", success: true });

  } catch (error) {
    console.error("Error in changePassword controller: ", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// TOGGLE SAVE POST
export const toggleSavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    const isSaved = user.savedPosts.includes(postId);

    if (isSaved) {
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
    } else {
      user.savedPosts.push(postId);
    }

    await user.save();
    
    res.status(200).json({ 
      message: isSaved ? "Post unsaved" : "Post saved",
      isSaved: !isSaved,
      success: true 
    });

  } catch (error) {
    console.error("Error in toggleSavePost controller: ", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};