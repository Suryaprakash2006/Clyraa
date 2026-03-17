import Message from "../models/Message.js";

export const getMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const messages = await Message.find({ groupId })
      .populate("senderId", "name profile.profilePic")
      .sort({ createdAt: 1 }); // oldest → newest

    res.status(200).json(messages);

  } catch (error) {
    console.log("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};