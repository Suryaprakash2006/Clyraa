import User from "../models/User.js";
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