import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { usePostStore } from "../store/postStore";
import { useCommentStore } from "../store/commentsStore";
import { useCommunityStore } from "../store/communityStore";
import { CirclePlus, Heart, MessageCircle, MoreHorizontal, MapPin, Search, Send, Image as ImageIcon, Users, ChevronDown, Check } from "lucide-react";

const Feed = () => {
  const { user } = useAuthStore();
  const { posts, fetchPosts, likePost, createPost } = usePostStore();
  const { communities, fetchCommunities } = useCommunityStore();
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

  // Create Post State
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [showLikes, setShowLikes] = useState(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchCommunities();
  }, [fetchPosts, fetchCommunities]);

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
  }, [posts, comments, fetchComments]);

  const isLiked = (post) =>
    post.likes?.some((l) => l._id === user?._id);

  // Add comment
  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text || !text.trim()) return;

    await addComment(postId, text.trim());
    setCommentText((prev) => ({ ...prev, [postId]: "" }));
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
    await updateComment(editing.postId, editing.commentId, editText);
    setEditing(null);
    setEditText("");
  };

  // Create post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim() || !location.trim()) return;

    // Use selectedCommunity if it's set
    const commId = selectedCommunity || null;

    await createPost(content.trim(), [], location.trim(), commId);
    setContent("");
    setLocation("");
    setSelectedCommunity("");
  };

  // User's available communities for posting
  const availableCommunities = communities.filter(c =>
    c.admin?._id === user?._id || user?.communitiesJoined?.includes(c._id)
  );

  return (
    <div className="min-h-screen py-8 animate-in fade-in duration-500 bg-gray-50 dark:bg-dark-bg/50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col lg:flex-row gap-8">

        {/* Left Column: ADD Post */}
        <div className="lg:w-[35%] xl:w-[30%] flex-shrink-0">
          <div className="sticky top-28 bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100/50">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-brand-cyan/10 rounded-xl">
                <CirclePlus className="w-6 h-6 text-brand-cyan" />
              </div>
              Share Your Journey
            </h2>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                placeholder="What's on your mind? Did you find a hidden gem?"
                className="w-full text-gray-800 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 resize-none focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:bg-white transition-all min-h-[100px]"
              />

              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-5 py-3 border border-gray-100 focus-within:ring-2 focus-within:ring-brand-cyan/30 focus-within:bg-white transition-all">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where are you?"
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 font-medium"
                />
              </div>

              <div 
                className="relative flex items-center gap-3 bg-gray-50 rounded-2xl px-5 py-3 border border-gray-100 focus-within:ring-2 focus-within:ring-brand-cyan/30 focus-within:bg-white transition-all cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}
                ref={dropdownRef}
              >
                <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />

                <div className="flex-1 text-gray-800 font-medium select-none">
                  {selectedCommunity ? availableCommunities.find(c => c._id === selectedCommunity)?.name || "Post to Public Feed" : "Post to Public Feed"}
                </div>

                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />

                {/* Styled Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-60 overflow-y-auto">
                      <div 
                        onClick={() => setSelectedCommunity("")}
                        className={`px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${!selectedCommunity ? 'bg-brand-cyan/5 text-brand-cyan font-bold' : 'text-gray-700 font-medium'}`}
                      >
                        Post to Public Feed
                        {!selectedCommunity && <Check className="w-4 h-5" />}
                      </div>
                      
                      {availableCommunities.map((c) => (
                        <div 
                          key={c._id}
                          onClick={() => setSelectedCommunity(c._id)}
                          className={`px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-t border-gray-50 ${selectedCommunity === c._id ? 'bg-brand-cyan/5 text-brand-cyan font-bold' : 'text-gray-700 font-medium'}`}
                        >
                          <span className="truncate">{c.name}</span>
                          {selectedCommunity === c._id && <Check className="w-4 h-5 flex-shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button type="button" className="p-3 text-brand-cyan hover:bg-brand-cyan/10 rounded-full transition-colors hidden lg:block">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!content.trim() || !location.trim()}
                  className="w-full lg:w-auto bg-brand-cyan text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-brand-cyan/30 hover:bg-brand-cyan/90 hover:shadow-brand-cyan/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex justify-center items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Publish
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Post Cards */}
        <div className="flex-1 space-y-8">
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No posts yet</h3>
              <p className="text-gray-500">Wait for other travelers to share their experiences.</p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const liked = isLiked(post);

              return (
                <div
                  key={post._id}
                  className="bg-white rounded-[2rem] shadow-lg shadow-gray-200/40 border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 group"
                >
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-6 pb-4">
                    <div className="flex gap-4 items-center">
                      <div className="relative">
                        <img
                          src={post.postedBy?.profile?.profilePic || `https://ui-avatars.com/api/?name=${post.postedBy?.name}`}
                          className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-gray-100 group-hover:scale-105 transition-transform"
                          alt="Avatar"
                        />
                      </div>
                      <div>
                        <p className="text-gray-900 text-base font-black tracking-tight flex items-center gap-2">
                          {post.postedBy?.name}
                          {post.communityId && (
                            <span className="bg-brand-fuchsia/10 text-brand-fuchsia text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md">
                              {post.communityId.name}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-brand-cyan font-bold flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5" /> {post.location}
                        </p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="px-6 pb-5 text-gray-700 text-base leading-relaxed whitespace-pre-line">
                    {post.content}
                  </div>

                  {/* Post Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="w-full h-[400px] lg:h-[500px] bg-gray-100 overflow-hidden relative">
                      <img
                        src={post.images[0]}
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                        alt="Post Media"
                      />
                    </div>
                  )}

                  {/* Post Actions & Comments Area */}
                  <div className="flex flex-col border-t border-gray-50/50 relative">
                    {/* Action Bar */}
                    <div className="flex gap-6 px-6 py-4 items-center bg-gray-50/30">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => likePost(post._id)}
                          className="p-2 rounded-full hover:bg-red-50 transition-colors group/btn"
                        >
                          <Heart
                            className={`w-6 h-6 transition-transform group-hover/btn:scale-110 ${liked ? "fill-red-500 text-red-500" : "text-gray-400 group-hover/btn:text-red-400"}`}
                          />
                        </button>
                        {post.likes?.length > 0 && (
                          <span
                            onClick={() => setShowLikes(showLikes === post._id ? null : post._id)}
                            className="text-sm font-bold text-gray-600 hover:text-gray-900 cursor-pointer pt-0.5"
                          >
                            {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActivePost(activePost === post._id ? null : post._id)}
                          className="p-2 rounded-full hover:bg-brand-cyan/10 transition-colors group/btn"
                        >
                          <MessageCircle className={`w-6 h-6 transition-transform group-hover/btn:scale-110 ${activePost === post._id ? "text-brand-cyan fill-brand-cyan/20" : "text-gray-400 group-hover/btn:text-brand-cyan"}`} />
                        </button>
                        <span className="text-sm font-bold text-gray-600 pt-0.5 cursor-pointer" onClick={() => setActivePost(activePost === post._id ? null : post._id)}>
                          {(comments[post._id] || []).length} {(comments[post._id] || []).length === 1 ? "comment" : "comments"}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Likes View */}
                    <div className={`transition-all duration-300 overflow-hidden ${showLikes === post._id ? "max-h-40 border-t border-gray-100/50" : "max-h-0"}`}>
                      <div className="px-6 py-4 bg-white flex flex-wrap gap-2 overflow-y-auto max-h-40">
                        {post.likes?.map((u) => (
                          <div key={u._id} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-default">
                            <img
                              src={u.profile?.profilePic || `https://ui-avatars.com/api/?name=${u.name}`}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="text-xs font-bold text-gray-700">{u.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expandable Comments View */}
                    <div className={`transition-all duration-500 overflow-hidden bg-gray-50/50 ${activePost === post._id ? "max-h-[600px] border-t border-gray-100" : "max-h-0"}`}>
                      <div className="flex flex-col h-full max-h-[400px]">
                        {/* Comments List */}
                        <div className="overflow-y-auto p-6 space-y-5 flex-1 custom-scrollbar">
                          {(comments[post._id] || []).length === 0 ? (
                            <p className="text-center text-sm font-medium text-gray-400 py-4">No comments yet. Start the conversation!</p>
                          ) : (
                            (comments[post._id] || []).map((c) => {
                              const isOwner = c.userId?._id === user?._id;
                              return (
                                <div key={c._id} className="flex gap-3 group/comment">
                                  <img
                                    src={c.userId?.profile?.profilePic || `https://ui-avatars.com/api/?name=${c.userId?.name}`}
                                    className="w-8 h-8 rounded-full shadow-sm"
                                  />
                                  <div className="flex-1">
                                    <div className="bg-white border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] px-4 py-3 rounded-2xl rounded-tl-sm inline-block min-w-[60%]">
                                      <span className="text-brand-cyan text-xs font-black block mb-1 tracking-tight">
                                        {c.userId?.name}
                                      </span>

                                      {editing?.commentId === c._id ? (
                                        <div className="mt-2">
                                          <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="w-full p-2 bg-gray-50 text-gray-800 rounded-lg min-h-[60px] resize-none outline-none focus:ring-2 focus:ring-brand-cyan/50 border border-gray-200 text-sm"
                                          />
                                          <div className="flex gap-4 text-xs mt-2 font-bold">
                                            <button onClick={handleUpdateComment} className="text-brand-cyan hover:text-brand-cyan/80">Save</button>
                                            <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">Cancel</button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-gray-700 text-sm">{c.text}</p>
                                      )}
                                    </div>

                                    {isOwner && !editing && (
                                      <div className="flex gap-4 text-[11px] font-bold mt-1.5 ml-2 text-gray-400 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditComment(post._id, c)} className="hover:text-brand-cyan">Edit</button>
                                        <button onClick={() => handleDeleteComment(post._id, c._id)} className="hover:text-red-500">Delete</button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Add Comment Input */}
                        <div className="p-4 bg-white border-t border-gray-100 flex gap-3 items-center sticky bottom-0">
                          <div className="flex-1 relative">
                            <input
                              value={commentText[post._id] || ""}
                              onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleComment(post._id) }}
                              placeholder="Add a comment..."
                              className="w-full bg-gray-50 text-gray-800 px-5 py-3 rounded-full border border-gray-200 focus:outline-none focus:bg-white focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan pr-12 transition-all shadow-inner text-sm font-medium"
                            />
                            <button
                              onClick={() => handleComment(post._id)}
                              disabled={!commentText[post._id]?.trim()}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-cyan text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-cyan/90 transition-colors shadow-sm"
                            >
                              <Send className="w-3.5 h-3.5 -translate-x-[1px] translate-y-[1px]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;