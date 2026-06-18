import { Bookmark, BookOpen, Brain, ChartNoAxesCombined, FileText, LayoutDashboard, LogOut, Map, Settings, Shield } from 'lucide-react';
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
  const nav = user?.role === 'admin' ? [...baseNav, { to: '/admin', label: 'Admin', icon: Shield }] : baseNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white p-5 lg:block">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-indigo-600 text-white">
            <Brain size={24} />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-950">LearnSphere AI</p>
            <p className="text-sm text-slate-500">Personal learning OS</p>
          </div>
        </div>
        <nav className="mt-8 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} className="focus-ring absolute bottom-5 left-5 right-5 flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50">
          <LogOut size={18} />
          Logout
        </button>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Welcome back</p>
              <h1 className="text-xl font-semibold text-slate-950">{user?.name}</h1>
            </div>
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=4f46e5&color=fff`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=4f46e5&color=fff`;
                }}
                alt=""
                className="h-10 w-10 rounded-full"
              />
            </div>
          </div>
        </header>
        <main className="p-4 pb-24 lg:p-8">
          <Outlet />
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-slate-200 bg-white px-1 py-2 lg:hidden">
        {baseNav.slice(0, 6).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium ${isActive ? 'text-indigo-700' : 'text-slate-500'}`}
          >
            <Icon size={18} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
