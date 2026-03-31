import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCommunityStore } from "../store/communityStore";
import { usePostStore } from "../store/postStore";
import { useCommentStore } from "../store/commentsStore";
import { useAuthStore } from "../store/authStore";
import { MapPin, Users, ArrowLeft, Heart, MessageCircle, MoreHorizontal } from "lucide-react";

const CommunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { currentCommunity, fetchCommunityById, joinCommunity, isLoading: isCommLoading } = useCommunityStore();
  const { posts, fetchPostsByCommunity, likePost, isLoading: isPostsLoading } = usePostStore();
  const { comments, fetchComments, addComment, deleteComment, updateComment } = useCommentStore();

  const [activePost, setActivePost] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [showLikes, setShowLikes] = useState(null);

  useEffect(() => {
    fetchCommunityById(id);
    fetchPostsByCommunity(id);
  }, [id, fetchCommunityById, fetchPostsByCommunity]);

  // Fetch comments once per post
  useEffect(() => {
    if (posts && posts.length > 0) {
      posts.forEach((post) => {
        if (!comments[post._id]) {
          fetchComments(post._id);
        }
      });
    }
  }, [posts, comments, fetchComments]);

  if (isCommLoading || !currentCommunity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-400 animate-pulse">Loading Community details...</div>
      </div>
    );
  }

  const isMember = user?.communitiesJoined?.includes(currentCommunity._id) || currentCommunity.admin?._id === user?._id;

  const handleJoin = async () => {
    if (isMember) return;
    await joinCommunity(currentCommunity._id);
    useAuthStore.getState().updateUserLocal({
      communitiesJoined: [...(user.communitiesJoined || []), currentCommunity._id]
    });
    fetchCommunityById(id);
  };

  const isLiked = (post) => post.likes?.some((l) => l._id === user?._id);

  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text || !text.trim()) return;
    await addComment(postId, text.trim());
    setCommentText((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleDeleteComment = async (postId, commentId) => {
    await deleteComment(postId, commentId);
  };

  const handleEditComment = (postId, comment) => {
    setEditing({ postId, commentId: comment._id });
    setEditText(comment.text);
  };

  const handleUpdateComment = async () => {
    await updateComment(editing.postId, editing.commentId, editText);
    setEditing(null);
    setEditText("");
  };

  return (
    <div className="min-h-screen pb-12 animate-in fade-in duration-500">
      {/* Banner Section */}
      <div className="relative w-full rounded-b-3xl overflow-hidden shadow-2xl">
  {/* Image with subtle zoom on hover */}
  <div className="relative w-full h-72 sm:h-80 lg:h-[26rem] group">
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg"
      alt="Community Banner"
      className="w-full h-full object-cover scale-[1.04] group-hover:scale-100 transition-transform duration-[6000ms] ease-out"
    />

    {/* Richer gradient: vertical depth + side vignette */}
    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.55)_40%,rgba(0,0,0,0.15)_70%,rgba(0,0,0,0.1)_100%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.3)_0%,transparent_30%,transparent_70%,rgba(0,0,0,0.25)_100%)]" />

    {/* Back button */}
    <button
      onClick={() => navigate(-1)}
      className="absolute top-5 left-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white hover:bg-white/20 hover:-translate-x-0.5 hover:shadow-lg transition-all duration-200 z-10"
    >
      <ArrowLeft className="w-[18px] h-[18px]" />
    </button>

    {/* Bottom content */}
    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 lg:p-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6">

      {/* Text block */}
      <div className="text-white flex-1 min-w-0 space-y-2.5">

        {/* Eyebrow breadcrumb */}
        <div className="flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-white/40">
          <span>Explore</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span>Communities</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span>Culture & Heritage</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] drop-shadow-xl truncate">
          {currentCommunity.name}
        </h1>

        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="inline-flex items-center gap-1.5 bg-brand-cyan/15 px-3 py-1 rounded-full border border-brand-cyan/35 backdrop-blur-sm text-brand-cyan text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5" /> {currentCommunity.location}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm text-white/80 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" /> Community
          </span>
        </div>

        <p className="text-sm sm:text-base text-gray-200/85 leading-relaxed max-w-xl line-clamp-2">
          {currentCommunity.description}
        </p>
      </div>

      {/* Join button */}
      <div className="flex-shrink-0 flex flex-col items-start sm:items-end gap-1.5">
        <button
          onClick={handleJoin}
          disabled={isMember}
          className={`relative overflow-hidden px-7 py-2.5 rounded-full font-bold text-sm sm:text-base tracking-wide transition-all duration-200
            ${isMember
              ? 'bg-white/10 text-white/70 cursor-not-allowed border border-white/20 backdrop-blur-md'
              : 'bg-brand-cyan text-white hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-[0_6px_28px_rgba(34,211,238,0.45),0_0_0_3px_rgba(34,211,238,0.15)] active:scale-100'
            }`}
        >
          {/* Shimmer on hover */}
          {!isMember && (
            <span className="absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.25)_50%,transparent_60%)] -translate-x-full hover:translate-x-full transition-transform duration-500 pointer-events-none" />
          )}
          {isMember ? '✓ Joined' : 'Join Community'}
        </button>
      </div>
    </div>
  </div>
