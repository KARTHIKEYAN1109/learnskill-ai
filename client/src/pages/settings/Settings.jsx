import { Bell, KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="page-band p-6">
        <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=4f46e5&color=fff`} alt="" className="h-20 w-20 rounded-full" />
        <h1 className="mt-4 text-2xl font-semibold">{user?.name}</h1>
        <p className="text-slate-500">{user?.email}</p>
        <p className="mt-3 inline-flex rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700">{user?.role}</p>
      </section>
      <section className="space-y-4">
        <SettingsRow icon={UserRound} title="Profile" copy="Your profile powers personalized dashboards and tutor context." />
        <SettingsRow icon={KeyRound} title="Authentication" copy="Access tokens and refresh tokens keep sessions persistent." />
        <SettingsRow icon={Bell} title="Learning Reminders" copy="Notification preferences are ready for a future scheduler." />
        <SettingsRow icon={ShieldCheck} title="Privacy" copy="Resume analysis and AI history stay scoped to your account." />
      </section>
    </div>
  );
}

function SettingsRow({ icon: Icon, title, copy }) {
  return (
    <div className="page-band flex items-start gap-4 p-5">
      <div className="rounded-lg bg-blue-50 p-3 text-blue-700"><Icon size={22} /></div>
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{copy}</p>
      </div>
    </div>
  );
}
