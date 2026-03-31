import { useEffect, useState, useRef } from 'react';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import { MessageSquare, Settings, Users, Send, Plane } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const Groups = () => {
  const { groups, fetchUserGroups, activeGroup, setActiveGroup, messages, fetchMessages, addMessage, createGroup } = useGroupStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [socket, setSocket] = useState(null);
  const [msgInput, setMsgInput] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      fetchMessages(activeGroup._id); // Fetch chat history from DB
      socket.emit("join_group", activeGroup._id);
    }
  }, [activeGroup, socket, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName) return;
    await createGroup(newGroupName);
    setNewGroupName('');
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

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6 animate-in fade-in duration-500">
      
      {/* Sidebar - Group List */}
      <div className="w-1/3 flex flex-col gap-4">
        <div className="glass-panel rounded-2xl p-4 border-t border-brand-cyan/20">
          <form onSubmit={handleCreateGroup} className="flex gap-2">
            <input 
              type="text" 
              placeholder="New Group Name" 
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              className="w-full bg-dark-bg/50 border border-dark-border rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-brand-cyan outline-none text-white"
            />
            <button type="submit" className="bg-brand-cyan text-dark-bg rounded-xl px-3 font-bold hover:opacity-90">+</button>
          </form>
        </div>

        <div className="glass-panel rounded-2xl flex-1 overflow-y-auto border-t border-white/5 p-2">
          {groups.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">No groups yet. Create one!</div>
          ) : (
            groups.map(g => (
              <div 
                key={g._id}
                onClick={() => setActiveGroup(g)}
                className={`p-4 rounded-xl cursor-pointer transition-all mb-2 flex items-center justify-between group ${activeGroup?._id === g._id ? 'bg-brand-cyan/10 border border-brand-cyan/30' : 'hover:bg-dark-surface border border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${activeGroup?._id === g._id ? 'bg-brand-cyan text-dark-bg' : 'bg-dark-bg text-white'}`}>
                    {g.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className={`font-semibold ${activeGroup?._id === g._id ? 'text-brand-cyan' : 'text-white'}`}>{g.name}</h4>
                    <span className="text-xs text-slate-500">{g.members?.length || 1} members</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass-panel rounded-2xl flex flex-col border-t border-brand-purple/20 relative overflow-hidden">
        {activeGroup ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-dark-border bg-dark-surface/50 backdrop-blur-md flex justify-between items-center relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center font-bold text-white text-xl">
                  {activeGroup.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{activeGroup.name}</h2>
                  <p className="text-xs text-brand-cyan flex items-center gap-1">
                    <Users className="w-3 h-3" /> {activeGroup.members?.length} Members
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate(`/groups/${activeGroup._id}/trip`)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-fuchsia text-white font-medium hover:opacity-90 flex items-center gap-2 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                >
                  <Plane className="w-4 h-4" /> Trip Dashboard
                </button>
              </div>
            </div>

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
                  placeholder="Type a futuristic message..." 
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
