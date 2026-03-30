import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { usePostStore } from "../store/postStore";
import { useCommentStore } from "../store/commentsStore";
import { CirclePlus, Heart, MessageCircle, MoreHorizontal } from "lucide-react";

const Feed = () => {
  const { user } = useAuthStore();
  const { posts, fetchPosts, likePost, createPost } = usePostStore();
  const {
    comments,
    fetchComments,
    addComment,
    deleteComment,
    updateComment,
  } = useCommentStore();

  const [activePost, setActivePost] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [showLikes, setShowLikes] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  // Filter own posts
  const filteredPosts = posts.filter(
    (p) => p.postedBy?._id !== user?._id
  );

  // Fetch comments once per post
  useEffect(() => {
    posts.forEach((post) => {
      if (!comments[post._id]) {
        fetchComments(post._id);
      }
    });
  }, [posts]);

  const isLiked = (post) =>
    post.likes?.some((l) => l._id === user?._id);

  // Add comment
  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text || !text.trim()) return;

    await addComment(postId, text.trim());

    setCommentText((prev) => ({
      ...prev,
      [postId]: "",
    }));
  };

  // Delete comment
  const handleDeleteComment = async (postId, commentId) => {
    await deleteComment(postId, commentId);
  };

  // Start edit
  const handleEditComment = (postId, comment) => {
    setEditing({ postId, commentId: comment._id });
    setEditText(comment.text);
  };

  // Update comment
  const handleUpdateComment = async () => {
    console.log(editing.postId, editing.commentId, editText);
    await updateComment(editing.postId, editing.commentId, editText);
    setEditing(null);
    setEditText("");
  };

  // Create post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim() || !location.trim()) return;

    await createPost(content.trim(), [], location.trim(), null);
    setContent("");
    setLocation("");
  };

  return (
    <div className="min-h-screen py-6">
      <div className="flex gap-6 w-full px-2 lg:px-6">

        {/* ADD Post */}
        <div className="h-fit sticky top-24 hidden lg:block lg:w-[30%] bg-white rounded-t-3xl rounded-b-lg p-4 self-start">
          <div className="flex items-center justify-center gap-2 p-2 mb-4 bg-brand-cyan rounded-3xl">
            <CirclePlus className="w-6 h-6 text-white" />
            <span className="text-white text-xl font-semibold">
              Add Post
            </span>
          </div>

          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            placeholder="Share something..."
            rows={1}
            className="w-full text-black mb-3 border border-gray-300 rounded-sm px-3 py-2 resize-none"
          />

          <div className="flex gap-2">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="flex-1 text-black px-3 py-2 rounded-lg border border-gray-700"
            />
            <button
              onClick={handleCreatePost}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Post
            </button>
          </div>
        </div>

        {/* Post Cards */}
        <div className="flex-1 space-y-6">
          {filteredPosts.map((post) => {
            const liked = isLiked(post);

            return (
              <div
                key={post._id}
                className=" border bg-white rounded-sm rounded-tl-3xl overflow-hidden lg:flex lg:h-[500px]"
              >

                {/* Post */}
                <div className="lg:w-[65%] flex flex-col">

                  <div className="flex items-center justify-between p-4">
                    <div className="flex gap-3 items-center">
                      <img
                        src={
                          post.postedBy?.profile?.profilePic ||
                          `https://ui-avatars.com/api/?name=${post.postedBy?.name}`
                        }
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="text-black text-sm font-semibold">
                          {post.postedBy?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {post.location}
                        </p>
                      </div>
                    </div>
                    <MoreHorizontal className="text-gray-400" />
                  </div>

                  <div className="px-4 pb-3 text-gray-900 text-sm">
                    {post.content}
                  </div>

                  <div className="flex-1 bg-gray-700">
                    {post.images.length > 0 && (
                      <img
                        src={post.images[0]}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Comment Section */}
                <div className="lg:w-[35%] flex flex-col border-gray-800">
                  <div className="flex gap-6 px-4 pt-4 items-center">
                    <div className="flex items-center gap-2">
                      <button onClick={() => likePost(post._id)}>
                        <Heart
                          className={`${liked ? "fill-red-500 text-red-500" : "text-gray-400"
                            }`}
                        />
                      </button>

                      {/* LIKES */}
                      {post.likes?.length > 0 && (
                        <div
                          onClick={() =>
                            setShowLikes(
                              showLikes === post._id ? null : post._id
                            )
                          }
                          className="text-sm text-gray-800 py-2 cursor-pointer"
                        >
                          {post.likes.length} likes
                        </div>
                      )}
                    </div>

                    {/* MOBILE ONLY */}
                    <MessageCircle
                      onClick={() =>
                        setActivePost(
                          activePost === post._id ? null : post._id
                        )
                      }
                      className="text-gray-400 lg:hidden"
                    />
                  </div>



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

                          <span className="text-sm text-gray-800">
                            {u.name}
                          </span>

                        </div>
                      ))}
                    </div>
                  )}

                  {/* COMMENTS */}
                  <div
                    className={`border-t px-4 py-3 space-y-3 flex-1 overflow-y-auto 
  ${activePost === post._id ? "block" : "hidden"} lg:block`}
                  >

                    <div className="flex border-b border-gray-800 pb-3">
                      <input
                        value={commentText[post._id] || ""}
                        onChange={(e) =>
                          setCommentText({
                            ...commentText,
                            [post._id]: e.target.value,
                          })
                        }
                        placeholder="Write a comment..."
                        className="flex-1 bg-white text-black px-2 py-1 rounded-s-3xl border border-brand-cyan focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan"
                      />
                      <button
                        onClick={() => handleComment(post._id)}
                        className="text-white bg-brand-cyan px-2 rounded-r-3xl"
                      >
                        Post
                      </button>
                    </div>

                    {/* COMMENTS LIST */}
                    {(comments[post._id] || []).map((c) => {
                      const isOwner = c.userId?._id === user?._id;

                      return (
                        <div key={c._id} className="flex gap-2">

                          <img
                            src={
                              c.userId?.profile?.profilePic ||
                              `https://ui-avatars.com/api/?name=${c.userId?.name}`
                            }
                            className="w-7 h-7 rounded-full"
                          />

                          <div className="flex-1">
                            <div className="bg-[#caf0f8] px-2 py-1 rounded-sm">

                              <span className="text-[#03045e] text-sm font-semibold">
                                {c.userId?.name}
                              </span>

                              {editing?.commentId === c._id ? (
                                <>
                                  <input
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full mt-1 px-2 py-1 bg-black text-white rounded"
                                  />
                                  <div className="flex gap-2 text-xs mt-1">
                                    <button
                                      onClick={handleUpdateComment}
                                      className="text-blue-400"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditing(null)}
                                      className="text-gray-400"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <p className="text-[#0077b6] text-sm">{c.text}</p>
                              )}
                            </div>

                            {isOwner && (
                              <div className="flex gap-3 text-xs mt-1 text-gray-400">
                                <button onClick={() => handleEditComment(post._id, c)}>
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteComment(post._id, c._id)
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  </div>


                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Feed;