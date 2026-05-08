import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Compass, Users, MessageSquare, LogOut, House } from 'lucide-react';

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
      : "text-black hover:text-brand-cyan"}`;

  // Mobile bottom tab item
  const mobileTabClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all ${
      isActive ? 'text-brand-cyan' : 'text-gray-400 hover:text-gray-600'
    }`;

  return (
    <>
      {/* ── TOP NAV ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 px-4 sm:px-6 py-2 flex justify-between items-center bg-white border-b border-gray-100">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-brand-cyan">
            Clyraa
          </span>
        </Link>

        {/* Desktop nav links — hidden on mobile */}
        <div className="hidden lg:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <NavLink to="/" className={navItemClass}>
                <span>Home</span>
              </NavLink>
              <NavLink to="/feed" className={navItemClass}>
                <span>Feed</span>
              </NavLink>
              <NavLink to="/communities" className={navItemClass}>
                <span>Communities</span>
              </NavLink>
              <NavLink to="/groups" className={navItemClass}>
                <span>Groups</span>
              </NavLink>

              <div className="h-6 w-px bg-gray-200 mx-2"></div>

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
                  className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
                />
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <NavLink to="/" className={navItemClass}>
                <span>Home</span>
              </NavLink>
              <Link className="text-gray-700 hover:text-brand-cyan font-medium transition-colors" to="/login">
                Log in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-semibold hover:opacity-90 transition-opacity shadow-md"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile top-right: profile + logout — only when authenticated */}
        {isAuthenticated && (
          <div className="flex lg:hidden items-center gap-3">
            <Link
              to={`/profile/${user?._id}`}
              className="hover:opacity-80 transition-opacity"
            >
              <img
                src={
                  user?.profile?.profilePic ||
                  "https://ui-avatars.com/api/?name=" +
                  (user?.name || "U") +
                  "&background=random"
                }
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
              />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Mobile top-right: login + signup — only when NOT authenticated */}
        {!isAuthenticated && (
          <div className="flex lg:hidden items-center gap-3">
            <Link className="text-gray-700 hover:text-brand-cyan font-medium text-sm transition-colors" to="/login">
              Log in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
            >
              Sign up
            </Link>
          </div>
        )}
      </nav>

      {/* ── MOBILE BOTTOM TAB BAR — only when authenticated ─────────────── */}
      {isAuthenticated && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center max-w-lg mx-auto px-2">

            <NavLink to="/" end className={mobileTabClass}>
              {({ isActive }) => (
                <>
                  <div className={`w-6 h-6 flex items-center justify-center transition-transform ${isActive ? 'scale-110' : ''}`}>
                    <House className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wide">Home</span>
                </>
              )}
            </NavLink>

            <NavLink to="/feed" className={mobileTabClass}>
              {({ isActive }) => (
                <>
                  <div className={`w-6 h-6 flex items-center justify-center transition-transform ${isActive ? 'scale-110' : ''}`}>
                    <Compass className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wide">Feed</span>
                </>
              )}
            </NavLink>

            <NavLink to="/communities" className={mobileTabClass}>
              {({ isActive }) => (
                <>
                  <div className={`w-6 h-6 flex items-center justify-center transition-transform ${isActive ? 'scale-110' : ''}`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wide">Communities</span>
                </>
              )}
            </NavLink>

            <NavLink to="/groups" className={mobileTabClass}>
              {({ isActive }) => (
                <>
                  <div className={`w-6 h-6 flex items-center justify-center transition-transform ${isActive ? 'scale-110' : ''}`}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wide">Groups</span>
                </>
              )}
            </NavLink>

          </div>
        </nav>
      )}

      {/* Bottom padding spacer so content doesn't hide behind the tab bar on mobile */}
      {isAuthenticated && (
        <div className="lg:hidden h-16" />
      )}
    </>
  );
};

export default Navbar;
