import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTripStore } from '../store/tripStore';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import {
  Plane, MapPin, DollarSign, Calendar, Navigation,
  CheckCircle2, Circle, AlertCircle, Plus, Users,
  CheckSquare, Square, FileText, Check, Power, ArrowRight
} from 'lucide-react';

const TripDashboard = () => {
  const { groupId, tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    activeTrip, fetchTripInfo, createTrip, startTrip,
    addStop, updateStop, addExpense, endTrip, restartTrip,
    addPackingItem, togglePackingItem, addNote, isLoading
  } = useTripStore();

  const { groups, fetchUserGroups } = useGroupStore();
  const group = groups.find(g => g._id === groupId);

  useEffect(() => {
    if (!group) fetchUserGroups();
    fetchTripInfo(groupId, tripId);
  }, [groupId, tripId, fetchTripInfo, group, fetchUserGroups]);

  const [tripForm, setTripForm] = useState({ source: '', destination: '', budget: '', mode: 'car', days: '' });
  const [newStop, setNewStop] = useState({ name: '', reason: '' });
  const [newExpense, setNewExpense] = useState({ amount: '', reason: '' });
  const [newPackingItem, setNewPackingItem] = useState('');
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    try {
      await createTrip({ groupId, ...tripForm, budget: Number(tripForm.budget), days: Number(tripForm.days) });
    } catch (error) { alert(error.response?.data?.message || "Error creating trip"); }
  };

  const handleStartTrip = async () => {
    if (!activeTrip) return;
    try { await startTrip(activeTrip._id); }
    catch (error) { alert(error.response?.data?.message || "Error starting trip"); }
  };

  const handleAddStop = async (e) => {
    e.preventDefault();
    if (!newStop.name || !activeTrip) return;
    try { await addStop(activeTrip._id, newStop); setNewStop({ name: '', reason: '' }); }
    catch (error) { alert("Error adding stop"); }
  };

  const handleToggleStop = async (stopId, reached) => {
    try { await updateStop(activeTrip._id, stopId, { reached: !reached }); }
    catch (error) { alert("Error updating stop"); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.reason || !activeTrip) return;
    try {
      await addExpense(activeTrip._id, { amount: Number(newExpense.amount), reason: newExpense.reason });
      setNewExpense({ amount: '', reason: '' });
    } catch (error) { alert("Error adding expense"); }
  };

  const handleAddPackingItem = async (e) => {
    e.preventDefault();
    if (!newPackingItem || !activeTrip) return;
    try { await addPackingItem(activeTrip._id, { item: newPackingItem }); setNewPackingItem(''); }
    catch (error) { alert("Error adding item"); }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content || !activeTrip) return;
    try { await addNote(activeTrip._id, newNote); setNewNote({ title: '', content: '' }); }
    catch (error) { alert("Error adding note"); }
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
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin"></div>
          <span className="font-medium">Loading Trip Data...</span>
        </div>
      </div>
    );
  }

  let totalExpenses = 0;
  const payerTotals = {};
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

  // ── VIEW 1: No Trip ──────────────────────────────────────────────────────
  if (!activeTrip) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in duration-500">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-cyan to-blue-500"></div>
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-brand-cyan/10 border border-brand-cyan/20 rounded-2xl flex items-center justify-center mb-4">
                <Plane className="w-8 h-8 text-brand-cyan" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Plan a New Trip</h2>
              <p className="text-gray-500 font-medium">Set the details for your group's upcoming adventure.</p>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Source</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input type="text" required value={tripForm.source} onChange={e => setTripForm({ ...tripForm, source: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-gray-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all" placeholder="City, Country" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Destination</label>
                  <div className="relative">
                    <Navigation className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input type="text" required value={tripForm.destination} onChange={e => setTripForm({ ...tripForm, destination: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-gray-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all" placeholder="Where going?" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Budget ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input type="number" min="0" required value={tripForm.budget} onChange={e => setTripForm({ ...tripForm, budget: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-gray-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all" placeholder="0" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Days</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input type="number" min="1" required value={tripForm.days} onChange={e => setTripForm({ ...tripForm, days: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-gray-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all" placeholder="1" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Mode</label>
                  <select value={tripForm.mode} onChange={e => setTripForm({ ...tripForm, mode: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan appearance-none cursor-pointer transition-all">
                    <option value="flight">Flight</option>
                    <option value="train">Train</option>
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="solo">Solo</option>
                  </select>
                </div>
              </div>

              <button type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-cyan to-blue-500 text-white font-bold shadow-lg shadow-brand-cyan/20 hover:shadow-xl hover:shadow-brand-cyan/30 hover:-translate-y-0.5 transition-all mt-2">
                Save Trip Details
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW 2: Created, not started ─────────────────────────────────────────
  if (activeTrip && !activeTrip.tripStarted && !activeTrip.tripCompleted) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden text-center">
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-cyan via-blue-500 to-brand-purple"></div>
          <div className="p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(6,182,212,0.05)_0%,_transparent_60%)] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.05)_0%,_transparent_60%)] pointer-events-none"></div>

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-cyan/10 text-brand-cyan text-xs font-black uppercase tracking-widest rounded-full border border-brand-cyan/20 mb-6">
                <Check className="w-3 h-3" /> Itinerary Planned
              </span>

              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 flex items-center justify-center gap-3 flex-wrap">
                <span>{activeTrip.source}</span>
                <ArrowRight className="w-6 h-6 text-gray-300" />
                <span>{activeTrip.destination}</span>
              </h1>

              <div className="flex items-center justify-center gap-4 text-sm font-medium text-gray-500 mb-10">
                <span>{activeTrip.days} Days</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="capitalize">{activeTrip.mode}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-green-600 font-bold">${activeTrip.budget} Budget</span>
              </div>

              <button
                onClick={handleStartTrip}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-cyan to-blue-500 text-white font-black text-lg shadow-xl shadow-brand-cyan/25 hover:shadow-2xl hover:shadow-brand-cyan/35 hover:-translate-y-1 transition-all"
              >
                <Plane className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Start the Journey!
              </button>

              <p className="text-xs text-gray-400 font-medium mt-5 max-w-sm mx-auto leading-relaxed">
                Starting this trip will declare it as your <b className="text-gray-600">currently active global trip</b>. You can only have one active trip across all groups at a time.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW 3: Full Dashboard ───────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-in fade-in duration-500 pb-10 px-4 sm:px-0">

      {/* Header Banner */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
        <div className={`h-1.5 w-full ${activeTrip.tripCompleted ? 'bg-gradient-to-r from-gray-300 to-gray-400' : 'bg-gradient-to-r from-brand-cyan to-blue-500'}`}></div>
        <div className="p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {activeTrip.tripCompleted ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full border border-gray-200">
                  <Check className="w-3 h-3" /> Trip Completed
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full border border-green-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  Live Journey
                </span>
              )}
              <span className="text-gray-400 text-xs font-medium capitalize">{activeTrip.mode}</span>
              {activeTrip.tripCompleted ? (
                <button onClick={() => navigate(`/groups/${groupId}/trip`)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-full text-[10px] sm:text-xs font-bold hover:bg-brand-cyan hover:text-white transition-colors ml-auto md:ml-0">
                  <Plane className="w-3 h-3" /> Back to Current Trip
                </button>
              ) : (
                <button onClick={handleEndTrip}
                  className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-500 border border-red-100 rounded-full text-[10px] sm:text-xs font-bold hover:bg-red-500 hover:text-white transition-colors ml-auto md:ml-0">
                  <Power className="w-3 h-3" /> End Journey
                </button>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-3 flex-wrap">
              <span>{activeTrip.source}</span>
              <Plane className="w-5 h-5 text-brand-cyan" />
              <span>{activeTrip.destination}</span>
            </h1>
          </div>
          <div className="flex gap-6 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
            <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Duration</p>
              <p className="text-xl font-black text-gray-900">{activeTrip.days} <span className="text-sm font-normal text-gray-400">Days</span></p>
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Budget</p>
              <p className="text-xl font-black text-green-600">${activeTrip.budget}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── LEFT: Stops, Packing, Notes ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Itinerary & Stops */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-purple/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-brand-purple" />
              </div>
              <h3 className="font-black text-gray-900">Itinerary & Stops</h3>
            </div>
            <div className="p-6">
              {activeTrip.stops?.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm font-medium">No stops added yet. The journey is direct!</p>
                </div>
              ) : (
                <div className="relative pl-6 mb-6">
                  <div className="absolute top-2 bottom-4 left-[11px] w-0.5 bg-gray-100"></div>
                  {activeTrip.stops.map((stop) => (
                    <div key={stop._id} className="relative mb-5 group cursor-pointer" onClick={() => !activeTrip.tripCompleted && handleToggleStop(stop._id, stop.reached)}>
                      <div className="absolute -left-6 top-1">
                        {stop.reached
                          ? <CheckCircle2 className="w-6 h-6 text-brand-cyan fill-brand-cyan/10" />
                          : <Circle className="w-6 h-6 text-gray-300 group-hover:text-brand-cyan transition-colors" />}
                      </div>
                      <div className={`p-4 rounded-2xl border transition-all ${stop.reached ? 'bg-brand-cyan/5 border-brand-cyan/15' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`font-bold text-sm ${stop.reached ? 'text-gray-900' : 'text-gray-700'}`}>{stop.name}</h4>
                            {stop.reason && <p className="text-xs text-gray-400 font-medium mt-0.5">{stop.reason}</p>}
                          </div>
                          {stop.reached && <span className="text-[10px] font-black text-brand-cyan uppercase tracking-wider bg-brand-cyan/10 px-2.5 py-1 rounded-full border border-brand-cyan/20">Reached</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!activeTrip.tripCompleted && (
                <form onSubmit={handleAddStop} className="flex flex-col sm:flex-row gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <input type="text" placeholder="Location name" value={newStop.name} onChange={e => setNewStop({ ...newStop, name: e.target.value })}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all" />
                  <input type="text" placeholder="Reason (optional)" value={newStop.reason} onChange={e => setNewStop({ ...newStop, reason: e.target.value })}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all" />
                  <button type="submit" disabled={!newStop.name}
                    className="bg-brand-cyan text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-brand-cyan/90 transition-colors flex items-center gap-1 justify-center">
                    <Plus className="w-4 h-4" /> Stop
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Packing + Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Packing List */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4 text-brand-cyan" />
                </div>
                <h3 className="font-black text-gray-900">Packing List</h3>
              </div>
              <div className="p-5">
                <div className="space-y-1.5 mb-4 max-h-48 overflow-y-auto pr-1">
                  {activeTrip.packingList?.length === 0
                    ? <p className="text-gray-400 text-sm font-medium py-4 text-center">Nothing packed yet.</p>
                    : activeTrip.packingList?.map(item => (
                      <div key={item._id}
                        className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group"
                        onClick={() => !activeTrip.tripCompleted && togglePackingItem(activeTrip._id, item._id, !item.isPacked)}>
                        {item.isPacked
                          ? <CheckSquare className="w-4 h-4 text-brand-cyan shrink-0" />
                          : <Square className="w-4 h-4 text-gray-300 group-hover:text-brand-cyan shrink-0 transition-colors" />}
                        <span className={`text-sm font-medium ${item.isPacked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item.item}</span>
                      </div>
                    ))}
                </div>
                {!activeTrip.tripCompleted && (
                  <form onSubmit={handleAddPackingItem} className="flex gap-2">
                    <input type="text" placeholder="Add item..." value={newPackingItem} onChange={e => setNewPackingItem(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-all" />
                    <button type="submit" disabled={!newPackingItem}
                      className="bg-brand-cyan/10 text-brand-cyan p-2 rounded-xl hover:bg-brand-cyan hover:text-white transition-colors disabled:opacity-50 border border-brand-cyan/20">
                      <Plus className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-yellow-500" />
                </div>
                <h3 className="font-black text-gray-900">Notes & Links</h3>
              </div>
              <div className="p-5">
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
                  {activeTrip.notes?.length === 0
                    ? <p className="text-gray-400 text-sm font-medium py-4 text-center">No notes added.</p>
                    : activeTrip.notes?.map(note => (
                      <div key={note._id} className="bg-yellow-50/60 border border-yellow-100 p-3.5 rounded-xl">
                        <h4 className="text-gray-800 font-bold text-sm mb-1">{note.title}</h4>
                        <p className="text-gray-500 text-xs whitespace-pre-wrap leading-relaxed">{note.content}</p>
                      </div>
                    ))}
                </div>
                {!activeTrip.tripCompleted && (
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <input type="text" placeholder="Title (e.g., Hotel Address)" value={newNote.title} onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all" />
                    <textarea placeholder="Details or links..." rows="2" value={newNote.content} onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 resize-none transition-all" />
                    <button type="submit" disabled={!newNote.title || !newNote.content}
                      className="w-full bg-yellow-50 text-yellow-600 text-xs font-bold py-2.5 rounded-xl border border-yellow-100 hover:bg-yellow-100 transition-colors disabled:opacity-50">
                      Add Note
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Expenses & Settlement ── */}
        <div>
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-black text-gray-900">Expense Tracker</h3>
            </div>
            <div className="p-6 space-y-6">

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500 font-medium">Total Spent</span>
                  <span className={`font-black ${totalExpenses > activeTrip.budget ? 'text-red-500' : 'text-gray-800'}`}>
                    ${totalExpenses.toFixed(2)} / ${activeTrip.budget}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${totalExpenses > activeTrip.budget ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-green-400 to-brand-cyan'}`}
                    style={{ width: `${Math.min((totalExpenses / activeTrip.budget) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Add Expense */}
              {!activeTrip.tripCompleted && (
                <form onSubmit={handleAddExpense} className="space-y-2 pb-6 border-b border-gray-100">
                  <input type="number" min="1" step="0.01" required placeholder="Amount ($)" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all" />
                  <input type="text" required placeholder="What was this for?" value={newExpense.reason} onChange={e => setNewExpense({ ...newExpense, reason: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all" />
                  <button type="submit"
                    className="w-full bg-green-50 text-green-600 border border-green-100 hover:bg-green-500 hover:text-white py-2.5 rounded-xl text-sm font-bold transition-all">
                    Log Expense
                  </button>
                </form>
              )}

              {/* Settlement */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <h4 className="text-xs font-black text-gray-600 uppercase tracking-wider">Settlement</h4>
                </div>
                <p className="text-xs text-gray-400 font-medium mb-4">
                  Per person: <span className="font-black text-gray-700">${costPerPerson.toFixed(2)}</span>
                </p>
                <div className="space-y-2">
                  {getMemberBalances().map(({ member, paid, balance }) => {
                    const mId = member._id || member;
                    const isYou = mId === user?._id;
                    return (
                      <div key={mId} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          {member.profile?.profilePic
                            ? <img src={member.profile.profilePic} className="w-8 h-8 rounded-xl object-cover" alt="User" />
                            : <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center text-xs font-black text-gray-600">
                                {member.name?.charAt(0).toUpperCase() || '?'}
                              </div>}
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {member.name || 'User'} {isYou && <span className="text-xs text-brand-cyan font-normal">(You)</span>}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">Paid: ${paid.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {balance > 0.01
                            ? <p className="text-xs font-black text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">Gets ${Math.abs(balance).toFixed(2)}</p>
                            : balance < -0.01
                            ? <p className="text-xs font-black text-red-500 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">Owes ${Math.abs(balance).toFixed(2)}</p>
                            : <p className="text-xs font-bold text-gray-400">Settled</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDashboard;