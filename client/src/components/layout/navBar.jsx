import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Compass, Users, MessageSquare, LogOut, User as UserIcon, House } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex justify-between items-center bg-dark-surface/70 backdrop-blur-xl border-b border-white/5">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center neon-border-cyan group-hover:rotate-12 transition-transform duration-300">
          <Compass className="text-white w-6 h-6" />
        </div>
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan to-brand-purple tracking-tight">Clyraa</span>
      </Link>

      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <>
            <Link to="/" className="text-slate-300 hover:text-brand-cyan hover:neon-text-cyan transition-colors flex items-center gap-2">
              <House className="w-5 h-5" /> <span className="hidden md:inline">Home</span>
            </Link>
            <Link to="/feed" className="text-slate-300 hover:text-brand-cyan hover:neon-text-cyan transition-colors flex items-center gap-2">
              <Compass className="w-5 h-5" /> <span className="hidden md:inline">Feed</span>
            </Link>
            <Link to="/communities" className="text-slate-300 hover:text-brand-fuchsia hover:neon-text-fuchsia transition-colors flex items-center gap-2">
              <Users className="w-5 h-5" /> <span className="hidden md:inline">Communities</span>
            </Link>
            <Link to="/groups" className="text-slate-300 hover:text-brand-cyan hover:neon-text-cyan transition-colors flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> <span className="hidden md:inline">Groups</span>
            </Link>

            <div className="h-6 w-px bg-dark-border mx-2"></div>

            <Link to={`/profile/${user?._id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img
                src={user?.profile?.profilePic || "https://ui-avatars.com/api/?name=" + (user?.name || "U") + "&background=random"}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border-2 border-brand-purple/50"
              />
            </Link>

            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="text-slate-300 hover:text-brand-cyan hover:neon-text-cyan transition-colors flex items-center gap-2">
              <House className="w-5 h-5" /> <span className="hidden md:inline">Home</span>
            </Link>
            <Link to="/login" className="text-slate-300 hover:text-white transition-colors">Log in</Link>
            <Link to="/register" className="px-5 py-2 rounded-lg bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-medium hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(168,85,247,0.4)]">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
