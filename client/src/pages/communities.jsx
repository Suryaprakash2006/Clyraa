import { useEffect, useState } from 'react';
import { useCommunityStore } from '../store/communityStore';
import { useAuthStore } from '../store/authStore';
import { Users, MapPin, Plus, X, Edit, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Communities = () => {
  const { communities, fetchCommunities, createCommunity, updateCommunity, joinCommunity, leaveCommunity, isLoading } = useCommunityStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [desc, setDesc] = useState('');

  const [activeTab, setActiveTab] = useState('explore'); // explore, joined, created

  // Update Modal State
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateId, setUpdateId] = useState(null);
  const [updateLocation, setUpdateLocation] = useState('');
  const [updateDesc, setUpdateDesc] = useState('');

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !location) return;
    await createCommunity(name, location, desc);
    setShowCreate(false);
    setName('');
    setLocation('');
    setDesc('');
    setActiveTab('created');
  };

  const handleJoin = async (id) => {
    await joinCommunity(id);
    useAuthStore.getState().updateUserLocal({
      communitiesJoined: [...(user.communitiesJoined || []), id]
    });
    fetchCommunities();
  };

  const handleLeave = async (id) => {
    await leaveCommunity(id);
    useAuthStore.getState().updateUserLocal({
      communitiesJoined: (user.communitiesJoined || []).filter(cId => cId !== id)
    });
    fetchCommunities();
  };

  const openUpdateModal = (c) => {
    setUpdateId(c._id);
    setUpdateLocation(c.location);
    setUpdateDesc(c.description);
    setShowUpdateModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!updateId) return;
    await updateCommunity(updateId, { location: updateLocation, description: updateDesc });
    setShowUpdateModal(false);
    setUpdateId(null);
  };

  // Filter Communities
  const createdCommunities = communities.filter(c => c.admin?._id === user?._id);
  const joinedCommunities = communities.filter(c => user?.communitiesJoined?.includes(c._id) && c.admin?._id !== user?._id);
  const exploreCommunities = communities.filter(c => !user?.communitiesJoined?.includes(c._id) && c.admin?._id !== user?._id);

  let displayedCommunities = [];
  if (activeTab === 'created') displayedCommunities = createdCommunities;
  else if (activeTab === 'joined') displayedCommunities = joinedCommunities;
  else displayedCommunities = exploreCommunities;

  const renderCommunityCard = (c, type) => (
    <div key={c._id} className="bg-white shadow-xl shadow-brand-cyan/5 p-0 rounded-[2rem] flex flex-col h-full overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 border border-gray-100">
      <div className="relative h-56 w-full group overflow-hidden">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg" 
          alt="Community Thumbnail" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
        
        <div className="absolute top-4 right-4 p-1 bg-white/20 backdrop-blur-md rounded-xl relative group cursor-pointer inline-block border border-white/30">
           <img src={c.admin?.profile?.profilePic || "https://ui-avatars.com/api/?name=" + (c.admin?.name || "A") + "&background=random"} alt="Admin" className="w-10 h-10 rounded-lg shadow-sm object-cover" />
           <div className="absolute top-12 right-0 bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs w-max opacity-0 group-hover:opacity-100 transition-opacity z-10 font-medium">Admin: {c.admin?.name}</div>
        </div>
        
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <h3 className="text-2xl font-black tracking-tight mb-2 drop-shadow-md leading-tight">{c.name}</h3>
          <div className="inline-flex items-center gap-1.5 bg-brand-cyan/20 backdrop-blur-sm px-3 py-1 rounded-full text-brand-cyan text-xs font-bold border border-brand-cyan/30">
            <MapPin className="w-3.5 h-3.5" /> {c.location}
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between bg-white">
        <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">{c.description || "No description provided. Be the first to start the conversation!"}</p>
        
        <div className="flex flex-col gap-3 mt-auto">
          <button
            onClick={() => navigate(`/community/${c._id}`)}
            className="w-full py-3 rounded-2xl font-bold transition-all bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" /> View Community
          </button>
          
          {type === 'explore' && (
            <button
              onClick={() => handleJoin(c._id)}
              className="w-full py-3 rounded-2xl font-bold transition-all bg-brand-cyan text-white hover:bg-brand-cyan/90 shadow-lg shadow-brand-cyan/30 hover:shadow-brand-cyan/50 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Join Community
            </button>
          )}

          {type === 'joined' && (
            <button
              onClick={() => handleLeave(c._id)}
              className="w-full py-3 rounded-2xl font-bold transition-all bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Leave Community
            </button>
          )}

          {type === 'created' && (
            <button
              onClick={() => openUpdateModal(c)}
              className="w-full py-3 rounded-2xl font-bold transition-all bg-brand-fuchsia/10 text-brand-fuchsia hover:bg-brand-fuchsia hover:text-white border border-brand-fuchsia/20 flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" /> Update Details
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 w-full lg:px-6">
      
      {/* Header & Create Button */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3 tracking-tight">
            <div className="p-3 bg-brand-cyan/10 rounded-2xl text-brand-cyan">
              <Users className="w-7 h-7" />
            </div>
            Communities Network
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Connect with travelers globally based on your interests.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className={`w-full lg:w-auto px-6 py-3.5 rounded-2xl font-bold transition-all flex justify-center items-center gap-2 shadow-lg ${
            showCreate 
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-brand-cyan text-white hover:bg-brand-cyan/90 shadow-brand-cyan/30 hover:shadow-brand-cyan/50'
          }`}
        >
          {showCreate ? (
            <><X className="w-5 h-5" /> Close Form</>
          ) : (
            <><Plus className="w-5 h-5" /> Start New Community</>
          )}
        </button>
      </div>

      {/* Enhanced Create Community Form */}
      {showCreate && (
        <div className="p-8 rounded-3xl bg-white shadow-xl shadow-brand-cyan/5 border border-brand-cyan/20 transition-all animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-brand-cyan"></div>
          <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
            Create a Community
            <span className="text-brand-cyan">•</span>
          </h2>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Community Name</label>
                <input
                  type="text" required placeholder="e.g. Backpackers of Bali" value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:bg-white focus:ring-2 focus:ring-brand-cyan/50 focus:border-brand-cyan outline-none text-gray-800 font-medium transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Region / Location</label>
                <input
                  type="text" required placeholder="e.g. Indonesia" value={location} onChange={e => setLocation(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:bg-white focus:ring-2 focus:ring-brand-cyan/50 focus:border-brand-cyan outline-none text-gray-800 font-medium transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
              <textarea
                placeholder="What is this community all about?" value={desc} onChange={(e)=> {setDesc(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 focus:bg-white focus:ring-2 focus:ring-brand-cyan/50 focus:border-brand-cyan outline-none text-gray-800 font-medium min-h-[120px] resize-none transition-all"
              />
            </div>
            <button type="submit" className="px-8 py-3.5 rounded-2xl bg-brand-cyan text-white font-bold hover:bg-brand-cyan/90 transition-all shadow-lg shadow-brand-cyan/30 flex items-center justify-center gap-2 w-full md:w-auto">
              Publish Community
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 sm:gap-2 p-1.5 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto w-full max-w-[100vw] sm:w-fit lg:mx-0 snap-x custom-scrollbar">
         <button onClick={() => setActiveTab('explore')} className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 snap-start ${activeTab === 'explore' ? 'bg-brand-cyan text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Explore Communities</button>
         <button onClick={() => setActiveTab('joined')} className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 snap-start ${activeTab === 'joined' ? 'bg-brand-cyan text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Joined ({joinedCommunities.length})</button>
         <button onClick={() => setActiveTab('created')} className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 snap-start ${activeTab === 'created' ? 'bg-brand-cyan text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Your Communities ({createdCommunities.length})</button>
      </div>

      {/* Render Communities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {isLoading ? (
          <div className="col-span-full text-center py-20 text-slate-400 font-medium">Fetching communities...</div>
        ) : displayedCommunities.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white/50 border border-dashed border-gray-300 shadow-sm rounded-3xl text-gray-500 font-medium">
             {activeTab === 'explore' && "No new communities to explore. Why not create one?"}
             {activeTab === 'joined' && "You haven't joined any communities yet. Check out the explore tab!"}
             {activeTab === 'created' && "You haven't created any communities. Click Start New Community above!"}
          </div>
        ) : (
          displayedCommunities.map(c => renderCommunityCard(c, activeTab))
        )}
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="font-black text-xl text-gray-800">Update Community</h3>
                 <button onClick={() => setShowUpdateModal(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <form onSubmit={handleUpdate} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Update Location</label>
                  <input
                    type="text" required value={updateLocation} onChange={e => setUpdateLocation(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-fuchsia/50 focus:border-brand-fuchsia outline-none text-gray-800 font-medium transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Update Description</label>
                  <textarea
                    required value={updateDesc} onChange={e => setUpdateDesc(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-fuchsia/50 focus:border-brand-fuchsia outline-none text-gray-800 font-medium h-32 resize-none transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowUpdateModal(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-brand-fuchsia text-white font-bold hover:bg-brand-fuchsia/90 transition-colors shadow-lg shadow-brand-fuchsia/30">Save Changes</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Communities;
