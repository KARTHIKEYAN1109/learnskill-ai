import { useEffect, useState } from 'react';
import { Bell, Bookmark, BookOpen, Brain, ChartNoAxesCombined, FileText, LayoutDashboard, LogOut, Map, Moon, Settings, Shield, Sparkles, Sun } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const baseNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resume', label: 'Resume', icon: FileText },
  { to: '/roadmap', label: 'Roadmap', icon: Map },
  { to: '/learning', label: 'Learning', icon: BookOpen },
  { to: '/bookmarks', label: 'Saved', icon: Bookmark },
  { to: '/progress', label: 'Progress', icon: ChartNoAxesCombined },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
  }, []);

  const toggleTheme = () => {
    // Permanent Dark Mode: switching deactivated.
  };

  const nav = user?.role === 'admin' ? [...baseNav, { to: '/admin', label: 'Admin', icon: Shield }] : baseNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#090a0f] text-slate-900 light:text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sticky top header block */}
      <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-purple-500/20 bg-white dark:bg-[#11131e]/80 px-4 py-4 dark:backdrop-blur lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Left side: Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30 dark:shadow-violet-500/20">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <p className="text-lg font-bold">
                <span className="bg-gradient-to-r from-violet-600 to-cyan-600 dark:from-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">LearnSphere</span>
              </p>
              <p className="text-xs font-semibold text-slate-600 light:text-slate-700 dark:text-slate-400">Personal learning OS</p>
            </div>
          </div>

          {/* Right side: Actions & Profile Dropdown */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="focus-ring rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} />}
            </button>

            {/* Notification Bell Badge */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="focus-ring rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
                aria-label="Notifications"
              >
                <Bell size={20} />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              {/* Notification Popover Dropdown */}
              {isNotificationOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsNotificationOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-slate-200/80 bg-white p-4 shadow-xl dark:border-purple-500/20 dark:bg-[#11131e]/95 dark:backdrop-blur-md z-40">
                    <p className="text-sm font-medium text-slate-700 light:text-slate-800 dark:text-slate-200 text-center py-2 flex items-center justify-center gap-2">
                      <span>🔔</span> No new notifications.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Clickable Profile Card / Avatar */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="focus-ring flex items-center gap-2 rounded-lg border border-slate-200 dark:border-purple-500/20 p-1 pr-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=4f46e5&color=fff`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=4f46e5&color=fff`;
                  }}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
                <span className="hidden text-sm font-semibold text-slate-700 light:text-slate-800 dark:text-slate-300 md:block">{user?.name?.split(' ')[0]}</span>
              </button>

              {/* Floating Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-slate-200/80 bg-white p-4 shadow-xl dark:border-purple-500/20 dark:bg-[#11131e]/95 dark:backdrop-blur-md z-40">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-purple-500/10 pb-3">
                      <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=4f46e5&color=fff`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=4f46e5&color=fff`;
                        }}
                        alt=""
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 light:text-slate-950 dark:text-slate-200">{user?.name}</p>
                        <p className="truncate text-xs text-slate-500 light:text-slate-700 dark:text-slate-400">{user?.email}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('/');
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 light:text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-purple-900/20 transition"
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </button>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
          className={`fixed bottom-0 left-0 top-[73px] z-20 hidden border-r border-slate-200 dark:border-purple-500/20 bg-white dark:bg-[#11131e]/80 dark:backdrop-blur-md lg:block transition-all duration-300 ease-in-out shadow-sm dark:shadow-[4px_0_24px_-4px_rgba(0,0,0,0.3)] ${
            isSidebarHovered ? 'w-64 py-5 px-5' : 'w-20 py-5 px-3'
          }`}
        >
          <nav className="space-y-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center rounded-lg py-3 text-sm font-medium transition-all duration-300 ${
                    isSidebarHovered ? 'px-4 gap-3 justify-start' : 'px-0 justify-center'
                  } ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 light:text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-400'
                      : 'text-slate-600 light:text-slate-800 hover:bg-slate-100 hover:text-slate-900 light:hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-white'
                  }`
                }
              >
                <Icon size={18} className={`flex-shrink-0 transition-colors duration-300 ${
                  label === 'Dashboard' ? 'text-indigo-500 dark:text-indigo-400' :
                  label === 'Resume' ? 'text-purple-500 dark:text-purple-400' :
                  label === 'Roadmap' ? 'text-emerald-500 dark:text-emerald-400' :
                  label === 'Learning' ? 'text-sky-500 dark:text-sky-400' :
                  label === 'Saved' ? 'text-pink-500 dark:text-pink-400' :
                  label === 'Progress' ? 'text-amber-500 dark:text-amber-400' :
                  label === 'Settings' ? 'text-slate-500 dark:text-slate-400' :
                  label === 'Admin' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500'
                }`} />
                <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                  isSidebarHovered ? 'opacity-100 max-w-[180px] translate-x-0' : 'opacity-0 max-w-0 -translate-x-4 pointer-events-none'
                }`}>
                  {label}
                </span>
              </NavLink>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className={`focus-ring absolute bottom-5 left-4 right-4 flex items-center justify-center transition-all duration-300 rounded-lg border border-slate-200 dark:border-purple-500/20 py-3 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
              isSidebarHovered ? 'px-4 gap-2' : 'px-0 gap-0'
            }`}
          >
            <LogOut size={18} className="text-red-500 dark:text-red-400 flex-shrink-0" />
            <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
              isSidebarHovered ? 'opacity-100 max-w-[150px] translate-x-0' : 'opacity-0 max-w-0 -translate-x-4 pointer-events-none'
            }`}>
              Logout
            </span>
          </button>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-20 min-w-0">
          <main className="p-4 pb-24 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-1 py-2 lg:hidden transition-colors duration-200">
        {baseNav.slice(0, 6).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium transition ${
                isActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <Icon size={18} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
