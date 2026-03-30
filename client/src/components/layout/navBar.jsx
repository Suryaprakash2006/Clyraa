import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Compass, Users, MessageSquare, LogOut, User as UserIcon, House } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `transition-colors flex items-center gap-2 
   ${isActive
      ? "text-brand-cyan"
      : "text-black hover:text-brand-cyan hover:neon-text-cyan"}`;

  return (
    <nav className="sticky top-0 z-50 px-6 py-2 flex justify-between items-center bg-white backdrop-blur-xl border-b">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-brand-cyan">
          Clyraa
        </span>
      </Link>

      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <>
            {/* Home */}
            <NavLink to="/" className={navItemClass}>
              <House className="w-5 h-5 block lg:hidden" />
              <span className="hidden lg:inline">Home</span>
            </NavLink>

            {/* Feed */}
            <NavLink to="/feed" className={navItemClass}>
              <Compass className="w-5 h-5 block lg:hidden" />
              <span className="hidden lg:inline">Feed</span>
            </NavLink>

            {/* Communities */}
            <NavLink to="/communities" className={navItemClass}>
              <Users className="w-5 h-5 block lg:hidden" />
              <span className="hidden lg:inline">Communities</span>
            </NavLink>

            {/* Groups */}
            <NavLink to="/groups" className={navItemClass}>
              <MessageSquare className="w-5 h-5 block lg:hidden" />
              <span className="hidden lg:inline">Groups</span>
            </NavLink>

            <div className="h-6 w-px bg-dark-border mx-2"></div>

            {/* Profile */}
            <Link
              to={`/profile/${user?._id}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src={
                  user?.profile?.profilePic ||
                  "https://ui-avatars.com/api/?name=" +
                  (user?.name || "U") +
                  "&background=random"
                }
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border-2 border-black"
              />
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <NavLink to="/" className={navItemClass}>
              <House className="w-5 h-5 block lg:hidden" />
              <span className="hidden lg:inline">Home</span>
            </NavLink>

            <Link className="text-black hover:text-brand-cyan transition-colors" to="/login">
              Log in
            </Link>

            <Link
              to="/register"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-medium hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
