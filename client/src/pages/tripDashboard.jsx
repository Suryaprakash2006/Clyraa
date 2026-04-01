import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTripStore } from '../store/tripStore';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import { Plane, MapPin, DollarSign, Calendar, Navigation, CheckCircle2, Circle, AlertCircle, Plus, Users, CheckSquare, Square, FileText, Check, Power, RefreshCcw } from 'lucide-react';

const TripDashboard = () => {
  const { groupId, tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { 
    activeTrip, 
    fetchTripInfo, 
    createTrip, 
    startTrip, 
    addStop, 
    updateStop,
    addExpense,
    endTrip,
    restartTrip,
    addPackingItem,
    togglePackingItem,
    addNote,
    isLoading 
  } = useTripStore();
  
  const { groups, fetchUserGroups } = useGroupStore();

  const group = groups.find(g => g._id === groupId);

  useEffect(() => {
    if (!group) fetchUserGroups();
    fetchTripInfo(groupId, tripId);
  }, [groupId, tripId, fetchTripInfo, group, fetchUserGroups]);

  // Form states for creating a trip
  const [tripForm, setTripForm] = useState({
    source: '',
    destination: '',
    budget: '',
    mode: 'car',
    days: ''
  });

  // State for stops
  const [newStop, setNewStop] = useState({ name: '', reason: '' });
  
  // State for expenses
  const [newExpense, setNewExpense] = useState({ amount: '', reason: '' });

  // State for packing and notes
  const [newPackingItem, setNewPackingItem] = useState('');
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    try {
      await createTrip({ 
        groupId, 
        ...tripForm, 
        budget: Number(tripForm.budget), 
        days: Number(tripForm.days) 
      });
    } catch (error) {
      alert(error.response?.data?.message || "Error creating trip");
    }
  };

  const handleStartTrip = async () => {
    if (!activeTrip) return;
    try {
      await startTrip(activeTrip._id);
    } catch (error) {
      alert(error.response?.data?.message || "Error starting trip");
    }
  };

  const handleAddStop = async (e) => {
    e.preventDefault();
    if (!newStop.name || !activeTrip) return;
    try {
      await addStop(activeTrip._id, newStop);
      setNewStop({ name: '', reason: '' });
    } catch (error) {
      alert("Error adding stop");
    }
  };

  const handleToggleStop = async (stopId, reached) => {
    try {
      await updateStop(activeTrip._id, stopId, { reached: !reached });
    } catch (error) {
      alert("Error updating stop");
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.reason || !activeTrip) return;
    try {
      await addExpense(activeTrip._id, { 
        amount: Number(newExpense.amount), 
        reason: newExpense.reason 
      });
      setNewExpense({ amount: '', reason: '' });
    } catch (error) {
      alert("Error adding expense");
    }
  };

  const handleAddPackingItem = async (e) => {
    e.preventDefault();
    if (!newPackingItem || !activeTrip) return;
    try {
      await addPackingItem(activeTrip._id, { item: newPackingItem });
      setNewPackingItem('');
    } catch (error) { alert("Error adding item"); }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content || !activeTrip) return;
    try {
      await addNote(activeTrip._id, newNote);
      setNewNote({ title: '', content: '' });
    } catch (error) { alert("Error adding note"); }
  };

  const handleEndTrip = async () => {
    const confirm = window.confirm("Are you sure you want to end this trip? You'll still be able to view the summary.");
    if (!confirm) return;
    try {
      await endTrip(activeTrip._id);
      useTripStore.getState().clearTrip();
      navigate(`/groups/${groupId}/trip`);
    } catch (error) { alert("Error ending trip"); }
  };

  if (isLoading && !activeTrip) {
    return <div className="h-[80vh] flex items-center justify-center text-brand-cyan animate-pulse">Loading Trip Data...</div>;
  }

  // Calculate settlement balances
  let totalExpenses = 0;
  const payerTotals = {}; // { userId: amountPaid }
  
  if (activeTrip?.expenses) {
    activeTrip.expenses.forEach(exp => {
      totalExpenses += exp.amount;
      const payerId = exp.paidBy?._id || exp.paidBy;
      payerTotals[payerId] = (payerTotals[payerId] || 0) + exp.amount;
    });
  }

  const numMembers = group?.members?.length || 1;
  const costPerPerson = totalExpenses / numMembers;

  const getMemberBalances = () => {
    if (!group) return [];
    return group.members.map(m => {
      const mId = m._id || m;
      const paid = payerTotals[mId] || 0;
      const balance = paid - costPerPerson;
      return { member: m, paid, balance };
    }).sort((a, b) => b.balance - a.balance);
  };

  // ----- VIEW 1: No Trip Created Yet -----
  if (!activeTrip) {
    return (
      <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4 sm:px-0 animate-in fade-in duration-500">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border-t-2 border-brand-cyan">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 mx-auto bg-brand-cyan/20 rounded-full flex items-center justify-center mb-4">
              <Plane className="w-8 h-8 text-brand-cyan" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Plan a New Trip</h2>
            <p className="text-slate-400 text-sm sm:text-base">Set the details for your group's upcoming adventure.</p>
          </div>

          <form onSubmit={handleCreateTrip} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300 ml-1">Source</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input type="text" required value={tripForm.source} onChange={e => setTripForm({...tripForm, source: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2 text-white outline-none focus:border-brand-cyan" placeholder="City, Country" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300 ml-1">Destination</label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input type="text" required value={tripForm.destination} onChange={e => setTripForm({...tripForm, destination: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2 text-white outline-none focus:border-brand-purple" placeholder="Where going?" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300 ml-1">Budget ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input type="number" min="0" required value={tripForm.budget} onChange={e => setTripForm({...tripForm, budget: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2 text-white outline-none focus:border-green-500" placeholder="0" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300 ml-1">Days</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input type="number" min="1" required value={tripForm.days} onChange={e => setTripForm({...tripForm, days: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2 text-white outline-none focus:border-brand-cyan" placeholder="1" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300 ml-1">Mode</label>
                <select value={tripForm.mode} onChange={e => setTripForm({...tripForm, mode: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white outline-none focus:border-brand-cyan appearance-none cursor-pointer">
                  <option value="flight">Flight</option>
                  <option value="train">Train</option>
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="solo">Solo</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full py-3 mt-6 rounded-xl bg-gradient-to-r from-brand-cyan to-blue-600 text-white font-bold text-lg hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all">
              Save Trip Details
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----- VIEW 2: Trip Created, but not started -----
  if (activeTrip && !activeTrip.tripStarted && !activeTrip.tripCompleted) {
    return (
      <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 sm:px-0 animate-in fade-in zoom-in-95 duration-500">
        <div className="glass-panel p-1 rounded-2xl bg-gradient-to-br from-brand-cyan via-brand-purple to-fuchsia-600">
          <div className="bg-dark-bg rounded-xl p-6 sm:p-8 text-center relative overflow-hidden">
            
            {/* Header / Summary */}
            <div className="mb-6 sm:mb-8 relative z-10">
              <span className="px-3 py-1 bg-brand-cyan/20 text-brand-cyan text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full border border-brand-cyan/30">
                Itinerary Planned
              </span>
              <h1 className="text-2xl sm:text-4xl font-black mt-4 text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-fuchsia">
                {activeTrip.source} ⟶ {activeTrip.destination}
              </h1>
              <p className="text-slate-400 mt-2 flex items-center justify-center gap-4 text-sm font-medium">
                <span>{activeTrip.days} Days</span>
                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                <span className="capitalize">{activeTrip.mode} Route</span>
                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                <span className="text-green-400">${activeTrip.budget} Budget</span>
              </p>
            </div>

            {/* Launch Action */}
            <button 
              onClick={handleStartTrip}
              className="relative z-10 group overflow-hidden px-8 py-4 rounded-2xl bg-dark-surface border border-white/10 hover:border-brand-cyan/50 transition-all shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/10 to-brand-purple/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-3">
                <Plane className="w-6 h-6 text-brand-cyan group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <span className="text-xl font-bold text-white tracking-wide">Start the Journey!</span>
              </div>
            </button>
            <p className="text-xs text-slate-500 mt-4 leading-relaxed max-w-sm mx-auto z-10 relative">
              Warning: Starting this trip will declare it as your <b>currently active global trip</b>. You can only have one active trip across all your groups at a time.
            </p>
            
            {/* BG Decals */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand-purple/20 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-brand-cyan/20 blur-[100px] rounded-full pointer-events-none"></div>
          </div>
        </div>
      </div>
    );
  }

  // ----- VIEW 3: Dashboard -----
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10 px-4 sm:px-0">
      
      {/* Header Overview Banner */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border-l-4 border-l-brand-cyan bg-gradient-to-r from-dark-surface to-dark-bg overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {activeTrip.tripCompleted ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-500/20 text-slate-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full border border-slate-500/30">
                  <Check className="w-3 h-3" />
                  Trip Completed Showcase
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full border border-green-500/30">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  Live Journey
                </span>
              )}
              <span className="text-slate-400 text-xs sm:text-sm font-medium capitalize">{activeTrip.mode}</span>
              
              {activeTrip.tripCompleted ? (
                <button onClick={() => navigate(`/groups/${groupId}/trip`)} className="flex items-center gap-1.5 px-3 py-1 bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 rounded-full text-[10px] sm:text-xs font-bold hover:bg-brand-cyan hover:text-dark-bg transition-colors ml-auto md:ml-0">
                  <Plane className="w-3 h-3" /> Back to Current Trip
                </button>
              ) : (
                <button onClick={handleEndTrip} className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-[10px] sm:text-xs font-bold hover:bg-red-500 hover:text-white transition-colors ml-auto md:ml-0">
                  <Power className="w-3 h-3" /> End Journey
                </button>
              )}
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white flex items-center gap-2 sm:gap-4 flex-wrap">
              <span>{activeTrip.source}</span>
              <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-brand-purple" />
              <span>{activeTrip.destination}</span>
            </h1>
          </div>
          <div className="flex gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-dark-border pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
            <div className="text-left md:text-center">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Duration</p>
              <p className="text-xl font-bold text-white">{activeTrip.days} <span className="text-sm font-normal text-slate-500">Days</span></p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Budget</p>
              <p className="text-xl font-bold text-green-400">${activeTrip.budget}</p>
            </div>
          </div>
        </div>
        <Plane className="absolute -right-4 -bottom-8 text-white/5 w-48 h-48 rotate-[-20deg] pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COL: Itinerary & Stops */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-4 sm:p-6 rounded-2xl border-t border-white/5">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <MapPin className="text-brand-purple" /> Itinerary & Stops
            </h3>

            {/* Timeline */}
            <div className="space-y-4 mb-8">
              {activeTrip.stops?.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-dark-border rounded-xl">
                  <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
                  <p className="text-slate-400 text-sm">No stops added yet. The journey is direct!</p>
                </div>
              ) : (
                <div className="relative pl-6">
                  {/* Vertical Line */}
                  <div className="absolute top-2 bottom-4 left-[11px] w-0.5 bg-dark-border"></div>
                  
                  {activeTrip.stops.map((stop, i) => (
                    <div key={stop._id} className="relative mb-6 group cursor-pointer" onClick={() => !activeTrip.tripCompleted && handleToggleStop(stop._id, stop.reached)}>
                      {/* Node Circle */}
                      <div className="absolute -left-6 top-1">
                        {stop.reached ? (
                          <CheckCircle2 className="w-6 h-6 text-brand-cyan fill-brand-cyan/20 ring-4 ring-dark-bg" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-500 fill-dark-surface ring-4 ring-dark-bg group-hover:text-brand-cyan transition-colors" />
                        )}
                      </div>
                      <div className={`p-4 rounded-xl border transition-all ${stop.reached ? 'bg-brand-cyan/5 border-brand-cyan/20' : 'bg-dark-surface border-dark-border hover:border-slate-500'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`font-bold ${stop.reached ? 'text-white' : 'text-slate-300'}`}>{stop.name}</h4>
                            <p className="text-sm text-slate-400 mt-1">{stop.reason}</p>
                          </div>
                          {stop.reached && <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider bg-brand-cyan/10 px-2 py-1 rounded">Reached</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Stop Form */}
            {!activeTrip.tripCompleted && (
              <form onSubmit={handleAddStop} className="flex flex-col sm:flex-row gap-3 bg-dark-bg/50 p-4 rounded-xl border border-dark-border">
                <input 
                  type="text" 
                  placeholder="Location Name" 
                  value={newStop.name}
                  onChange={e => setNewStop({...newStop, name: e.target.value})}
                  className="flex-1 bg-dark-surface border border-transparent rounded-lg px-3 py-2 text-sm text-white focus:border-brand-purple outline-none"
                />
                <input 
                  type="text" 
                  placeholder="Reason or activity (optional)" 
                  value={newStop.reason}
                  onChange={e => setNewStop({...newStop, reason: e.target.value})}
                  className="flex-1 bg-dark-surface border border-transparent rounded-lg px-3 py-2 text-sm text-white focus:border-brand-purple outline-none"
                />
                <button 
                  type="submit"
                  disabled={!newStop.name}
                  className="bg-brand-purple text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Stop
                </button>
              </form>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Packing List */}
            <div className="glass-panel p-4 sm:p-6 rounded-2xl border-t border-brand-cyan/20">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CheckSquare className="text-brand-cyan" /> Packing List
              </h3>
              
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {activeTrip.packingList?.length === 0 ? (
                  <p className="text-slate-500 text-sm">Nothing packed yet.</p>
                ) : (
                  activeTrip.packingList?.map(item => (
                    <div key={item._id} className="flex items-center gap-3 p-2 hover:bg-dark-surface rounded-lg transition-colors group cursor-pointer" onClick={() => !activeTrip.tripCompleted && togglePackingItem(activeTrip._id, item._id, !item.isPacked)}>
                      {item.isPacked ? (
                        <CheckSquare className="w-5 h-5 text-brand-cyan" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500 group-hover:text-brand-cyan transition-colors" />
                      )}
                      <span className={`text-sm ${item.isPacked ? 'text-slate-500 line-through' : 'text-white'}`}>{item.item}</span>
                    </div>
                  ))
                )}
              </div>

              {!activeTrip.tripCompleted && (
                <form onSubmit={handleAddPackingItem} className="flex gap-2">
                  <input type="text" placeholder="Add item..." value={newPackingItem} onChange={e => setNewPackingItem(e.target.value)} className="flex-1 bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-cyan" />
                  <button type="submit" disabled={!newPackingItem} className="bg-brand-cyan/20 text-brand-cyan p-2 rounded-lg hover:bg-brand-cyan hover:text-dark-bg transition-colors disabled:opacity-50"><Plus className="w-4 h-4"/></button>
                </form>
              )}
            </div>

            {/* Notes & Links */}
            <div className="glass-panel p-4 sm:p-6 rounded-2xl border-t border-yellow-500/20">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="text-yellow-500" /> Notes & Links
              </h3>
              
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {activeTrip.notes?.length === 0 ? (
                  <p className="text-slate-500 text-sm">No notes added.</p>
                ) : (
                  activeTrip.notes?.map(note => (
                    <div key={note._id} className="bg-dark-surface border border-dark-border p-3 rounded-xl">
                      <h4 className="text-white font-bold text-sm mb-1">{note.title}</h4>
                      <p className="text-slate-400 text-xs whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))
                )}
              </div>

              {!activeTrip.tripCompleted && (
                <form onSubmit={handleAddNote} className="space-y-2">
                  <input type="text" placeholder="Title (e.g., Hotel Address)" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-500" />
                  <textarea placeholder="Details or links..." rows="2" value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-500 resize-none"></textarea>
                  <button type="submit" disabled={!newNote.title || !newNote.content} className="w-full bg-yellow-500/10 text-yellow-500 text-xs font-bold py-2 rounded-lg hover:bg-yellow-500 hover:text-dark-bg transition-colors disabled:opacity-50">Add Note</button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COL: Financials & Settlement */}
        <div className="space-y-6">
          <div className="glass-panel p-4 sm:p-6 rounded-2xl border-t border-green-500/20">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <DollarSign className="text-green-500" /> Expense Tracker
            </h3>

            {/* Budget Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Total Spent</span>
                <span className={`font-bold ${totalExpenses > activeTrip.budget ? 'text-red-500' : 'text-white'}`}>
                  ${totalExpenses.toFixed(2)} / ${activeTrip.budget}
                </span>
              </div>
              <div className="h-2 w-full bg-dark-surface rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${totalExpenses > activeTrip.budget ? 'bg-red-500' : 'bg-gradient-to-r from-green-400 to-green-500'}`}
                  style={{ width: `${Math.min((totalExpenses / activeTrip.budget) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Add Expense */}
            {!activeTrip.tripCompleted && (
              <form onSubmit={handleAddExpense} className="space-y-3 mb-8 pb-8 border-b border-dark-border">
                <input 
                  type="number" min="1" step="0.01" required
                  placeholder="Amount ($)" 
                  value={newExpense.amount}
                  onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white focus:border-green-500 outline-none"
                />
                <input 
                  type="text" required
                  placeholder="What was this for?" 
                  value={newExpense.reason}
                  onChange={e => setNewExpense({...newExpense, reason: e.target.value})}
                  className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white focus:border-green-500 outline-none"
                />
                <button 
                  type="submit"
                  className="w-full bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500 hover:text-dark-bg py-2.5 rounded-lg text-sm font-bold transition-all"
                >
                  Log Expense
                </button>
              </form>
            )}

            {/* Split Settlement */}
            <div>
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" /> Settlement
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Total per person: <span className="font-bold text-white">${costPerPerson.toFixed(2)}</span>
              </p>

              <div className="space-y-3">
                {getMemberBalances().map(({ member, paid, balance }) => {
                  const mId = member._id || member;
                  const isYou = mId === user?._id;
                  
                  return (
                    <div key={mId} className="flex items-center justify-between p-3 bg-dark-surface/50 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        {member.profile?.profilePic ? (
                          <img src={member.profile.profilePic} className="w-8 h-8 rounded-full object-cover" alt="User" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                            {member.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">
                            {member.name || 'User'} {isYou && <span className="text-xs text-brand-cyan">(You)</span>}
                          </p>
                          <p className="text-[10px] text-slate-500">Paid: ${paid.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {balance > 0.01 ? (
                          <p className="text-sm font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">Gets ${Math.abs(balance).toFixed(2)}</p>
                        ) : balance < -0.01 ? (
                          <p className="text-sm font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded">Owes ${Math.abs(balance).toFixed(2)}</p>
                        ) : (
                          <p className="text-sm font-bold text-slate-400">Settled</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default TripDashboard;
