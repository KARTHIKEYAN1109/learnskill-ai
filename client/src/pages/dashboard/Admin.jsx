import { BookOpen, GraduationCap, Layers3, Users } from 'lucide-react';
import Skeleton from '../../components/Skeleton';
import StatCard from '../../components/StatCard';
import { adminApi } from '../../api/endpoints';
import { useAsync } from '../../hooks/useAsync';

export default function Admin() {
  const { data, loading } = useAsync(async () => {
    const [statsRes, usersRes, tracksRes] = await Promise.all([adminApi.stats(), adminApi.users(), adminApi.tracks()]);
    return { stats: statsRes.data.stats, users: usersRes.data.users, tracks: tracksRes.data.tracks };
  }, []);

  if (loading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Admin Console</h1>
        <p className="mt-2 text-slate-600">Platform statistics, users, and learning track visibility.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={data.stats.users} icon={Users} />
        <StatCard label="Learning Paths" value={data.stats.learningPaths} icon={Layers3} accent="blue" />
        <StatCard label="Lessons" value={data.stats.lessons} icon={BookOpen} accent="sky" />
        <StatCard label="Quizzes" value={data.stats.quizzes} icon={GraduationCap} accent="slate" />
      </div>
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="page-band overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold">Users</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {data.users.map((user) => <div key={user._id} className="grid gap-2 p-5 md:grid-cols-[1fr_1fr_120px]"><span className="font-medium">{user.name}</span><span className="text-slate-500">{user.email}</span><span className="rounded-lg bg-slate-100 px-3 py-1 text-center text-sm">{user.role}</span></div>)}
          </div>
        </div>
        <div className="page-band p-5">
          <h2 className="font-semibold">Learning Tracks</h2>
          <div className="mt-4 space-y-3">{data.tracks.map((track) => <div key={track} className="rounded-lg border border-slate-200 px-4 py-3">{track}</div>)}</div>
        </div>
      </section>
    </div>
  );
}
