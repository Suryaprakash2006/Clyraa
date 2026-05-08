import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { usePostStore } from "../store/postStore";
import { useCommunityStore } from "../store/communityStore";
import { useCommentStore } from "../store/commentsStore";
import { CirclePlus, Heart, MessageCircle, MoreHorizontal, MapPin, Search, Send, Image as ImageIcon, Users, ChevronDown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import toast from "react-hot-toast";

const Feed = () => {
  const { user } = useAuthStore();
  const { posts, fetchPosts, likePost, createPost } = usePostStore();
  const { communities, fetchCommunities } = useCommunityStore();
  const { comments, fetchComments } = useCommentStore();

  // Create Post State
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [showLikes, setShowLikes] = useState(null);

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await api.get(`/auth/search?q=${searchQuery}`);
        setSearchResults(res.data.users);
      } catch (error) {
        console.error("Search failed");
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
          <div className="sticky top-28 space-y-6 z-30">
            
            {/* Search Box */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100/50 relative">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Find other travelers..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 text-gray-800 rounded-2xl pl-12 pr-4 py-3 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 font-medium text-sm transition-all"
                />
              </div>

              {/* Search Results Dropdown */}
              {searchQuery && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-100 overflow-hidden max-h-64 overflow-y-auto z-40 custom-scrollbar">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm font-bold text-gray-400 animate-pulse">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(u => (
                      <div 
                        key={u._id} 
                        onClick={() => navigate(`/profile/${u._id}`)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-colors"
                      >
                        <img src={u.profile?.profilePic || `https://ui-avatars.com/api/?name=${u.name}`} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                        <div className="flex-1">
                          <p className="text-sm font-black text-gray-800 leading-tight block">{u.name}</p>
                          <p className="text-xs font-medium text-gray-500 truncate mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm font-medium text-gray-400">No travelers found.</div>
                  )}
                </div>
              )}
            </div>

            {/* Create Post Form */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100/50">
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
                <button onClick={() => toast.error("This feature will be available shortly.")} type="button" className="p-3 text-brand-cyan hover:bg-brand-cyan/10 rounded-full transition-colors hidden lg:block">
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
            filteredPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;