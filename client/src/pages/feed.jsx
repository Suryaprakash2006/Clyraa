import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { usePostStore } from "../store/postStore";
import { useCommentStore } from "../store/commentsStore";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";

const Feed = () => {
  const { user } = useAuthStore();
  const { posts, fetchPosts, likePost, createPost } = usePostStore();
  const { comments, fetchComments, addComment, clearComments } = useCommentStore();

  const [activePost, setActivePost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [showLikes, setShowLikes] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  // 🔹 Filter own posts
  const filteredPosts = posts.filter(
    (p) => p.postedBy?._id !== user?._id
  );

  const isLiked = (post) =>
    post.likes?.some((l) => l._id === user?._id);

  const toggleComments = async (postId) => {
    if (activePost === postId) {
      setActivePost(null);
      clearComments();
    } else {
      setActivePost(postId);
      await fetchComments(postId);
    }
  };

  const handleComment = async (postId) => {
    if (!commentText.trim()) return;
    await addComment(postId, commentText.trim());
    setCommentText("");
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim() || !location.trim()) return;

    await createPost(content.trim(), [], location.trim(), null);

    setContent("");
    setLocation("");
  };

  return (
    <div className="bg-[#0f0f0f] min-h-screen py-6">
      <div className="max-w-xl mx-auto space-y-6 px-4">

        {/* 🔹 CREATE POST */}
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share something..."
            className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none mb-3"
          />

          <div className="flex gap-2">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="flex-1 bg-[#0f0f0f] text-white px-3 py-2 rounded-lg border border-gray-700 outline-none"
            />

            <button
              onClick={handleCreatePost}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Post
            </button>
          </div>
        </div>

        {/* 🔹 POSTS */}
        {filteredPosts.map((post) => {
          const liked = isLiked(post);

          return (
            <div
              key={post._id}
              className="bg-[#1a1a1a] border border-gray-800 rounded-xl"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      post.postedBy?.profile?.profilePic ||
                      `https://ui-avatars.com/api/?name=${post.postedBy?.name}`
                    }
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {post.postedBy?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {post.location}
                    </p>
                  </div>
                </div>
                <MoreHorizontal className="text-gray-400" />
              </div>

              {/* CONTENT */}
              <div className="px-4 pb-3">
                <p className="text-gray-200 text-sm leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-6 px-4 pb-3">
                <button
                  onClick={() => likePost(post._id)}
                  className={`transition transform ${
                    liked ? "scale-110 text-red-500" : "text-gray-400"
                  }`}
                >
                  <Heart className={`${liked ? "fill-red-500" : ""}`} />
                </button>

                <button
                  onClick={() => toggleComments(post._id)}
                  className="text-gray-400 hover:text-white"
                >
                  <MessageCircle />
                </button>
              </div>

              {/* 🔥 LIKES COUNT + CLICKABLE */}
              {post.likes?.length > 0 && (
                <div
                  onClick={() => setShowLikes(post._id)}
                  className="px-4 text-sm text-gray-300 pb-2 cursor-pointer hover:text-white"
                >
                  {post.likes.length} like{post.likes.length !== 1 && "s"}
                </div>
              )}

              {/* 🔥 LIKES LIST (LIKE COMMENTS STYLE) */}
              {showLikes === post._id && (
                <div className="px-4 pb-3 space-y-2">
                  {post.likes.map((u) => (
                    <div key={u._id} className="flex items-center gap-2">
                      <img
                        src={
                          u.profile?.profilePic ||
                          `https://ui-avatars.com/api/?name=${u.name}`
                        }
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-gray-300">
                        {u.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* COMMENTS */}
              {activePost === post._id && (
                <div className="border-t border-gray-800 px-4 py-3 space-y-3">

                  {comments.map((c) => (
                    <div key={c._id} className="flex gap-2">
                      <img
                        src={
                          c.userId?.profile?.profilePic ||
                          `https://ui-avatars.com/api/?name=${c.userId?.name}`
                        }
                        className="w-7 h-7 rounded-full"
                      />
                      <div>
                        <span className="text-sm font-semibold text-white">
                          {c.userId?.name}
                        </span>
                        <p className="text-sm text-gray-300">{c.text}</p>
                      </div>
                    </div>
                  ))}

                  {/* COMMENT INPUT */}
                  <div className="flex gap-2 mt-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 bg-[#0f0f0f] text-white px-3 py-2 rounded-lg border border-gray-700 outline-none"
                    />
                    <button
                      onClick={() => handleComment(post._id)}
                      className="text-blue-500 font-semibold"
                    >
                      Post
                    </button>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Feed;