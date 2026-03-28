import Comment from "../models/Comment.js";

// ADD COMMENT
export const addComment = async (req, res) => {
  try {

    const { postId, text } = req.body;

    if (!text) {
      return res.status(400).json({
        message: "Comment text is required",
        success: false
      });
    }

    const newComment = new Comment({
      postId,
      userId: req.user.userId,
      text
    });

    await newComment.save();

    await newComment.populate("userId", "name profile.profilePic");
    res.status(201).json({
      message: "Comment added",
      comment: newComment,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// GET COMMENTS OF A POST
export const getPostComments = async (req, res) => {
  try {

    const { postId } = req.params;

    const comments = await Comment.find({ postId })
      .populate("userId", "name profile.profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      comments,
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// DELETE COMMENT
export const deleteComment = async (req, res) => {
  try {

    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
        success: false
      });
    }

    if (comment.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Not allowed",
        success: false
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      message: "Comment deleted",
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// UPDATE COMMENT
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        message: "Comment text is required",
        success: false
      });
    }
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
        success: false
      });
    }

    if (comment.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Not allowed",
        success: false
      });
    }

    comment.text = text;
    await comment.save();
    res.status(200).json({
      message: "Comment updated",
      comment,
      success: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};