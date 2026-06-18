import { Award, BarChart3, Flame, Target, Trophy } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import StatCard from '../../components/StatCard';
import { learningApi } from '../../api/endpoints';
import { useAsync } from '../../hooks/useAsync';

export default function Progress() {
  const { data, loading } = useAsync(async () => {
    const { data: result } = await learningApi.progress();
    return result.progress;
  }, []);

  if (loading) return <Skeleton className="h-96" />;
  if (!data) return <EmptyState title="Progress starts with a lesson" copy="Complete a lesson or quiz to see analytics here." to="/roadmap" action="View roadmap" />;

  const isEmpty = !data.quizScores || data.quizScores.length === 0;
  const chartData = isEmpty ? [
    { skill: 'Quiz 1', accuracy: 0 },
    { skill: 'Quiz 2', accuracy: 0 },
    { skill: 'Quiz 3', accuracy: 0 },
    { skill: 'Quiz 4', accuracy: 0 },
    { skill: 'Quiz 5', accuracy: 0 }
  ] : data.quizScores;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current Skill" value={data.currentSkill || 'Not set'} icon={Target} accent="indigo" />
        <StatCard label="XP Points" value={data.xpPoints} icon={Trophy} accent="indigo" />
        <StatCard label="Level" value={data.level} icon={Award} accent="emerald" />
        <StatCard label="Streak" value={`${data.streak} days`} icon={Flame} accent="amber" />
      </div>
      <section className="page-band p-6 text-slate-900 light:text-slate-900 dark:text-slate-100 border-t-4 border-indigo-500 dark:border-indigo-500 shadow-md dark:shadow-[0_0_15px_rgba(99,102,241,0.12)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 light:text-slate-950 dark:text-white">Learning Progress</h1>
            <p className="mt-1 text-slate-500 light:text-slate-700 dark:text-slate-400">{data.percentage}% of your current roadmap is complete</p>
          </div>
          <BarChart3 className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="relative mt-6 h-72">
          {isEmpty && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#090a0f]/80 backdrop-blur-[2px] rounded-lg z-10 pointer-events-none">
              <p className="text-sm font-semibold text-slate-900 light:text-slate-950 dark:text-slate-200 text-center px-4 max-w-xs leading-relaxed">
                Start completing lessons and quizzes to map your progress graph!
              </p>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
              <XAxis dataKey="skill" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              {!isEmpty && <Bar dataKey="accuracy" fill="#4f46e5" radius={[6, 6, 0, 0]} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="page-band p-6 text-slate-900 light:text-slate-900 dark:text-slate-100">
          <h2 className="font-semibold text-slate-900 light:text-slate-950 dark:text-white">Completed Skills</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.completedSkills?.map((skill) => (
              <span key={skill} className="rounded-lg bg-green-50 dark:bg-green-950/40 px-3 py-2 text-sm font-medium text-green-700 dark:text-green-300">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="page-band p-6 text-slate-900 light:text-slate-900 dark:text-slate-100">
          <h2 className="font-semibold text-slate-900 light:text-slate-950 dark:text-white">Recent Quiz Scores</h2>
          <div className="mt-4 space-y-3">
            {data.quizScores?.slice(-5).reverse().map((score) => (
              <div key={`${score.skill}-${score.attemptedAt}`} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-purple-500/15 px-4 py-3 text-slate-700 light:text-slate-800 dark:text-slate-300 bg-white dark:bg-slate-900/40">
                <span>{score.skill}</span>
                <strong>{score.accuracy}%</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
