export default function StatCard({ label, value, icon: Icon, accent = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700',
    blue: 'bg-blue-50 text-blue-700',
    sky: 'bg-sky-50 text-sky-700',
    slate: 'bg-slate-100 text-slate-700'
  };

  return (
    <section className="page-band p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        {Icon && <div className={`rounded-lg p-3 ${colors[accent]}`}><Icon size={22} /></div>}
      </div>
    </section>
  );
}
