import { useEffect, useState, useRef } from 'react';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import {
  MessageSquare, Settings, Users, Send, Plane, Search,
  UserPlus, UserMinus, LogOut, Trash2, ArrowLeft, History, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api/axios';

const Groups = () => {
  const {
    groups, fetchUserGroups, activeGroup, setActiveGroup,
    messages, fetchMessages, addMessage, createGroup,
    addMember, removeMember, leaveGroup, deleteGroup
  } = useGroupStore();
  const { pastTrips, fetchPastTrips } = useTripStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);
  const [msgInput, setMsgInput] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const messagesEndRef = useRef(null);

  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const scrollToBottom = () => {
    if (!showSettings) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { fetchUserGroups(); }, [fetchUserGroups]);

  useEffect(() => {
    const newSocket = io("https://clyraa.onrender.com", { withCredentials: true });
    setSocket(newSocket);
    newSocket.on("receive_message", (data) => { addMessage(data); });
    newSocket.on("connect_error", (err) => { console.error("Socket error: ", err.message); });
    return () => newSocket.close();
  }, [addMessage]);

  useEffect(() => {
    if (activeGroup && socket) {
      setShowSettings(false);
      setSearchQuery('');
      setSearchResults([]);
      fetchMessages(activeGroup._id);
      socket.emit("join_group", activeGroup._id);
    }
  }, [activeGroup, socket, fetchMessages]);

  useEffect(() => { scrollToBottom(); }, [messages, showSettings]);

  useEffect(() => {
    if (showSettings && activeGroup) fetchPastTrips(activeGroup._id);
  }, [showSettings, activeGroup, fetchPastTrips]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await api.get(`/auth/search?q=${searchQuery}`);
          setSearchResults(res.data.users);
        } catch (error) { console.error("Failed to search users", error); }
        setIsSearching(false);
      } else { setSearchResults([]); }
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
    } catch (error) { alert(error.response?.data?.message || "Error creating group"); }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeGroup || !socket) return;
    socket.emit("send_message", { groupId: activeGroup._id, message: msgInput });
    setMsgInput('');
  };

  const handleAddMember = async (userId) => {
    if (!activeGroup) return;
    try {
      await addMember(activeGroup._id, userId);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) { alert(error.response?.data?.message || "Error adding member"); }
  };

  const handleRemoveMember = async (userId) => {
    if (!activeGroup) return;
    const confirm = window.confirm("Remove this member?");
    if (!confirm) return;
    try { await removeMember(activeGroup._id, userId); }
    catch (error) { alert(error.response?.data?.message || "Error removing member"); }
  };

  const handleLeaveGroup = async () => {
    if (!activeGroup) return;
    const confirm = window.confirm("Are you sure you want to leave this group?");
    if (!confirm) return;
    try { await leaveGroup(activeGroup._id); }
    catch (error) { alert(error.response?.data?.message || "Error leaving group"); }
  };

  const handleDeleteGroup = async () => {
    if (!activeGroup) return;
    const confirm = window.confirm("Are you sure you want to completely delete this group? This action cannot be undone.");
    if (!confirm) return;
    try { await deleteGroup(activeGroup._id); }
    catch (error) { alert(error.response?.data?.message || "Error deleting group"); }
  };

  const isAdmin = activeGroup?.admin?._id === user?._id || activeGroup?.admin === user?._id;
  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()));

  return (
    <div className="h-[calc(100vh-100px)] flex gap-0 md:gap-5 animate-in fade-in duration-500">

      {/* ── SIDEBAR: Group List ── */}
      <div className={`w-full md:w-80 flex flex-col gap-4 transition-all duration-300 ${activeGroup ? 'hidden md:flex' : 'flex'}`}>

        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/40 border border-gray-100 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-gray-900 font-black text-sm">Your Groups</h2>
            <button
              onClick={() => setShowCreateGroup(!showCreateGroup)}
              className="flex items-center gap-1.5 bg-brand-cyan/10 text-brand-cyan text-xs font-bold px-3 py-1.5 rounded-xl border border-brand-cyan/20 hover:bg-brand-cyan hover:text-white transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" /> New Group
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={groupSearchQuery}
              onChange={e => setGroupSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan outline-none text-gray-700 font-medium transition-all"
            />
          </div>

          {showCreateGroup && (
            <form onSubmit={handleCreateGroup} className="flex gap-2 pt-2 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <input
                type="text"
                placeholder="New group name..."
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                autoFocus
                className="w-full bg-white border border-brand-cyan/40 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-cyan/30 outline-none text-gray-700 font-medium"
              />
              <button
                type="submit"
                disabled={!newGroupName}
                className="bg-brand-cyan text-white rounded-xl px-3 font-bold hover:bg-brand-cyan/90 disabled:opacity-50 transition-all flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Group list */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/40 border border-gray-100 flex-1 overflow-y-auto p-2">
          {filteredGroups.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm font-medium">No groups found.</div>
          ) : (
            filteredGroups.map(g => (
              <div
                key={g._id}
                onClick={() => setActiveGroup(g)}
                className={`p-3.5 rounded-xl cursor-pointer transition-all mb-1.5 flex items-center gap-3 group ${
                  activeGroup?._id === g._id
                    ? 'bg-brand-cyan/10 border border-brand-cyan/20'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex shrink-0 items-center justify-center font-black text-sm ${
                  activeGroup?._id === g._id ? 'bg-brand-cyan text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {g.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden flex-1">
                  <h4 className={`font-bold text-sm truncate ${activeGroup?._id === g._id ? 'text-brand-cyan' : 'text-gray-800'}`}>{g.name}</h4>
                  <span className="text-xs text-gray-400 font-medium">{g.members?.length || 1} members</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div className={`flex-1 bg-white rounded-2xl shadow-lg shadow-gray-200/40 border border-gray-100 flex-col relative overflow-hidden ${!activeGroup ? 'hidden md:flex' : 'flex'}`}>
        {activeGroup ? (
          <>
            {/* Chat Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveGroup(null)}
                  className="md:hidden p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div
                  className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl bg-gradient-to-br from-brand-cyan to-blue-500 flex items-center justify-center font-black text-white text-lg cursor-pointer shadow-md shadow-brand-cyan/20"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  {activeGroup.name.charAt(0).toUpperCase()}
                </div>
                <div className="cursor-pointer overflow-hidden" onClick={() => setShowSettings(!showSettings)}>
                  <h2 className="text-base font-black text-gray-900 flex items-center gap-2 truncate">
                    {activeGroup.name}
                    {isAdmin && (
                      <span className="text-[10px] hidden sm:inline-block bg-brand-cyan/10 text-brand-cyan px-2 py-0.5 rounded-full border border-brand-cyan/20 font-bold">Admin</span>
                    )}
                  </h2>
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <Users className="w-3 h-3" /> {activeGroup.members?.length} Members
                  </p>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <button
                  onClick={() => navigate(`/groups/${activeGroup._id}/trip`)}
                  className="px-3 sm:px-5 py-2 rounded-xl bg-brand-cyan text-white font-bold flex items-center gap-1.5 hover:bg-brand-cyan/90 shadow-md shadow-brand-cyan/20 transition-all text-xs sm:text-sm"
                >
                  <Plane className="w-4 h-4" />
                  <span className="hidden sm:inline">Trip Dashboard</span>
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2.5 rounded-xl border transition-all hidden sm:flex ${
                    showSettings
                      ? 'bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!showSettings ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-gray-50/40">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8" />
                      </div>
                      <p className="text-gray-400 font-medium text-sm">Start the conversation</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                      return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[72%] rounded-2xl px-4 py-3 shadow-sm ${
                            isMe
                              ? 'bg-gradient-to-br from-brand-cyan to-blue-500 text-white rounded-br-sm'
                              : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-md shadow-gray-100'
                          }`}>
                            {!isMe && msg.senderId?.name && (
                              <div className="text-xs text-brand-cyan font-black mb-1">{msg.senderId.name}</div>
                            )}
                            <p className="break-words text-sm font-medium leading-relaxed">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-100">
                  <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                    <input
                      type="text"
                      value={msgInput}
                      onChange={e => setMsgInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl pl-5 pr-14 py-3 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan text-gray-800 font-medium text-sm transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!msgInput.trim()}
                      className="absolute right-2 top-1.5 bottom-1.5 px-4 rounded-xl bg-brand-cyan text-white flex items-center justify-center disabled:opacity-40 hover:bg-brand-cyan/90 transition-colors shadow-md shadow-brand-cyan/20"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* ── Settings Panel ── */
              <div className="flex-1 overflow-y-auto bg-gray-50/40 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="max-w-2xl mx-auto p-6 space-y-8">

                  {/* Group Info */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-brand-cyan to-blue-500 flex items-center justify-center font-black text-white text-4xl mb-4 shadow-lg shadow-brand-cyan/20">
                      {activeGroup.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-1">{activeGroup.name}</h3>
                    <p className="text-gray-400 text-sm font-medium">Created by {activeGroup.admin?.name || 'Unknown'}</p>
                  </div>

                  {/* Add Members (Admin Only) */}
                  {isAdmin && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                      <h4 className="text-sm font-black text-gray-800 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-brand-cyan/10 flex items-center justify-center">
                          <UserPlus className="w-3.5 h-3.5 text-brand-cyan" />
                        </div>
                        Add Members
                      </h4>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users by name or email..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan text-gray-700 font-medium text-sm transition-all"
                        />
                      </div>
                      {searchQuery && (
                        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-lg p-1.5 max-h-56 overflow-y-auto">
                          {isSearching ? (
                            <div className="p-3 text-center text-gray-400 text-sm animate-pulse font-medium">Searching...</div>
                          ) : searchResults.length > 0 ? (
                            searchResults.map(u => {
                              const isAlreadyMember = activeGroup.members.some(m => (m._id || m) === u._id);
                              return (
                                <div key={u._id} className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-lg transition-colors">
                                  <div className="flex items-center gap-3">
                                    {u.profile?.profilePic ? (
                                      <img src={u.profile.profilePic} alt="P" className="w-9 h-9 rounded-xl object-cover" />
                                    ) : (
                                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-black text-gray-600">
                                        {u.name.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-sm font-bold text-gray-800">{u.name}</p>
                                      <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                                    </div>
                                  </div>
                                  <button
                                    disabled={isAlreadyMember}
                                    onClick={() => handleAddMember(u._id)}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-brand-cyan text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-cyan/90 transition-colors"
                                  >
                                    {isAlreadyMember ? 'Joined' : 'Add'}
                                  </button>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-3 text-center text-gray-400 text-sm font-medium">No users found</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Member List */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <h4 className="text-sm font-black text-gray-800 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-purple/10 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-brand-purple" />
                      </div>
                      Members ({activeGroup.members?.length})
                    </h4>
                    <div className="space-y-1">
                      {activeGroup.members?.map(m => {
                        const mId = m._id || m;
                        const adminId = activeGroup.admin?._id || activeGroup.admin;
                        const isMemberAdmin = mId === adminId;
                        return (
                          <div key={mId} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                            <div className="flex items-center gap-3">
                              {m.profile?.profilePic ? (
                                <img src={m.profile.profilePic} alt="P" className="w-10 h-10 rounded-xl object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-600">
                                  {m.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                  {m.name || 'User'}
                                  {user?._id === mId && <span className="text-xs text-gray-400 font-normal">(You)</span>}
                                </p>
                                {isMemberAdmin && (
                                  <span className="text-[10px] text-brand-cyan font-black uppercase tracking-wider">Admin</span>
                                )}
                              </div>
                            </div>
                            {isAdmin && !isMemberAdmin && (
                              <button
                                onClick={() => handleRemoveMember(mId)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Past Trips */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <h4 className="text-sm font-black text-gray-800 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-purple/10 flex items-center justify-center">
                        <History className="w-3.5 h-3.5 text-brand-purple" />
                      </div>
                      Past Trips Showcase
                    </h4>
                    {pastTrips && pastTrips.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {pastTrips.map(trip => (
                          <div
                            key={trip._id}
                            onClick={() => navigate(`/groups/${activeGroup._id}/trip/${trip._id}`)}
                            className="bg-gray-50 border border-gray-100 hover:border-brand-cyan/30 hover:bg-brand-cyan/5 p-4 rounded-xl cursor-pointer transition-all group"
                          >
                            <h5 className="text-gray-800 font-bold text-sm group-hover:text-brand-cyan transition-colors mb-2 truncate">
                              {trip.source} → {trip.destination}
                            </h5>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-400 font-medium">{trip.days} Days • ${trip.budget}</p>
                              <span className="text-[10px] uppercase font-black text-brand-cyan/70 tracking-wider">View</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
                        <Plane className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm font-medium">No completed trips yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 space-y-4">
                    <h4 className="text-sm font-black text-red-500 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                        <X className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      Danger Zone
                    </h4>
                    {isAdmin ? (
                      <button
                        onClick={handleDeleteGroup}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white font-bold text-sm transition-all"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Entire Group
                      </button>
                    ) : (
                      <button
                        onClick={handleLeaveGroup}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white font-bold text-sm transition-all"
                      >
                        <LogOut className="w-4 h-4" /> Leave Group
                      </button>
                    )}
                  </div>

                </div>
              </div>
            )}
          </>
        ) : (
          <div className="m-auto text-center p-8">
            <div className="w-20 h-20 mx-auto bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
              <MessageSquare className="w-9 h-9 text-gray-300" />
            </div>
            <h3 className="text-lg font-black text-gray-700 mb-2">Select a group</h3>
            <p className="text-gray-400 text-sm font-medium">Pick a group from the sidebar to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
