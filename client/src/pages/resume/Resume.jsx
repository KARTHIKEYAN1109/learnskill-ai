import { useState } from 'react';
import { FileUp, Loader2, Sparkles } from 'lucide-react';
import { resumeApi } from '../../api/endpoints';

export default function Resume() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await resumeApi.analyze(file);
      setAnalysis(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not analyze resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="page-band p-6 lg:p-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-sm font-medium text-indigo-700 dark:text-indigo-300"><Sparkles size={16} /> AI Resume Analyzer</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 light:text-slate-950 dark:text-white">Upload your resume PDF</h1>
            <p className="mt-2 max-w-2xl text-slate-600 light:text-slate-800 dark:text-slate-300">LearnSphere AI extracts your current skills, maps missing skills, and creates a prioritized learning track.</p>
          </div>
          <button onClick={submit} disabled={!file || loading} className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <FileUp size={18} />}
            Analyze
          </button>
        </div>
        <label
          onDrop={(event) => {
            event.preventDefault();
            setFile(event.dataTransfer.files?.[0]);
          }}
          onDragOver={(event) => event.preventDefault()}
          className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-purple-500/40 bg-slate-50 dark:from-purple-950/20 dark:to-indigo-950/20 p-10 text-center transition-all duration-300 hover:border-purple-500/60 dark:hover:border-purple-400/60"
        >
          <FileUp className="text-purple-500 dark:text-purple-400 animate-pulse" size={40} />
          <p className="mt-4 font-semibold text-slate-900 light:text-slate-950 dark:text-white">{file ? file.name : 'Drop a PDF here or browse'}</p>
          <p className="mt-1 text-sm text-slate-500 light:text-slate-600 dark:text-slate-400">PDF only, up to 5MB</p>
          <input type="file" accept="application/pdf" className="hidden" onChange={(event) => setFile(event.target.files?.[0])} />
        </label>
        {error && <p className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">{error}</p>}
      </section>

      {analysis && (
        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="page-band p-6">
            <p className="text-sm font-medium text-slate-500 light:text-slate-600 dark:text-slate-400">Recommended Career Path</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 light:text-slate-950 dark:text-white">{analysis.recommendedTrack}</h2>
            <div className="mt-6 rounded-lg bg-slate-50 dark:bg-[#11131e]/90 border border-slate-200 dark:border-purple-500/20 p-5 text-slate-900 light:text-slate-950 dark:text-white">
              <p className="text-sm text-slate-500 light:text-slate-700 dark:text-blue-200">Skill Gap Score</p>
              <p className="mt-2 text-4xl font-semibold">{analysis.skillGapScore}</p>
              <p className="mt-2 text-slate-600 light:text-slate-800 dark:text-slate-300">{analysis.estimatedLearningTime}</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <ResultList title="Skills Found" items={analysis.skillsFound} tone="blue" />
            <ResultList title="Missing Skills" items={analysis.missingSkills} tone="indigo" />
            <div className="md:col-span-2"><ResultList title="Learning Priority" items={analysis.prioritySkills} tone="slate" /></div>
          </div>
        </section>
      )}
    </div>
  );
}

function ResultList({ title, items, tone }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 light:text-blue-900 dark:bg-blue-950/40 dark:text-blue-300',
    indigo: 'bg-indigo-50 text-indigo-700 light:text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300',
    slate: 'bg-slate-100 text-slate-700 light:text-slate-850 dark:bg-slate-800 dark:text-slate-300'
  };
  return (
    <section className="page-band p-6">
      <h3 className="font-semibold text-slate-900 light:text-slate-950 dark:text-white">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">{items?.map((item) => <span className={`rounded-lg px-3 py-2 text-sm font-medium ${colors[tone]}`} key={item}>{item}</span>)}</div>
    </section>
  );
}
