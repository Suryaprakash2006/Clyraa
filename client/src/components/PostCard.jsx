import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { usePostStore } from "../store/postStore";
import { useCommentStore } from "../store/commentsStore";
import { Heart, MessageCircle, MoreHorizontal, MapPin, Send, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const { user, toggleSavePost, updateUserLocal } = useAuthStore();
  const { likePost } = usePostStore();
  const { comments, addComment, deleteComment, updateComment } = useCommentStore();

  const [activePost, setActivePost] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [showLikes, setShowLikes] = useState(false);

  // Check states
  const liked = post.likes?.some((l) => l._id === user?._id);
  const isSaved = user?.savedPosts?.some(id => 
    (typeof id === 'object' ? id._id === post._id : id === post._id)
  );

  const handleComment = async () => {
    if (!commentText.trim()) return;
    await addComment(post._id, commentText.trim());
    setCommentText("");
  };

  const handleDeleteComment = async (commentId) => {
    await deleteComment(post._id, commentId);
  };

  const handleEditComment = (comment) => {
    setEditing(comment._id);
    setEditText(comment.text);
  };

  const handleUpdateComment = async () => {
    await updateComment(post._id, editing, editText);
    setEditing(null);
    setEditText("");
  };

  const handleSaveToggle = async () => {
    try {
      const res = await toggleSavePost(post._id);
      let newSaved = [...(user.savedPosts || [])];
      
      if (res.isSaved) {
        newSaved.push(post._id);
      } else {
        newSaved = newSaved.filter(id => (typeof id === 'object' ? id._id !== post._id : id !== post._id));
      }
      updateUserLocal({ savedPosts: newSaved });
      toast.success(res.message);
    } catch (error) {
      toast.error("Failed to save post");
    }
  };

  const postComments = comments[post._id] || [];

  return (
    <div className="bg-white rounded-[2rem] shadow-lg shadow-gray-200/40 border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 group">
      {/* Post Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <img
              src={post.postedBy?.profile?.profilePic || `https://ui-avatars.com/api/?name=${post.postedBy?.name}`}
              className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-gray-100 group-hover:scale-105 transition-transform cursor-pointer"
              alt="Avatar"
              onClick={() => navigate(`/profile/${post.postedBy?._id}`)}
            />
          </div>
          <div>
            <p 
              className="text-gray-900 text-base font-black tracking-tight flex items-center gap-2 cursor-pointer hover:text-brand-cyan transition-colors"
              onClick={() => navigate(`/profile/${post.postedBy?._id}`)}
            >
              {post.postedBy?.name}
              {post.communityId && (
                <span 
                  onClick={(e) => { e.stopPropagation(); navigate(`/community/${post.communityId._id}`); }}
                  className="bg-brand-fuchsia/10 text-brand-fuchsia text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md hover:bg-brand-fuchsia/20 transition-colors"
                >
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
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50/30">
          <div className="flex gap-6 items-center">
            
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
                  onClick={() => setShowLikes(!showLikes)}
                  className="text-sm font-bold text-gray-600 hover:text-gray-900 cursor-pointer pt-0.5"
                >
                  {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActivePost(!activePost)}
                className="p-2 rounded-full hover:bg-brand-cyan/10 transition-colors group/btn"
              >
                <MessageCircle className={`w-6 h-6 transition-transform group-hover/btn:scale-110 ${activePost ? "text-brand-cyan fill-brand-cyan/20" : "text-gray-400 group-hover/btn:text-brand-cyan"}`} />
              </button>
              <span className="text-sm font-bold text-gray-600 pt-0.5 cursor-pointer" onClick={() => setActivePost(!activePost)}>
                {postComments.length} {postComments.length === 1 ? "comment" : "comments"}
              </span>
            </div>

          </div>

          <div className="flex items-center">
             <button
                onClick={handleSaveToggle}
                className="p-2 rounded-full hover:bg-brand-cyan/10 transition-colors group/btn"
             >
                <Bookmark className={`w-6 h-6 transition-transform group-hover/btn:scale-110 ${isSaved ? "fill-brand-cyan text-brand-cyan" : "text-gray-400 group-hover/btn:text-brand-cyan"}`} />
             </button>
          </div>
        </div>

        {/* Expandable Likes View */}
        <div className={`transition-all duration-300 overflow-hidden ${showLikes ? "max-h-40 border-t border-gray-100/50" : "max-h-0"}`}>
          <div className="px-6 py-4 bg-white flex flex-wrap gap-2 overflow-y-auto max-h-40">
            {post.likes?.map((u, index) => {
              const uId = u._id || u;
              const uName = u.name || "Traveler";
              const uPic = u.profile?.profilePic || `https://ui-avatars.com/api/?name=${uName}`;
              
              return (
                <div key={uId || index} onClick={() => navigate(`/profile/${uId}`)} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <img
                    src={uPic}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-xs font-bold text-gray-700">{uName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expandable Comments View */}
        <div className={`transition-all duration-500 overflow-hidden bg-gray-50/50 ${activePost ? "max-h-[600px] border-t border-gray-100" : "max-h-0"}`}>
          <div className="flex flex-col h-full max-h-[400px]">
            {/* Comments List */}
            <div className="overflow-y-auto p-6 space-y-5 flex-1 custom-scrollbar">
              {postComments.length === 0 ? (
                <p className="text-center text-sm font-medium text-gray-400 py-4">No comments yet. Start the conversation!</p>
              ) : (
                postComments.map((c) => {
                  const isOwner = c.userId?._id === user?._id;
                  return (
                    <div key={c._id} className="flex gap-3 group/comment">
                      <img
                        src={c.userId?.profile?.profilePic || `https://ui-avatars.com/api/?name=${c.userId?.name}`}
                        className="w-8 h-8 rounded-full shadow-sm cursor-pointer"
                        onClick={() => navigate(`/profile/${c.userId?._id}`)}
                      />
                      <div className="flex-1">
                        <div className="bg-white border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] px-4 py-3 rounded-2xl rounded-tl-sm inline-block min-w-[60%]">
                          <span 
                            className="text-brand-cyan text-xs font-black block mb-1 tracking-tight cursor-pointer hover:underline"
                            onClick={() => navigate(`/profile/${c.userId?._id}`)}
                          >
                            {c.userId?.name}
                          </span>

                          {editing === c._id ? (
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
                            <button onClick={() => handleEditComment(c)} className="hover:text-brand-cyan">Edit</button>
                            <button onClick={() => handleDeleteComment(c._id)} className="hover:text-red-500">Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Comment Input */}
            <div className="p-4 bg-white border-t border-gray-100 flex gap-3 items-center sticky bottom-0 z-10">
              <div className="flex-1 relative">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleComment() }}
                  placeholder="Add a comment..."
                  className="w-full bg-gray-50 text-gray-800 px-5 py-3 rounded-full border border-gray-200 focus:outline-none focus:bg-white focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan pr-12 transition-all shadow-inner text-sm font-medium"
                />
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim()}
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
}
