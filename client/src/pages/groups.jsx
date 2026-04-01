import { useEffect, useState, useRef } from 'react';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { MessageSquare, Settings, Users, Send, Plane, Search, UserPlus, UserMinus, LogOut, Trash2, ArrowLeft, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api/axios';

const Groups = () => {
  const { groups, fetchUserGroups, activeGroup, setActiveGroup, messages, fetchMessages, addMessage, createGroup, addMember, removeMember, leaveGroup, deleteGroup } = useGroupStore();
  const { pastTrips, fetchPastTrips } = useTripStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [socket, setSocket] = useState(null);
  const [msgInput, setMsgInput] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const messagesEndRef = useRef(null);

  // Settings Panel State
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    if (!showSettings) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchUserGroups();
  }, [fetchUserGroups]);

  // Setup Socket Connection
  useEffect(() => {
    const newSocket = io("http://localhost:8000", {
      withCredentials: true
    });
    setSocket(newSocket);

    newSocket.on("receive_message", (data) => {
      addMessage(data);
    });
    
    newSocket.on("connect_error", (err) => {
      console.error("Socket error: ", err.message);
    });

    return () => newSocket.close();
  }, [addMessage]);

  // Handle Group Selection
  useEffect(() => {
    if (activeGroup && socket) {
      setShowSettings(false); // reset settings view when joining new group
      setSearchQuery('');
      setSearchResults([]);
      fetchMessages(activeGroup._id); // Fetch chat history from DB
      socket.emit("join_group", activeGroup._id);
    }
  }, [activeGroup, socket, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, showSettings]);

  // Fetch Past Trips when settings are opened
  useEffect(() => {
    if (showSettings && activeGroup) {
      fetchPastTrips(activeGroup._id);
    }
  }, [showSettings, activeGroup, fetchPastTrips]);

  // Search Users
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await api.get(`/auth/search?q=${searchQuery}`);
          setSearchResults(res.data.users);
        } catch (error) {
          console.error("Failed to search users", error);
        }
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName) return;
    try {
      await createGroup(newGroupName);
      setNewGroupName('');
      setShowCreateGroup(false);
      fetchUserGroups();
    } catch (error) {
      alert(error.response?.data?.message || "Error creating group");
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeGroup || !socket) return;
    
    socket.emit("send_message", {
      groupId: activeGroup._id,
      message: msgInput
    });
    setMsgInput('');
  };

  const handleAddMember = async (userId) => {
    if (!activeGroup) return;
    try {
      await addMember(activeGroup._id, userId);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      alert(error.response?.data?.message || "Error adding member");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!activeGroup) return;
    const confirm = window.confirm("Remove this member?");
    if (!confirm) return;
    try {
      await removeMember(activeGroup._id, userId);
    } catch (error) {
      alert(error.response?.data?.message || "Error removing member");
    }
  };

  const handleLeaveGroup = async () => {
    if (!activeGroup) return;
    const confirm = window.confirm("Are you sure you want to leave this group?");
    if (!confirm) return;
    try {
      await leaveGroup(activeGroup._id);
    } catch (error) {
      alert(error.response?.data?.message || "Error leaving group");
    }
  };

  const handleDeleteGroup = async () => {
    if (!activeGroup) return;
    const confirm = window.confirm("Are you sure you want to completely delete this group? This action cannot be undone.");
    if (!confirm) return;
    try {
      await deleteGroup(activeGroup._id);
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting group");
    }
  };

  const isAdmin = activeGroup?.admin?._id === user?._id || activeGroup?.admin === user?._id;

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-100px)] flex gap-0 md:gap-6 animate-in fade-in duration-500">
      
      {/* Sidebar - Group List */}
      <div className={`w-full md:w-1/3 flex flex-col gap-4 transition-all duration-300 ${activeGroup ? 'hidden md:flex' : 'flex'}`}>
        <div className="glass-panel rounded-2xl p-4 border-t border-brand-cyan/20 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-white font-bold">Your Groups</h2>
            <button 
              onClick={() => setShowCreateGroup(!showCreateGroup)}
              className="bg-brand-cyan/20 text-brand-cyan text-xs font-bold px-2.5 py-1.5 rounded-lg border border-brand-cyan/40 hover:bg-brand-cyan hover:text-dark-bg transition-colors flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" /> New Group
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search groups..." 
              value={groupSearchQuery}
              onChange={e => setGroupSearchQuery(e.target.value)}
              className="w-full bg-dark-bg/50 border border-dark-border rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-brand-cyan outline-none text-white"
            />
          </div>

          {showCreateGroup && (
            <form onSubmit={handleCreateGroup} className="flex gap-2 pt-2 border-t border-dark-border animate-in fade-in slide-in-from-top-2 duration-300">
              <input 
                type="text" 
                placeholder="New Group Name" 
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                autoFocus
                className="w-full bg-dark-bg border border-brand-cyan/50 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-brand-cyan outline-none text-white"
              />
              <button type="submit" disabled={!newGroupName} className="bg-brand-cyan text-dark-bg rounded-xl px-3 font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center">
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        <div className="glass-panel rounded-2xl flex-1 overflow-y-auto border-t border-white/5 p-2">
          {filteredGroups.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">No groups found.</div>
          ) : (
            filteredGroups.map(g => (
              <div 
                key={g._id}
                onClick={() => setActiveGroup(g)}
                className={`p-4 rounded-xl cursor-pointer transition-all mb-2 flex items-center justify-between group ${activeGroup?._id === g._id ? 'bg-brand-cyan/10 border border-brand-cyan/30' : 'hover:bg-dark-surface border border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center font-bold ${activeGroup?._id === g._id ? 'bg-brand-cyan text-dark-bg' : 'bg-dark-bg text-white'}`}>
                    {g.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className={`font-semibold truncate ${activeGroup?._id === g._id ? 'text-brand-cyan' : 'text-white'}`}>{g.name}</h4>
                    <span className="text-xs text-slate-500">{g.members?.length || 1} members</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 glass-panel rounded-2xl flex-col border-t border-brand-purple/20 relative overflow-hidden ${!activeGroup ? 'hidden md:flex' : 'flex'}`}>
        {activeGroup ? (
          <>
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b border-dark-border bg-dark-surface/50 backdrop-blur-md flex justify-between items-center relative z-10 transition-all">
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  onClick={() => setActiveGroup(null)}
                  className="md:hidden p-2 rounded-xl bg-dark-surface border border-dark-border text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div 
                  className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center font-bold text-white text-lg sm:text-xl cursor-pointer" 
                  onClick={() => setShowSettings(!showSettings)}
                >
                  {activeGroup.name.charAt(0).toUpperCase()}
                </div>
                <div className="cursor-pointer overflow-hidden" onClick={() => setShowSettings(!showSettings)}>
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 truncate">
                    {activeGroup.name} 
                    {isAdmin && <span className="text-[10px] hidden sm:inline-block bg-brand-cyan/20 text-brand-cyan px-2 py-0.5 rounded-full border border-brand-cyan/30">Admin</span>}
                  </h2>
                  <p className="text-xs text-brand-cyan flex items-center gap-1 hover:text-white transition-colors">
                    <Users className="w-3 h-3" /> {activeGroup.members?.length} Members
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5 sm:gap-2 items-center">
                <button 
                  onClick={() => navigate(`/groups/${activeGroup._id}/trip`)}
                  className="px-2.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-fuchsia text-white font-medium hover:opacity-90 flex items-center gap-1.5 sm:gap-2 shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all text-xs sm:text-sm"
                >
                  <Plane className="w-4 h-4" /> <span className="hidden sm:inline">Trip Dashboard</span>
                </button>
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-xl border transition-colors hidden sm:flex ${showSettings ? 'bg-brand-cyan/20 border-brand-cyan/40 text-brand-cyan' : 'bg-dark-surface border-dark-border text-slate-400 hover:text-white hover:border-slate-600'}`}
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!showSettings ? (
              <>
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                      <MessageSquare className="w-16 h-16 mb-4" />
                      <p>Start the conversation</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                      return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-lg ${isMe ? 'bg-gradient-to-br from-brand-cyan to-blue-600 text-white rounded-br-none' : 'bg-dark-surface text-slate-200 border border-dark-border rounded-bl-none'}`}>
                            {!isMe && msg.senderId?.name && (
                              <div className="text-xs text-brand-fuchsia font-bold mb-1">{msg.senderId.name}</div>
                            )}
                            <p className="break-words">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-dark-surface/80 border-t border-dark-border">
                  <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                    <input 
                      type="text" 
                      value={msgInput}
                      onChange={e => setMsgInput(e.target.value)}
                      placeholder="Type a message..." 
                      className="flex-1 bg-dark-bg border border-dark-border rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-brand-cyan text-white shadow-inner"
                    />
                    <button 
                      type="submit"
                      disabled={!msgInput.trim()}
                      className="absolute right-2 top-1.5 bottom-1.5 px-3 rounded-lg bg-brand-cyan text-dark-bg flex items-center justify-center disabled:opacity-50 hover:bg-brand-cyan/80 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              // Settings View
              <div className="flex-1 overflow-y-auto p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="max-w-2xl mx-auto space-y-8">
                  
                  {/* Group Info */}
                  <div className="text-center pb-6 border-b border-dark-border">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center font-bold text-white text-4xl mb-4 shadow-lg shadow-brand-cyan/20">
                      {activeGroup.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{activeGroup.name}</h3>
                    <p className="text-slate-400">Created by {activeGroup.admin?.name || 'Unknown'}</p>
                  </div>

                  {/* Add Members (Admin Only) */}
                  {isAdmin && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-brand-cyan" /> Add Members
                      </h4>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                        <input 
                          type="text" 
                          placeholder="Search users by name or email to add..." 
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-brand-cyan text-white shadow-inner"
                        />
                      </div>
                      
                      {/* Search Results */}
                      {searchQuery && (
                        <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden shadow-lg p-2 max-h-60 overflow-y-auto">
                          {isSearching ? (
                            <div className="p-3 text-center text-slate-400 text-sm animate-pulse">Searching...</div>
                          ) : searchResults.length > 0 ? (
                            <div className="space-y-1">
                              {searchResults.map(u => {
                                const isAlreadyMember = activeGroup.members.some(m => (m._id || m) === u._id);
                                return (
                                  <div key={u._id} className="flex items-center justify-between p-2 hover:bg-dark-bg rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                      {u.profile?.profilePic ? (
                                        <img src={u.profile.profilePic} alt="P" className="w-8 h-8 rounded-full object-cover" />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                          {u.name.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-sm font-medium text-white">{u.name}</p>
                                        <p className="text-xs text-slate-400">{u.email}</p>
                                      </div>
                                    </div>
                                    <button 
                                      disabled={isAlreadyMember}
                                      onClick={() => handleAddMember(u._id)}
                                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-cyan text-dark-bg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-cyan/80 transition-colors"
                                    >
                                      {isAlreadyMember ? 'Joined' : 'Add'}
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="p-3 text-center text-slate-400 text-sm">No users found</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Member List */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-brand-purple" /> Members ({activeGroup.members?.length})
                    </h4>
                    <div className="bg-dark-surface border border-dark-border rounded-xl p-2 space-y-1">
                      {activeGroup.members?.map(m => {
                        const mId = m._id || m;
                        const adminId = activeGroup.admin?._id || activeGroup.admin;
                        const isMemberAdmin = mId === adminId;
                        
                        return (
                          <div key={mId} className="flex items-center justify-between p-3 hover:bg-dark-bg rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                              {m.profile?.profilePic ? (
                                <img src={m.profile.profilePic} alt="P" className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
                                  {m.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-white flex items-center gap-2">
                                  {m.name || 'User'} {user?._id === mId && <span className="text-xs text-slate-500 font-normal">(You)</span>}
                                </p>
                                {isMemberAdmin && <span className="text-[10px] text-brand-cyan uppercase tracking-wider font-bold">Admin</span>}
                              </div>
                            </div>

                            {/* Remove button (Admin only, can't remove self) */}
                            {isAdmin && !isMemberAdmin && (
                              <button 
                                onClick={() => handleRemoveMember(mId)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Remove User"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Past Trips Showcase */}
                  <div className="space-y-4 pt-6 mt-6 border-t border-dark-border">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                      <History className="w-5 h-5 text-brand-purple" /> Past Trips Showcase
                    </h4>
                    {pastTrips && pastTrips.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pastTrips.map(trip => (
                          <div 
                            key={trip._id} 
                            onClick={() => navigate(`/groups/${activeGroup._id}/trip/${trip._id}`)}
                            className="bg-dark-surface border border-dark-border hover:border-brand-purple/50 p-4 rounded-xl cursor-pointer transition-all group"
                          >
                            <h5 className="text-white font-bold group-hover:text-brand-purple transition-colors mb-2 truncate">
                              {trip.source} ⟶ {trip.destination}
                            </h5>
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-xs text-slate-400 font-medium">
                                {trip.days} Days • ${trip.budget}
                              </p>
                              <span className="text-[10px] uppercase font-bold text-brand-cyan/70 tracking-wider">View Summary</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-dark-surface/50 border border-dark-border rounded-xl p-6 text-center text-slate-500">
                        <Plane className="w-8 h-8 opacity-20 mx-auto mb-2" />
                        <p className="text-sm">No completed trips yet.<br/>Your history will appear here.</p>
                      </div>
                    )}
                  </div>

                  {/* Danger Zone */}
                  <div className="space-y-4 pt-6 mt-6 border-t border-dark-border">
                    <h4 className="text-lg font-semibold text-red-500">Danger Zone</h4>
                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                      {isAdmin ? (
                        <button 
                          onClick={handleDeleteGroup}
                          className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white font-medium transition-all"
                        >
                          <Trash2 className="w-5 h-5" /> Delete Entire Group
                        </button>
                      ) : (
                        <button 
                          onClick={handleLeaveGroup}
                          className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white font-medium transition-all"
                        >
                          <LogOut className="w-5 h-5" /> Leave Group
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </>
        ) : (
          <div className="m-auto text-center text-slate-500">
            <div className="w-24 h-24 mx-auto bg-dark-surface rounded-full flex items-center justify-center mb-4 border border-dark-border shadow-inner">
              <MessageSquare className="w-10 h-10 opacity-50" />
            </div>
            <h3 className="text-xl font-medium text-slate-400">Select a group to start chatting</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
