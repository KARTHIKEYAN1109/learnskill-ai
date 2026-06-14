import { Award, BarChart3, Flame, Target, Trophy } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current Skill" value={data.currentSkill || 'Not set'} icon={Target} />
        <StatCard label="XP Points" value={data.xpPoints} icon={Trophy} accent="blue" />
        <StatCard label="Level" value={data.level} icon={Award} accent="sky" />
        <StatCard label="Streak" value={`${data.streak} days`} icon={Flame} accent="slate" />
      </div>
      <section className="page-band p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Learning Progress</h1>
            <p className="mt-1 text-slate-500">{data.percentage}% of your current roadmap is complete</p>
          </div>
          <BarChart3 className="text-indigo-600" />
        </div>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.quizScores || []}>
              <XAxis dataKey="skill" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="accuracy" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="page-band p-6">
          <h2 className="font-semibold">Completed Skills</h2>
          <div className="mt-4 flex flex-wrap gap-2">{data.completedSkills?.map((skill) => <span key={skill} className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">{skill}</span>)}</div>
        </div>
        <div className="page-band p-6">
          <h2 className="font-semibold">Recent Quiz Scores</h2>
          <div className="mt-4 space-y-3">{data.quizScores?.slice(-5).reverse().map((score) => <div key={`${score.skill}-${score.attemptedAt}`} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"><span>{score.skill}</span><strong>{score.accuracy}%</strong></div>)}</div>
        </div>
      </section>
    </div>
  );
}
