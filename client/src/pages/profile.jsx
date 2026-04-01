import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { 
  Settings, Grid, Bookmark, Users, Shield, MapPin, 
  X, Check, Edit, UserPlus, UserMinus, Plus
} from "lucide-react";
import toast from "react-hot-toast";
import PostCard from "../components/PostCard";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, fetchUserProfile, toggleFollowUser, updateProfile, changePassword, updateUserLocal } = useAuthStore();

  const [profileUser, setProfileUser] = useState(null);
  const [stats, setStats] = useState({ totalPosts: 0, totalCommunities: 0 });
  const [uploadedPosts, setUploadedPosts] = useState([]);
  const [communitiesCreated, setCommunitiesCreated] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("posts"); // posts, saved, joined, created

  // Modals
  const [followModal, setFollowModal] = useState(null); // 'followers' | 'following' | null
  const [showEdit, setShowEdit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Forms
  const [editForm, setEditForm] = useState({ name: "", phone: "", bio: "", travelledPlaces: "" });
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "" });

  const isSelf = currentUser?._id === id;

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchUserProfile(id);
      setProfileUser(data.user);
      setStats(data.stats);
      setUploadedPosts(data.uploadedPosts);
      setCommunitiesCreated(data.communitiesCreated);
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center animate-pulse text-brand-cyan">Loading Profile...</div>;
  if (!profileUser) return <div className="min-h-screen flex items-center justify-center text-slate-500">User not found</div>;

  const handleFollowToggle = async () => {
    try {
      const res = await toggleFollowUser(profileUser._id);
      
      // Update local state instantly
      setProfileUser((prev) => {
        const isNowFollowing = res.isFollowing;
        let newFollowers = [...prev.followers];
        if (isNowFollowing) {
          newFollowers.push({ _id: currentUser._id, name: currentUser.name, profile: currentUser.profile });
        } else {
          newFollowers = newFollowers.filter(f => f._id !== currentUser._id);
        }
        return { ...prev, followers: newFollowers };
      });

      // Update current user's local following
      let myFollowing = [...(currentUser.following || [])];
      if (res.isFollowing) myFollowing.push(profileUser._id);
      else myFollowing = myFollowing.filter(fId => fId !== profileUser._id);
      updateUserLocal({ following: myFollowing });

      toast.success(res.message);
    } catch (err) {
      toast.error("Error toggling follow");
    }
  };

  const handleEditOpen = () => {
    setEditForm({
      name: profileUser.name || "",
      phone: profileUser.phone || "",
      bio: profileUser.profile?.bio || "",
      travelledPlaces: profileUser.profile?.travelledPlaces?.join(", ") || ""
    });
    setShowEdit(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: editForm.name,
        phone: editForm.phone,
        profile: {
          bio: editForm.bio,
          travelledPlaces: editForm.travelledPlaces.split(",").map(s => s.trim()).filter(Boolean)
        }
      });
      setShowEdit(false);
      loadProfile(); // reload to get new details
      toast.success("Profile updated!");
    } catch (err) {}
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    try {
      await changePassword(pwdForm.currentPassword, pwdForm.newPassword);
      setShowSettings(false);
      setPwdForm({ currentPassword: "", newPassword: "" });
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };

  const isFollowing = profileUser.followers?.some(f => f._id === currentUser?._id);

  return (
    <div className="min-h-screen py-8 animate-in fade-in duration-500 bg-gray-50/50 dark:bg-dark-bg/50">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl shadow-brand-cyan/20 overflow-hidden bg-white">
              <img 
                src={profileUser.profile?.profilePic || `https://ui-avatars.com/api/?name=${profileUser.name}&background=random`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            {isSelf && (
              <button onClick={() => toast.error("Avatar upload to be connected with Cloudinary")} className="absolute bottom-2 right-2 p-2 bg-brand-cyan text-white rounded-full shadow-lg hover:bg-brand-cyan/90 transition-transform hover:scale-105">
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Info Block */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">{profileUser.name}</h1>
              
              <div className="flex gap-2 justify-center">
                {isSelf ? (
                  <>
                    <button onClick={handleEditOpen} className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-lg transition-colors border border-gray-200 shadow-sm flex items-center gap-1.5">
                      <Edit className="w-4 h-4" /> Edit Profile
                    </button>
                    <button onClick={() => setShowSettings(true)} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors border border-gray-200 shadow-sm">
                      <Settings className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <button onClick={handleFollowToggle} className={`px-6 py-1.5 font-bold text-sm rounded-lg transition-all shadow-md flex items-center gap-2 ${isFollowing ? 'bg-gray-200 text-gray-800 hover:bg-red-50 hover:text-red-500 hover:border-red-200 border border-gray-300' : 'bg-brand-cyan text-white hover:bg-brand-cyan/90 hover:-translate-y-0.5'}`}>
                     {isFollowing ? <><UserMinus className="w-4 h-4" /> Unfollow</> : <><UserPlus className="w-4 h-4" /> Follow</>}
                  </button>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex justify-center md:justify-start gap-6 text-base mb-4 font-medium">
              <span className="text-gray-800"><b>{stats.totalPosts}</b> posts</span>
              <button className="text-gray-800 hover:text-brand-cyan transition-colors" onClick={() => setFollowModal('followers')}><b>{profileUser.followers?.length || 0}</b> followers</button>
              <button className="text-gray-800 hover:text-brand-cyan transition-colors" onClick={() => setFollowModal('following')}><b>{profileUser.following?.length || 0}</b> following</button>
              <span className="text-gray-800"><b>{stats.totalCommunities}</b> communities</span>
            </div>

            {/* Bio */}
            <div>
              <p className="text-gray-800 font-bold mb-1">{profileUser.email}</p>
              <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed mb-2">{profileUser.profile?.bio}</p>
              {profileUser.profile?.travelledPlaces?.length > 0 && (
                <p className="text-[11px] uppercase tracking-wider font-bold text-brand-fuchsia flex items-center gap-1 justify-center md:justify-start">
                  <MapPin className="w-3.5 h-3.5" /> {profileUser.profile.travelledPlaces.join(" • ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-gray-200 flex justify-center gap-8 mb-6 mt-10">
          <button onClick={() => setActiveTab('posts')} className={`flex items-center gap-2 py-4 text-xs font-bold uppercase tracking-widest border-t-2 transition-all ${activeTab === 'posts' ? 'border-brand-cyan text-brand-cyan' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            <Grid className="w-4 h-4" /> Posts
          </button>
          {isSelf && (
             <button onClick={() => setActiveTab('saved')} className={`flex items-center gap-2 py-4 text-xs font-bold uppercase tracking-widest border-t-2 transition-all ${activeTab === 'saved' ? 'border-brand-cyan text-brand-cyan' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
               <Bookmark className="w-4 h-4" /> Saved
             </button>
          )}
          <button onClick={() => setActiveTab('joined')} className={`flex items-center gap-2 py-4 text-xs font-bold uppercase tracking-widest border-t-2 transition-all ${activeTab === 'joined' ? 'border-brand-cyan text-brand-cyan' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            <Users className="w-4 h-4" /> Joined
          </button>
          <button onClick={() => setActiveTab('created')} className={`flex items-center gap-2 py-4 text-xs font-bold uppercase tracking-widest border-t-2 transition-all ${activeTab === 'created' ? 'border-brand-cyan text-brand-cyan' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            <Shield className="w-4 h-4" /> Created
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {/* Uploaded Posts */}
          {activeTab === 'posts' && (
            <div className="flex flex-col gap-6 md:gap-8 max-w-2xl mx-auto mt-4">
              {uploadedPosts.length === 0 && <div className="text-center py-10 text-gray-400">No posts uploaded yet.</div>}
              {uploadedPosts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {/* Saved Posts (Self Only) */}
          {activeTab === 'saved' && isSelf && (
            <div className="flex flex-col gap-6 md:gap-8 max-w-2xl mx-auto mt-4">
              {profileUser.savedPosts.length === 0 && <div className="text-center py-10 text-gray-400">No saved posts.</div>}
              {profileUser.savedPosts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {/* Communities Joined */}
          {activeTab === 'joined' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
              {profileUser.communitiesJoined.length === 0 && <div className="col-span-full text-center py-10 text-gray-400">Not joined any communities.</div>}
              {profileUser.communitiesJoined.map(c => (
                <div key={c._id} onClick={() => navigate(`/community/${c._id}`)} className="bg-white cursor-pointer shadow-xl shadow-brand-cyan/5 p-0 rounded-3xl flex flex-col h-full overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group">
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" alt="Community"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-lg font-black tracking-tight mb-1.5 drop-shadow-md leading-tight line-clamp-2">{c.name}</h3>
                      <div className="inline-flex items-center gap-1 bg-brand-cyan/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-brand-cyan text-[10px] font-bold border border-brand-cyan/30">
                        <MapPin className="w-3 h-3" /> {c.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Communities Created */}
          {activeTab === 'created' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
              {communitiesCreated.length === 0 && <div className="col-span-full text-center py-10 text-gray-400">No communities created.</div>}
              {communitiesCreated.map(c => (
                <div key={c._id} onClick={() => navigate(`/community/${c._id}`)} className="bg-white cursor-pointer shadow-xl shadow-brand-cyan/5 p-0 rounded-3xl flex flex-col h-full overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group">
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" alt="Community"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-lg font-black tracking-tight mb-1.5 drop-shadow-md leading-tight line-clamp-2">{c.name}</h3>
                      <div className="inline-flex items-center gap-1 bg-brand-cyan/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-brand-cyan text-[10px] font-bold border border-brand-cyan/30">
                        <MapPin className="w-3 h-3" /> {c.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* --- MODALS --- */}

      {/* Followers / Following Modal */}
      {followModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setFollowModal(null)}>
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center text-center relative">
                 <h3 className="font-black text-base text-gray-800 capitalize w-full">{followModal}</h3>
                 <button onClick={() => setFollowModal(null)} className="absolute right-4 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <div className="max-h-80 overflow-y-auto p-4 custom-scrollbar">
                {(followModal === 'followers' ? profileUser.followers : profileUser.following).length === 0 && (
                  <p className="text-center text-sm text-gray-500 py-4">No users found.</p>
                )}
                {(followModal === 'followers' ? profileUser.followers : profileUser.following).map(f => (
                  <div 
                    key={f._id} 
                    onClick={() => { setFollowModal(null); navigate(`/profile/${f._id}`); }} 
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                  >
                    <img src={f.profile?.profilePic || `https://ui-avatars.com/api/?name=${f.name}`} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                    <span className="font-bold text-sm text-gray-800">{f.name}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="font-black text-xl text-gray-800">Edit Profile</h3>
                 <button onClick={() => setShowEdit(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <input type="text" placeholder="Name" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-cyan/50 focus:border-brand-cyan outline-none text-gray-800 text-sm font-medium" />
                <input type="text" placeholder="Phone Number" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-cyan/50 focus:border-brand-cyan outline-none text-gray-800 text-sm font-medium" />
                <textarea placeholder="Bio" rows={3} value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-cyan/50 focus:border-brand-cyan outline-none text-gray-800 text-sm font-medium resize-none" />
                <input type="text" placeholder="Travelled Places (comma separated)" value={editForm.travelledPlaces} onChange={e => setEditForm({...editForm, travelledPlaces: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-cyan/50 focus:border-brand-cyan outline-none text-gray-800 text-sm font-medium" />
                <button type="submit" className="w-full py-3.5 mt-2 rounded-xl bg-brand-cyan text-white font-bold hover:bg-brand-cyan/90 transition-colors shadow-lg shadow-brand-cyan/30">Save Profile</button>
              </form>
           </div>
        </div>
      )}

      {/* Settings Modal (Password Change) */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="font-black text-xl text-gray-800">Settings</h3>
                 <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <form onSubmit={handlePwdSubmit} className="p-6 space-y-4">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Change Password</h4>
                <input type="password" required placeholder="Current Password" value={pwdForm.currentPassword} onChange={e => setPwdForm({...pwdForm, currentPassword: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gray-300 outline-none text-gray-800 text-sm font-medium" />
                <input type="password" required placeholder="New Password" value={pwdForm.newPassword} onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gray-300 outline-none text-gray-800 text-sm font-medium" />
                <button type="submit" className="w-full py-3 mt-2 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors shadow-lg">Update Password</button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}