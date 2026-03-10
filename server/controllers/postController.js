import Post from "../models/Post.js";


// CREATE POST
export const createPost = async (req, res) => {
  try {

    const { content, images, location, communityId } = req.body;

    if (!content || !location) {
      return res.status(400).json({
        message: "Content and location are required",
        success: false
      });
    }

    const newPost = new Post({
      postedBy: req.user.userId,
      content,
      images,
      location,
      communityId
    });

    await newPost.save();

    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
      success: true
    });

  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};



// GET ALL POSTS (feed)
export const getPosts = async (req, res) => {
  try {

    const posts = await Post.find()
      .populate("postedBy", "name profile.profilePic")
      .populate("communityId", "name location")
      .sort({ createdAt: -1 });  // latest posts first if we sort by createdAt in descending order else it will be in ascending order (oldest posts first)

    res.status(200).json({
      posts,
      success: true
    });

  } catch (error) {
    console.error("Get Posts Error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};



// GET SINGLE POST
export const getSinglePost = async (req, res) => {
  try {

    const { id } = req.params;

    const post = await Post.findById(id)
      .populate("postedBy", "name profile.profilePic");

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false
      });
    }

    res.status(200).json({
      post,
      success: true
    });

  } catch (error) {
    console.error("Get Post Error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};



// UPDATE POST
export const updatePost = async (req, res) => {
  try {

    const { id } = req.params;
    const { content, images, location } = req.body;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false
      });
    }

    // only owner can edit
    if (post.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to edit this post",
        success: false
      });
    }

    if (content) post.content = content;
    if (images) post.images = images;
    if (location) post.location = location;

    await post.save();

    res.status(200).json({
      message: "Post updated successfully",
      post,
      success: true
    });

  } catch (error) {
    console.error("Update Post Error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};



// DELETE POST
export const deletePost = async (req, res) => {
  try {

    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false
      });
    }

    if (post.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to delete this post",
        success: false
      });
    }

    await post.deleteOne();

    res.status(200).json({
      message: "Post deleted successfully",
      success: true
    });

  } catch (error) {
    console.error("Delete Post Error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};



// LIKE / UNLIKE POST
export const likePost = async (req, res) => {
  try {

    const { id } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false
      });
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // unlike
      post.likes = post.likes.filter(
        (like) => like.toString() !== userId
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likes: post.likes.length,
      success: true
    });

  } catch (error) {
    console.error("Like Post Error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};