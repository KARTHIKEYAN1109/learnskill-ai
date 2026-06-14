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
      <section className="page-band p-6 lg:p-8">
        <p className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700"><Bookmark size={16} /> Saved lessons</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">Bookmarks</h1>
        <p className="mt-2 max-w-2xl text-slate-600">Return to lessons you marked for review, practice, or quick reference.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((bookmark) => {
          const lesson = bookmark.lesson;
          if (!lesson) return null;

          return (
            <article key={bookmark._id} className="page-band flex min-h-[220px] flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-indigo-700">{lesson.skill}</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-950">{lesson.title}</h2>
                </div>
                <button onClick={() => removeBookmark(bookmark)} className="focus-ring rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-red-50 hover:text-red-700" title="Remove bookmark">
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{lesson.explanation}</p>
              <Link to={`/learning/${encodeURIComponent(lesson.skill)}`} className="focus-ring mt-auto inline-flex items-center gap-2 pt-5 font-semibold text-indigo-700">
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
