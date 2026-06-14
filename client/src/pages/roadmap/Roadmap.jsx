import { BookOpen, CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import { learningApi } from '../../api/endpoints';
import { useAsync } from '../../hooks/useAsync';

export default function Roadmap() {
  const { data, loading } = useAsync(async () => {
    const [pathRes, progressRes] = await Promise.all([learningApi.path(), learningApi.progress()]);
    return { path: pathRes.data.learningPath, progress: progressRes.data.progress };
  }, []);

  if (loading) return <Skeleton className="h-96" />;
  if (!data?.path) return <EmptyState title="No roadmap yet" copy="Analyze your resume to create a skill progression map." to="/resume" action="Upload resume" />;

  const skills = data.path.prioritySkills?.length ? data.path.prioritySkills : data.path.missingSkills;
  const completed = new Set(data.progress?.completedSkills || []);

  return (
    <section className="page-band p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-3xl font-semibold">Your learning roadmap</h1>
          <p className="mt-2 text-slate-600">{data.path.recommendedTrack} - {data.path.estimatedLearningTime}</p>
        </div>
        <div className="rounded-lg bg-indigo-50 px-4 py-3 font-semibold text-indigo-700">{data.progress?.percentage || 0}% complete</div>
      </div>
      <div className="mt-8 max-w-3xl">
        {skills.map((skill, index) => {
          const done = completed.has(skill);
          return (
            <div key={skill} className="grid grid-cols-[40px_1fr] gap-4">
              <div className="flex flex-col items-center">
                <div className={`grid h-10 w-10 place-items-center rounded-lg ${done ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {done ? <CheckCircle2 size={22} /> : <Circle size={20} />}
                </div>
                {index < skills.length - 1 && <div className="h-12 w-px bg-slate-200" />}
              </div>
              <Link to={`/learning/${encodeURIComponent(skill)}`} className="mb-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-5 py-4 transition hover:border-indigo-300 hover:shadow-soft">
                <div>
                  <h2 className="font-semibold text-slate-950">{skill}</h2>
                  <p className="mt-1 text-sm text-slate-500">{done ? 'Completed' : 'Ready for lesson, tutor, and quiz'}</p>
                </div>
                <BookOpen size={20} className="text-indigo-600" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
