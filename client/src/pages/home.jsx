import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useTripStore } from "../store/tripStore";
import { Globe2, Users, Plane, Hash, ArrowRight, Activity, MapPin, Compass } from "lucide-react";
import Footer from "../components/layout/footer";

const Home = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { fetchGlobalActiveTrip } = useTripStore();
  const navigate = useNavigate();

  const [activeTrip, setActiveTrip] = useState(null);
  const [loadingTrip, setLoadingTrip] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLoadingTrip(true);
      fetchGlobalActiveTrip().then(trip => {
        setActiveTrip(trip);
        setLoadingTrip(false);
      });
    }
  }, [isAuthenticated, fetchGlobalActiveTrip]);


  // 🔹 NOT LOGGED IN
  if (!isAuthenticated) {
    return (
      <div className="w-full flex flex-col min-h-[calc(100vh-80px)]">
        
        {/* HERO SECTION */}
        <section className="relative w-screen -ml-[50vw] left-1/2 px-6 py-20 md:py-32 flex flex-col items-center text-center overflow-hidden">
          <div className="absolute inset-0 bg-dark-bg -z-20"></div>
          {/* Gradients */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-cyan/20 blur-[150px] rounded-full -z-10"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/20 blur-[150px] rounded-full -z-10 pointer-events-none"></div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-surface border border-white/10 text-brand-cyan text-sm font-semibold mb-8 backdrop-blur-md shadow-lg">
            <Globe2 className="w-4 h-4" /> Join the New Era of Travel
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight max-w-4xl mb-6">
            The World is Yours to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-purple">Explore & Connect</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            Clyraa is your definitive platform to discover communities, plan group journeys, track shared expenses, and broadcast your adventures to the world.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-brand-cyan to-blue-600 text-white font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all hover:-translate-y-1 flex items-center justify-center gap-2 text-lg">
              Start Journey <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="px-8 py-4 bg-dark-surface border border-dark-border text-white font-bold rounded-2xl hover:bg-white/5 transition-all text-lg flex items-center justify-center">
              Login
            </Link>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="px-6 py-20 max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need in one place</h2>
            <p className="text-slate-400">Stop juggling apps. Clyraa handles the coordination so you can enjoy the experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl border-t border-brand-cyan/20 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-brand-cyan/10 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-brand-cyan" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Group Coordination</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Create private groups, chat in real-time, and manage members. Perfect for travel squads or meetup planning.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border-t border-brand-purple/20 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-brand-purple/10 flex items-center justify-center mb-6">
                <Plane className="w-7 h-7 text-brand-purple" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Trip Dashboard</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Plan stops, track live progress, and seamlessly split group expenses. The ultimate travel companion tool.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border-t border-green-500/20 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6">
                <Hash className="w-7 h-7 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Communities</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Join public communities based on your interests. Engage in forums, post updates, and connect globally.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // 🔹 LOGGED IN
  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-80px)] animate-in fade-in duration-500">
      
      {/* Personalized Welcome */}
      <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* MAIN CONTENT (Active Trip & Quick Links) */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          
          {/* Active Trip Widget */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-dark-border relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/20 blur-[100px] pointer-events-none group-hover:bg-brand-cyan/30 transition-all duration-700"></div>
            
            <div className="p-6 sm:p-8 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-brand-cyan" />
                <h2 className="text-lg sm:text-xl font-bold text-white">Live Dashboard</h2>
              </div>

              {loadingTrip ? (
                <div className="py-8 text-center text-slate-400 animate-pulse font-medium">Loading live trip status...</div>
              ) : activeTrip ? (
                <div className="bg-dark-bg/60 border border-white/5 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 border-b border-dark-border pb-6">
                    <div className="w-full">
                      <div className="flex items-center justify-between sm:justify-start gap-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Active Journey</span>
                        </div>
                        <div className="text-right sm:hidden">
                          <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-0.5">Budget</p>
                          <p className="text-sm font-bold text-green-400">${activeTrip.budget}</p>
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white flex items-center flex-wrap gap-2 sm:gap-3">
                        <span>{activeTrip.source}</span> <ArrowRight className="text-slate-500 w-4 h-4 sm:w-5 sm:h-5" /> <span>{activeTrip.destination}</span>
                      </h3>
                    </div>
                    <div className="text-right hidden sm:block shrink-0">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Budget</p>
                      <p className="text-lg font-bold text-green-400">${activeTrip.budget}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-400 flex items-center gap-2 self-start sm:self-auto">
                      <MapPin className="w-4 h-4" /> {activeTrip.stops?.length || 0} Planned Stops
                    </p>
                    <button 
                      onClick={() => navigate(`/groups/${activeTrip.groupId}/trip`)}
                      className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-xl bg-brand-cyan text-dark-bg font-bold hover:bg-white hover:text-dark-bg transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] text-sm sm:text-base text-center"
                    >
                      Open Trip Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-dark-bg/60 border border-dark-border border-dashed rounded-2xl p-6 sm:p-10 text-center">
                  <div className="w-16 h-16 mx-auto bg-dark-surface rounded-full flex items-center justify-center mb-4">
                    <Compass className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">No active journeys</h3>
                  <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                    You aren't on any trip right now. Head over to your groups to plan a new adventure!
                  </p>
                  <button 
                    onClick={() => navigate('/groups')}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-brand-cyan/50 text-brand-cyan hover:bg-brand-cyan/10 transition-colors text-sm font-semibold"
                  >
                    Go to Groups
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Feed Teaser */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-dark-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Hash className="text-brand-purple w-5 h-5 sm:w-6 sm:h-6" /> See what's happening
              </h2>
              <Link to="/feed" className="text-xs sm:text-sm text-brand-cyan hover:text-white transition-colors font-medium">Open Feed →</Link>
            </div>
            
            <div className="bg-dark-bg/50 rounded-2xl p-6 border border-white/5 flex items-center justify-center min-h-[150px]">
              <div className="text-center">
                <p className="text-slate-400 text-sm sm:text-base mb-4">Catch up with the latest posts from travelers around the globe.</p>
                <Link to="/feed" className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 py-2 rounded-lg bg-dark-surface border border-dark-border hover:border-brand-purple/50 text-white transition-all text-sm font-semibold">
                  Browse Feed
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* SIDEBAR */}
        <div className="space-y-8">
          
          {/* Communities Teaser */}
          <div className="glass-panel p-6 rounded-3xl border border-dark-border bg-gradient-to-b from-dark-surface to-dark-bg relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold mb-4 shadow-lg shadow-green-500/20">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Explore Communities</h2>
              <p className="text-slate-400 text-sm mb-6">
                Discover niches, join discussions, and find people who share your specific travel interests.
              </p>
              
              <button 
                onClick={() => navigate('/communities')}
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white font-semibold hover:border-green-500/50 hover:bg-dark-surface transition-all flex justify-between items-center group"
              >
                Find a Community <ArrowRight className="w-4 h-4 text-green-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* App Stats / Info Block */}
          <div className="glass-panel p-6 rounded-3xl border border-dark-border flex flex-col items-center justify-center text-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Clyraa Network</p>
            <div className="flex gap-4">
               <div>
                  <p className="text-2xl font-black text-white">10K+</p>
                  <p className="text-[10px] text-slate-400 tracking-wider">Travelers</p>
               </div>
               <div className="w-px h-10 bg-dark-border"></div>
               <div>
                  <p className="text-2xl font-black text-brand-cyan">500+</p>
                  <p className="text-[10px] text-slate-400 tracking-wider">Communities</p>
               </div>
            </div>
          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
};

export default Home;