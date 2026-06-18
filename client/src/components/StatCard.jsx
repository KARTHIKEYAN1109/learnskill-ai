export default function StatCard({ label, value, icon: Icon, accent = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
    sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
  };

  const borderColors = {
    indigo: 'border-t-4 border-indigo-500 dark:border-indigo-500 shadow-[inset_0_4px_12px_-4px_rgba(99,102,241,0.15)] dark:shadow-[0_0_15px_rgba(99,102,241,0.15)]',
    blue: 'border-t-4 border-blue-500 dark:border-blue-500 shadow-[inset_0_4px_12px_-4px_rgba(59,130,246,0.15)] dark:shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    sky: 'border-t-4 border-sky-500 dark:border-sky-400 shadow-[inset_0_4px_12px_-4px_rgba(14,165,233,0.15)] dark:shadow-[0_0_15px_rgba(14,165,233,0.15)]',
    emerald: 'border-t-4 border-emerald-500 dark:border-emerald-500 shadow-[inset_0_4px_12px_-4px_rgba(16,185,129,0.15)] dark:shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    slate: 'border-t-4 border-slate-400 dark:border-slate-500 shadow-[inset_0_4px_12px_-4px_rgba(148,163,184,0.1)] dark:shadow-[0_0_15px_rgba(148,163,184,0.05)]',
    amber: 'border-t-4 border-amber-500 dark:border-amber-500 shadow-[inset_0_4px_12px_-4px_rgba(245,158,11,0.2)] dark:shadow-[0_0_15px_rgba(245,158,11,0.18)]'
  };

  return (
    <section className={`page-band p-5 ${borderColors[accent] || borderColors.indigo}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400 light:text-slate-700 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 light:text-slate-950 dark:text-white">{value}</p>
        </div>
        {Icon && <div className={`rounded-lg p-3 ${colors[accent] || colors.indigo}`}><Icon size={22} /></div>}
      </div>
    </section>
  );
}
