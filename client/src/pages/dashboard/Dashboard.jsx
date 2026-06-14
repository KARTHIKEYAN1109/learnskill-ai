import { ArrowRight, BookOpen, Flame, GraduationCap, Sparkles, Target, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import StatCard from '../../components/StatCard';
import { learningApi } from '../../api/endpoints';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../store/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading } = useAsync(async () => {
    const [pathRes, progressRes] = await Promise.all([learningApi.path(), learningApi.progress()]);
    return { path: pathRes.data.learningPath, progress: progressRes.data.progress };
  }, []);

  if (loading) return <div className="grid gap-4"><Skeleton className="h-56" /><Skeleton className="h-32" /></div>;
  const path = data?.path;
  const progress = data?.progress;
  if (!path) return <EmptyState title="Start with your resume" copy="Upload a PDF resume so LearnSphere AI can find skill gaps and generate your roadmap." to="/resume" action="Analyze resume" />;

  const chart = [
    { name: 'Start', progress: 5 },
    { name: 'Resume', progress: Math.max(20, path.skillGapScore / 3) },
    { name: 'Now', progress: progress?.percentage || 0 },
    { name: 'Goal', progress: 100 }
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg bg-slate-950 text-white shadow-soft">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1 text-sm text-blue-100"><Sparkles size={16} /> Personalized roadmap ready</p>
            <h2 className="mt-5 text-3xl font-semibold lg:text-4xl">Welcome, {user?.name}. Your track is {path.recommendedTrack}.</h2>
            <p className="mt-4 max-w-2xl text-slate-300">Focus next on {progress?.currentSkill || path.prioritySkills?.[0]}. Lessons, tutor prompts, quizzes, and progress tracking are connected to this roadmap.</p>
            <Link to={`/learning/${encodeURIComponent(progress?.currentSkill || path.prioritySkills?.[0] || '')}`} className="focus-ring mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-semibold text-slate-950">
              Continue learning
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="rounded-lg bg-white/10 p-5">
            <p className="text-sm text-blue-100">Learning progress</p>
            <div className="mt-4 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart}>
                  <defs><linearGradient id="progress" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} /><stop offset="95%" stopColor="#60a5fa" stopOpacity={0} /></linearGradient></defs>
                  <XAxis dataKey="name" stroke="#bfdbfe" />
                  <Tooltip />
                  <Area type="monotone" dataKey="progress" stroke="#93c5fd" fill="url(#progress)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Resume Score" value={`${path.skillGapScore}/100`} icon={Target} accent="blue" />
        <StatCard label="Progress" value={`${progress?.percentage || 0}%`} icon={GraduationCap} />
        <StatCard label="Streak" value={`${progress?.streak || 0} days`} icon={Flame} accent="sky" />
        <StatCard label="XP" value={progress?.xpPoints || 0} icon={Trophy} accent="slate" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="page-band p-6">
          <h3 className="text-lg font-semibold">Skills Found</h3>
          <div className="mt-4 flex flex-wrap gap-2">{path.skillsFound.map((skill) => <span key={skill} className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">{skill}</span>)}</div>
        </section>
        <section className="page-band p-6">
          <h3 className="text-lg font-semibold">Skills To Learn</h3>
          <div className="mt-4 space-y-3">{path.prioritySkills.map((skill) => <Link key={skill} to={`/learning/${encodeURIComponent(skill)}`} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:border-indigo-300"><span>{skill}</span><BookOpen size={18} /></Link>)}</div>
        </section>
      </div>
    </div>
  );
}
