import { Bookmark, BookOpen, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import { learningApi } from '../../api/endpoints';
import { useAsync } from '../../hooks/useAsync';

export default function Bookmarks() {
  const { data, loading, setData } = useAsync(async () => {
    const { data: result } = await learningApi.bookmarks();
    return result.bookmarks || [];
  }, []);

  const removeBookmark = async (bookmark) => {
    await learningApi.bookmark(bookmark.lesson._id);
    setData((items) => items.filter((item) => item._id !== bookmark._id));
  };

  if (loading) return <Skeleton className="h-96" />;
  if (!data?.length) {
    return <EmptyState title="No saved lessons yet" copy="Bookmark lessons while learning so you can return to the most useful topics quickly." to="/learning" action="Start learning" />;
  }

  return (
    <div className="space-y-6">
      <section className="page-band p-6 lg:p-8 text-slate-900 dark:text-slate-100">
        <p className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-sm font-medium text-indigo-700 dark:text-indigo-300"><Bookmark size={16} /> Saved lessons</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950 light:text-slate-950 dark:text-white">Bookmarks</h1>
        <p className="mt-2 max-w-2xl text-slate-600 light:text-slate-800 dark:text-slate-400">Return to lessons you marked for review, practice, or quick reference.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((bookmark) => {
          const lesson = bookmark.lesson;
          if (!lesson) return null;

          return (
            <article key={bookmark._id} className="page-band flex min-h-[220px] flex-col p-5 border-t-4 border-indigo-500 dark:border-indigo-500 shadow-md dark:shadow-[0_0_12px_rgba(99,102,241,0.12)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400">{lesson.skill}</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-950 light:text-slate-950 dark:text-white">{lesson.title}</h2>
                </div>
                <button onClick={() => removeBookmark(bookmark)} className="focus-ring rounded-lg border border-slate-200 dark:border-slate-800 p-2 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400" title="Remove bookmark">
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 light:text-slate-800 dark:text-slate-300">{lesson.explanation}</p>
              <Link to={`/learning/${encodeURIComponent(lesson.skill)}`} className="focus-ring mt-auto inline-flex items-center gap-2 pt-5 font-semibold text-indigo-700 dark:text-indigo-400">
                <BookOpen size={18} />
                Open lesson
              </Link>
            </article>
          );
        })}
      </section>
    </div>
  );
}
