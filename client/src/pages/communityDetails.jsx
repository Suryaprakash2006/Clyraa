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
      <div className="relative w-full h-80 lg:h-96 rounded-b-3xl overflow-hidden shadow-2xl">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg" 
          alt="Community Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>
        
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-6 left-6 p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="absolute bottom-0 left-0 w-full p-6 lg:p-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="text-white space-y-3 max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight drop-shadow-lg">{currentCommunity.name}</h1>
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1 bg-brand-cyan/20 px-3 py-1 rounded-full border border-brand-cyan/30 backdrop-blur-sm">
                <MapPin className="w-4 h-4 text-brand-cyan" /> {currentCommunity.location}
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
                <Users className="w-4 h-4" /> Community
              </span>
            </div>
            <p className="text-gray-200 mt-2 text-base lg:text-lg opacity-90">{currentCommunity.description}</p>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={handleJoin}
              disabled={isMember}
              className={`px-8 py-3 rounded-full font-bold text-lg transition-all shadow-lg backdrop-blur-md ${
                isMember
                  ? 'bg-white/10 text-white cursor-not-allowed border border-white/20'
                  : 'bg-brand-cyan text-white hover:bg-brand-cyan/90 hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]'
              }`}
            >
              {isMember ? 'Joined' : 'Join Community'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Posts */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 border-l-4 border-brand-cyan pl-3">Community Posts</h2>
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