</div>

      {/* Main Content: Posts */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white dark:text-brand-cyan border-l-4 border-brand-cyan pl-3">Community Posts</h2>
          <span className="text-slate-500 font-medium">{posts.length} {posts.length === 1 ? 'Post' : 'Posts'}</span>
        </div>

        {isPostsLoading ? (
            <div className="text-center py-20 text-slate-400">Loading posts...</div>
        ) : posts.length === 0 ? (
            <div className="bg-white shadow-sm p-16 rounded-3xl text-center border border-gray-100">
                <div className="inline-flex items-center justify-center p-4 bg-brand-cyan/10 rounded-full mb-4">
                  <MessageCircle className="w-8 h-8 text-brand-cyan" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Posts Yet</h3>
                <p className="text-gray-500">Be the first to start a conversation in this community!</p>
            </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {posts.map((post) => {
              const liked = isLiked(post);

              return (
                <div
                  key={post._id}
                  className="bg-white shadow-md border border-gray-100 rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-50">
                    <div className="flex gap-3 items-center">
                      <img
                        src={post.postedBy?.profile?.profilePic || `https://ui-avatars.com/api/?name=${post.postedBy?.name}`}
                        className="w-10 h-10 rounded-full border border-gray-200"
                        alt="Author"
                      />
                      <div>
                        <p className="text-gray-900 text-sm font-bold">{post.postedBy?.name}</p>
                        <p className="text-xs text-gray-400">{post.location}</p>
                      </div>
                    </div>
                    <MoreHorizontal className="text-gray-400 cursor-pointer" />
                  </div>

                  <div className="px-5 py-4 text-gray-700 text-sm leading-relaxed">
                    {post.content}
                  </div>

                  {post.images && post.images.length > 0 && (
                    <div className="w-full h-64 bg-gray-100 overflow-hidden">
                      <img src={post.images[0]} className="w-full h-full object-cover" alt="Post Request" />
                    </div>
                  )}

                  {/* Interactivity Area */}
                  <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={() => likePost(post._id)} className="flex items-center gap-1.5 group">
                        <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${liked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                        <span className="text-sm font-medium text-gray-600 group-hover:text-red-500 transition-colors">{post.likes?.length || 0}</span>
                      </button>
                      <button 
                        onClick={() => setActivePost(activePost === post._id ? null : post._id)} 
                        className="flex items-center gap-1.5 group"
                      >
                        <MessageCircle className="w-5 h-5 text-gray-400 transition-transform group-hover:scale-110 group-hover:text-brand-cyan" />
                        <span className="text-sm font-medium text-gray-600 group-hover:text-brand-cyan transition-colors">{(comments[post._id] || []).length}</span>
                      </button>
                    </div>
                  </div>

                  {/* Comments Section Toggle */}
                  <div className={`border-t border-gray-50 flex-1 overflow-hidden transition-all duration-300 ${activePost === post._id ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="p-4 bg-gray-50 h-full flex flex-col">
                      <div className="flex-1 overflow-y-auto space-y-3 max-h-48 mb-3 pr-2 custom-scrollbar">
                        {(comments[post._id] || []).map((c) => {
                          const isOwner = c.userId?._id === user?._id;
                          return (
                            <div key={c._id} className="flex gap-2.5">
                              <img
                                src={c.userId?.profile?.profilePic || `https://ui-avatars.com/api/?name=${c.userId?.name}`}
                                className="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0"
                                alt="Commenter"
                              />
                              <div className="flex-1">
                                <div className="bg-white px-3 py-2 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                                  <span className="text-brand-cyan text-xs font-bold block mb-0.5">{c.userId?.name}</span>
                                  {editing?.commentId === c._id ? (
                                    <div className="mt-1">
                                      <input
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="w-full px-2 py-1 bg-gray-100 text-gray-800 rounded border border-brand-cyan outline-none text-sm"
                                        autoFocus
                                      />
                                      <div className="flex gap-3 text-xs mt-2 font-medium">
                                        <button onClick={handleUpdateComment} className="text-brand-cyan hover:underline">Save</button>
                                        <button onClick={() => setEditing(null)} className="text-gray-500 hover:underline">Cancel</button>
                                      </div>
                                    </div>
                                  ) : (
                                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{c.text}</p>
                                  )}
                                </div>
                                {isOwner && !editing && (
                                  <div className="flex gap-3 text-xs mt-1 ml-2 font-medium text-gray-400">
                                    <button onClick={() => handleEditComment(post._id, c)} className="hover:text-brand-cyan transition-colors">Edit</button>
                                    <button onClick={() => handleDeleteComment(post._id, c._id)} className="hover:text-red-500 transition-colors">Delete</button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {(comments[post._id] || []).length === 0 && (
                          <div className="text-center text-sm text-gray-400 py-4">No comments yet.</div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          value={commentText[post._id] || ""}
                          onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                          placeholder="Write a comment..."
                          className="flex-1 bg-white text-gray-800 px-4 py-2 text-sm rounded-full border border-gray-200 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-shadow shadow-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleComment(post._id);
                          }}
                        />
                        <button
                          onClick={() => handleComment(post._id)}
                          disabled={!commentText[post._id]?.trim()}
                          className="text-white bg-brand-cyan px-4 py-2 rounded-full text-sm font-semibold hover:bg-brand-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityDetails;
