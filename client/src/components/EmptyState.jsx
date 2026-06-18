import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({ title, copy, to, action }) {
  return (
    <section className="page-band p-8 text-center">
      <h2 className="text-xl font-semibold text-slate-900 light:text-slate-950 dark:text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-slate-600 light:text-slate-800 dark:text-slate-400">{copy}</p>
      {to && (
        <Link to={to} className="focus-ring mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white">
          {action}
          <ArrowRight size={18} />
        </Link>
      )}
    </section>
  );
}
