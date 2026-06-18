import { ArrowRight, BookOpen, CheckCircle2, Flame, GraduationCap, Sparkles, Target } from 'lucide-react';
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
  const prioritySkills = path.prioritySkills?.length ? path.prioritySkills : path.missingSkills || [];
  const completedSkills = progress?.completedSkills || [];
  const nextSkill = progress?.currentSkill || prioritySkills.find((skill) => !completedSkills.includes(skill)) || prioritySkills[0] || '';

  const chart = [
    { name: 'Start', progress: 5 },
    { name: 'Resume', progress: Math.max(20, path.skillGapScore / 3) },
    { name: 'Now', progress: progress?.percentage || 0 },
    { name: 'Goal', progress: 100 }
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-slate-200 dark:border-purple-500/20 bg-white dark:bg-slate-950 text-slate-900 light:text-slate-900 dark:text-white shadow-soft">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 dark:bg-white/10 px-3 py-1 text-sm text-indigo-700 dark:text-blue-100"><Sparkles size={16} /> Personalized roadmap ready</p>
            <h2 className="mt-5 text-3xl font-semibold lg:text-4xl text-slate-900 light:text-slate-950 dark:text-white">Welcome, {user?.name}. Your track is {path.recommendedTrack}.</h2>
            <p className="mt-4 max-w-2xl text-slate-600 light:text-slate-800 dark:text-slate-300">Resume analysis found {path.skillsFound?.length || 0} current skills and {path.missingSkills?.length || 0} skill gaps. Focus next on {nextSkill || 'your next roadmap skill'}.</p>
            <Link to={`/learning/${encodeURIComponent(nextSkill)}`} className="focus-ring mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 dark:bg-white px-5 py-3 font-semibold text-white dark:text-slate-950 hover:bg-indigo-700 dark:hover:bg-slate-100 transition">
              Continue learning
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-white/10 p-5">
            <p className="text-sm text-indigo-700 dark:text-blue-100">Learning progress</p>
            <div className="mt-4 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart}>
                  <defs><linearGradient id="progress" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                  <XAxis dataKey="name" stroke="currentColor" className="text-slate-400 dark:text-blue-200" />
                  <Tooltip />
                  <Area type="monotone" dataKey="progress" stroke="#6366f1" fill="url(#progress)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Resume Score" value={`${path.skillGapScore}/100`} icon={Target} accent="indigo" />
        <StatCard label="Progress" value={`${progress?.percentage || 0}%`} icon={GraduationCap} accent="blue" />
        <StatCard label="Streak" value={`${progress?.streak || 0} days`} icon={Flame} accent="amber" />
        <StatCard label="Completed" value={completedSkills.length} icon={CheckCircle2} accent="emerald" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="page-band p-6 text-slate-900 light:text-slate-900 dark:text-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 light:text-slate-950 dark:text-white">Progress Overview</h3>
          <div className="mt-5 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600 light:text-slate-800 dark:text-slate-400">Roadmap completion</span>
                <span className="font-semibold text-slate-900 light:text-slate-950 dark:text-white">{progress?.percentage || 0}%</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-lg bg-indigo-600" style={{ width: `${progress?.percentage || 0}%` }} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 p-4">
                <p className="text-sm text-indigo-700 light:text-indigo-800 dark:text-indigo-300">Next Skill</p>
                <p className="mt-1 font-semibold text-slate-900 light:text-slate-950 dark:text-white">{nextSkill || 'Not set'}</p>
              </div>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 p-4">
                <p className="text-sm text-blue-700 light:text-blue-800 dark:text-blue-300">Current Streak</p>
                <p className="mt-1 font-semibold text-slate-900 light:text-slate-950 dark:text-white">{progress?.streak || 0} days</p>
              </div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 p-4">
                <p className="text-sm text-amber-700 light:text-amber-800 dark:text-amber-300">XP</p>
                <p className="mt-1 font-semibold text-slate-900 light:text-slate-950 dark:text-white">{progress?.xpPoints || 0}</p>
              </div>
            </div>
          </div>
        </section>
        <section className="page-band p-6 text-slate-900 light:text-slate-900 dark:text-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 light:text-slate-950 dark:text-white">Resume Analysis Summary</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-500 light:text-slate-700 dark:text-slate-400">Skills Found</p>
              <div className="mt-3 flex flex-wrap gap-2">{path.skillsFound?.map((skill) => <span key={skill} className="rounded-lg bg-blue-50 dark:bg-blue-950/40 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300">{skill}</span>)}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 light:text-slate-700 dark:text-slate-400">Priority Gaps</p>
              <div className="mt-3 flex flex-wrap gap-2">{prioritySkills.slice(0, 5).map((skill) => <span key={skill} className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">{skill}</span>)}</div>
            </div>
          </div>
          <p className="mt-5 rounded-lg bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 light:text-slate-800 dark:text-slate-400 font-medium">Estimated learning time: <span className="font-semibold text-slate-900 light:text-slate-950 dark:text-white">{path.estimatedLearningTime || 'Not available'}</span></p>
        </section>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="page-band p-6 text-slate-900 light:text-slate-900 dark:text-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 light:text-slate-950 dark:text-white">Skills To Learn</h3>
          <div className="mt-4 space-y-3">{prioritySkills.map((skill) => <Link key={skill} to={`/learning/${encodeURIComponent(skill)}`} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-purple-500/20 px-4 py-3 hover:border-indigo-300 dark:hover:border-indigo-800 bg-white dark:bg-[#11131e]/80 text-slate-900 dark:text-slate-100"><span>{skill}</span><BookOpen size={18} /></Link>)}</div>
        </section>
        <section className="page-band p-6 text-slate-900 light:text-slate-900 dark:text-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 light:text-slate-950 dark:text-white">Completed Skills</h3>
          {completedSkills.length ? (
            <div className="mt-4 flex flex-wrap gap-2">{completedSkills.map((skill) => <span key={skill} className="rounded-lg bg-green-50 dark:bg-green-950/40 px-3 py-2 text-sm font-medium text-green-700 dark:text-green-300">{skill}</span>)}</div>
          ) : (
            <p className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 light:text-slate-800 dark:text-slate-400">Complete your first lesson to start building momentum.</p>
          )}
        </section>
      </div>
    </div>
  );
}
