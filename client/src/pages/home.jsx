import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useTripStore } from "../store/tripStore";
import {
  Globe2, Users, Plane, Hash, ArrowRight, Activity,
  MapPin, Compass, Sparkles, ChevronRight
} from "lucide-react";
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

  if (!isAuthenticated) {
    return (
      <div className="w-full flex flex-col min-h-[calc(100vh-80px)] bg-gray-50 rounded-2xl">

        {/* HERO */}
        <section className="relative w-screen -ml-[50vw] left-1/2 px-6 py-24 md:py-36 flex flex-col items-center text-center overflow-hidden border-b border-gray-100">
          {/* Subtle colour wash */}
          {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(6,182,212,0.07)_0%,_transparent_65%)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.06)_0%,_transparent_60%)] pointer-events-none"></div> */}

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-bold mb-8 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" /> New Era of Travel
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.08] max-w-4xl mb-6">
            The World is Yours to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-blue-500 to-brand-purple">
              Explore & Connect
            </span>
          </h1>

          <p className="text-gray-500 text-base md:text-lg max-w-xl mb-10 leading-relaxed">
            Discover communities, plan group journeys, track shared expenses, and broadcast your adventures to the world — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              to="/register"
              className="px-8 py-4 bg-gradient-to-r from-brand-cyan to-blue-500 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-brand-cyan/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
            >
              Start Journey <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all text-base flex items-center justify-center shadow-sm"
            >
              Login
            </Link>
          </div>
        </section>

        {/* FEATURES */}
        <section className="px-6 py-24 max-w-6xl mx-auto w-full">
          <div className="text-center mb-16">
            <p className="text-brand-cyan text-xs font-bold uppercase tracking-[0.2em] mb-3">Why Clyraa</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Everything you need, in one place
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
              Stop juggling apps. Clyraa handles the coordination so you can enjoy the experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                color: "cyan",
                title: "Group Coordination",
                desc: "Create private groups, chat in real-time, and manage members. Perfect for travel squads or meetup planning.",
                accent: "brand-cyan",
                bg: "bg-brand-cyan/5",
                border: "border-brand-cyan/10",
                iconBg: "bg-brand-cyan/10",
                iconColor: "text-brand-cyan",
                hoverBorder: "hover:border-brand-cyan/30",
              },
              {
                icon: Plane,
                color: "purple",
                title: "Trip Dashboard",
                desc: "Plan stops, track live progress, and seamlessly split group expenses. The ultimate travel companion tool.",
                accent: "brand-purple",
                bg: "bg-brand-purple/5",
                border: "border-brand-purple/10",
                iconBg: "bg-brand-purple/10",
                iconColor: "text-brand-purple",
                hoverBorder: "hover:border-brand-purple/30",
              },
              {
                icon: Hash,
                color: "green",
                title: "Communities",
                desc: "Join public communities based on your interests. Engage in forums, post updates, and connect globally.",
                accent: "green-500",
                bg: "bg-green-50",
                border: "border-green-100",
                iconBg: "bg-green-100",
                iconColor: "text-green-600",
                hoverBorder: "hover:border-green-200",
              },
            ].map(({ icon: Icon, title, desc, bg, border, iconBg, iconColor, hoverBorder, iconColor: ic }) => (
              <div
                key={title}
                className={`group bg-white p-8 rounded-3xl border ${border} ${hoverBorder} hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-gray-200/60 relative overflow-hidden`}
              >
                <div className={`absolute inset-0 ${bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none`}></div>
                <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-6 relative z-10`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 relative z-10">{title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm relative z-10">{desc}</p>
                <div className={`mt-6 flex items-center gap-1 ${iconColor} text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity relative z-10`}>
                  Learn more <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // ─── LOGGED IN ────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-80px)] bg-gray-50 animate-in fade-in duration-500">

      <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto w-full">

        {/* Page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-[0.18em] font-bold mb-1">Welcome back</p>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {user?.name?.split(" ")[0] ?? "Traveler"}'s Hub
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* ── MAIN CONTENT ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Active Trip Widget */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-300">

              {/* Card header stripe */}
              <div className="px-6 sm:px-8 pt-6 pb-5 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-brand-cyan" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-800">Live Dashboard</h2>
                    <p className="text-xs text-gray-400 font-medium">Your active journey</p>
                  </div>
                </div>
                {activeTrip && (
                  <span className="flex items-center gap-1.5 text-xs text-green-600 font-bold bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Live
                  </span>
                )}
              </div>

              <div className="p-6 sm:p-8">
                {loadingTrip ? (
                  <div className="py-10 text-center">
                    <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
                      <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce [animation-delay:0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce [animation-delay:0.3s]"></span>
                      <span className="ml-1 font-medium">Loading trip status</span>
                    </div>
                  </div>
                ) : activeTrip ? (
                  <div className="bg-gradient-to-br from-brand-cyan/5 to-blue-500/5 border border-brand-cyan/10 rounded-2xl p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5 pb-5 border-b border-brand-cyan/10">
                      <div className="w-full">
                        <div className="flex items-center justify-between sm:justify-start gap-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Active Journey</span>
                          </div>
                          <div className="text-right sm:hidden">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Budget</p>
                            <p className="text-sm font-black text-green-600">${activeTrip.budget}</p>
                          </div>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center flex-wrap gap-2">
                          <span>{activeTrip.source}</span>
                          <ArrowRight className="text-gray-300 w-4 h-4" />
                          <span>{activeTrip.destination}</span>
                        </h3>
                      </div>
                      <div className="text-right hidden sm:block shrink-0">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Budget</p>
                        <p className="text-xl font-black text-green-600">${activeTrip.budget}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 self-start sm:self-auto font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {activeTrip.stops?.length || 0} Planned Stops
                      </p>
                      <button
                        onClick={() => navigate(`/groups/${activeTrip.groupId}/trip`)}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-cyan text-white font-bold hover:bg-brand-cyan/90 transition-colors shadow-lg shadow-brand-cyan/20 text-sm text-center"
                      >
                        Open Trip Dashboard
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 sm:p-12 text-center bg-gray-50/50">
                    <div className="w-14 h-14 mx-auto bg-white rounded-2xl flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
                      <Compass className="w-7 h-7 text-gray-400" />
                    </div>
                    <h3 className="text-base font-bold text-gray-800 mb-2">No active journeys</h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto leading-relaxed font-medium">
                      You aren't on any trip right now. Head over to your groups to plan a new adventure!
                    </p>
                    <button
                      onClick={() => navigate('/groups')}
                      className="px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-brand-cyan/40 hover:text-brand-cyan transition-all text-sm font-bold shadow-sm"
                    >
                      Go to Groups
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Feed Teaser */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-300">
              <div className="px-6 sm:px-8 pt-6 pb-5 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-purple/10 flex items-center justify-center">
                    <Hash className="w-4 h-4 text-brand-purple" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-800">See what's happening</h2>
                    <p className="text-xs text-gray-400 font-medium">Latest from the community</p>
                  </div>
                </div>
                <Link
                  to="/feed"
                  className="text-xs text-brand-cyan font-bold hover:underline flex items-center gap-1"
                >
                  Open Feed <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="p-6 sm:p-8">
                <div className="bg-gradient-to-br from-brand-purple/5 to-brand-cyan/5 border border-purple-100 rounded-2xl p-8 text-center">
                  <Globe2 className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto leading-relaxed font-medium">
                    Catch up with the latest posts from travelers around the globe.
                  </p>
                  <Link
                    to="/feed"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-brand-purple/30 hover:bg-brand-purple/5 text-gray-700 hover:text-brand-purple transition-all text-sm font-bold shadow-sm"
                  >
                    Browse Feed
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* ── SIDEBAR ── */}
          <div className="space-y-6">

            {/* Communities Teaser */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-300">
              <div className="h-2 w-full bg-gradient-to-r from-green-400 to-brand-cyan"></div>
              <div className="p-6">
                <div className="w-11 h-11 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mb-5">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-base font-black text-gray-900 mb-2">Explore Communities</h2>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed font-medium">
                  Discover niches, join discussions, and find people who share your travel interests.
                </p>
                <button
                  onClick={() => navigate('/communities')}
                  className="w-full px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm font-bold hover:bg-green-100 hover:border-green-200 transition-all flex justify-between items-center group"
                >
                  Find a Community
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 p-6 hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-300">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.18em] mb-4">Quick Access</p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/groups')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:border-brand-cyan/20 hover:bg-brand-cyan/5 transition-all group text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-brand-cyan" />
                    </div>
                    <span className="text-gray-600 font-semibold group-hover:text-gray-900 transition-colors">My Groups</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/feed')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:border-brand-purple/20 hover:bg-brand-purple/5 transition-all group text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-purple/10 flex items-center justify-center">
                      <Globe2 className="w-3.5 h-3.5 text-brand-purple" />
                    </div>
                    <span className="text-gray-600 font-semibold group-hover:text-gray-900 transition-colors">Global Feed</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/communities')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all group text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <Hash className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="text-gray-600 font-semibold group-hover:text-gray-900 transition-colors">Communities</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>
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