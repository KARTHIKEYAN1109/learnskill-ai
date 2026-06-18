import { useEffect, useMemo, useState } from 'react';
import { Bookmark, Check, CheckCircle2, GraduationCap, Save, Send, Sparkles, StickyNote, Trash2, XCircle, Video, ExternalLink } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import { learningApi } from '../../api/endpoints';

export default function Learning() {
  const { skill: routeSkill } = useParams();
  const navigate = useNavigate();
  const [path, setPath] = useState(null);
  const [progress, setProgress] = useState(null);
  const [lessonState, setLessonState] = useState({ lesson: null, loading: true, bookmarked: false, cached: false, ai: null, resources: [] });
  const [quiz, setQuiz] = useState(null);
  const [quizMetadata, setQuizMetadata] = useState({ cached: false, ai: null });
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [chat, setChat] = useState([]);
  const [question, setQuestion] = useState('');
  const [note, setNote] = useState({ content: '', saved: '', loading: false, saving: false });
  const skill = useMemo(() => decodeURIComponent(routeSkill || progress?.currentSkill || path?.prioritySkills?.[0] || ''), [routeSkill, progress, path]);

  useEffect(() => {
    Promise.all([learningApi.path(), learningApi.progress()]).then(([pathRes, progressRes]) => {
      setPath(pathRes.data.learningPath);
      setProgress(progressRes.data.progress);
      const next = routeSkill || progressRes.data.progress?.currentSkill || pathRes.data.learningPath?.prioritySkills?.[0];
      if (!routeSkill && next) navigate(`/learning/${encodeURIComponent(next)}`, { replace: true });
    });
  }, [navigate, routeSkill]);

  useEffect(() => {
    if (!skill) return;
    setLessonState((current) => ({ ...current, loading: true }));
    setQuiz(null);
    setQuizMetadata({ cached: false, ai: null });
    setAnswers({});
    setQuizResult(null);
    learningApi.lesson(skill).then(({ data }) => setLessonState({
      lesson: data.lesson,
      loading: false,
      bookmarked: data.bookmarked,
      cached: data.cached,
      ai: data.ai,
      resources: data.resources
    }));
    learningApi.tutorHistory(skill).then(({ data }) => setChat(data.messages || [])).catch(() => {});
    setNote({ content: '', saved: '', loading: true, saving: false });
    learningApi.getNote(skill)
      .then(({ data }) => {
        const content = data.note?.content || '';
        setNote({ content, saved: content, loading: false, saving: false });
      })
      .catch(() => setNote({ content: '', saved: '', loading: false, saving: false }));
  }, [skill]);

  if (!path && !skill) return <EmptyState title="No active skill" copy="Generate a roadmap from your resume before starting lessons." to="/resume" action="Analyze resume" />;
  if (lessonState.loading) return <Skeleton className="h-[640px]" />;
  const lesson = lessonState.lesson;
  const resources = lessonState.resources || [];
  const roadmap = path?.prioritySkills?.length ? path.prioritySkills : path?.missingSkills || [];

  const ask = async () => {
    if (!question.trim()) return;
    const userMessage = { role: 'user', content: question };
    setChat((items) => [...items, userMessage]);
    setQuestion('');
    const { data } = await learningApi.askTutor({ skill, question });
    setChat((items) => [...items, { role: 'assistant', content: data.answer }]);
  };

  const generateQuiz = async () => {
    const { data } = await learningApi.quiz(skill);
    setQuiz(data.quiz);
    setQuizMetadata({ cached: data.cached, ai: data.ai });
    setAnswers({});
    setQuizResult(null);
  };

  const submitQuiz = async () => {
    const ordered = quiz.questions.map((_, index) => answers[index]);
    const { data } = await learningApi.submitQuiz({ skill, answers: ordered });
    setQuizResult({ ...data, answers: ordered });
    const progressRes = await learningApi.progress();
    setProgress(progressRes.data.progress);
  };

  const complete = async () => {
    const { data } = await learningApi.complete(skill);
    setProgress(data.progress);
  };

  const saveNote = async (content = note.content) => {
    setNote((current) => ({ ...current, saving: true }));
    const { data } = await learningApi.saveNote({ skill, content });
    const saved = data.note?.content || '';
    setNote({ content: saved, saved, loading: false, saving: false });
  };

  const deleteNote = async () => {
    await saveNote('');
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[260px_1fr_340px]">
      <aside className="page-band h-fit p-4">
        <h2 className="px-2 text-sm font-semibold uppercase text-slate-500 light:text-slate-600 dark:text-slate-400">Roadmap</h2>
        <div className="mt-3 space-y-1">
          {roadmap.map((item) => <Link key={item} to={`/learning/${encodeURIComponent(item)}`} className={`block rounded-lg px-3 py-3 text-sm font-medium ${item === skill ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-slate-600 light:text-slate-700 light:hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>{item}</Link>)}
        </div>
      </aside>
      <section className="space-y-6">
        <article className="page-band p-6 lg:p-8 text-slate-900 light:text-slate-900 dark:text-slate-100">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="inline-flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-400"><Sparkles size={16} /> AI Lesson</p>
                {lessonState.cached && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                    ⚡ Loaded from local cache
                  </span>
                )}
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-slate-900 light:text-slate-950 dark:text-white">{lesson.title}</h1>
            </div>
            <button onClick={() => learningApi.bookmark(lesson._id).then(({ data }) => setLessonState((s) => ({ ...s, bookmarked: data.bookmarked })))} className="focus-ring rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800" title="Bookmark lesson">
              <Bookmark size={20} fill={lessonState.bookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
          {lessonState.ai?.fallback && (
            <div className="mt-4 space-y-3">
              {lessonState.ai.reason === 'rate_limited' && (
                <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30 p-4 text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2 shadow-sm">
                  <span className="text-base">⚠️</span>
                  <div>
                    <span className="font-semibold">AI System Busy:</span> Our AI system is receiving high traffic right now. Showing a study preview while we reconnect!
                  </div>
                </div>
              )}
              {(lessonState.ai.reason === 'missing_api_key' || lessonState.ai.reason === 'model_init_failed') && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-200 flex items-start gap-2 shadow-sm">
                  <span className="text-base">🛠️</span>
                  <div>
                    <span className="font-semibold">Developer Alert:</span> Gemini API key is missing or model initialization failed. Serving local fallback content.
                  </div>
                </div>
              )}
            </div>
          )}
          <LessonBlock title="Explanation" content={lesson.explanation} />
          <LessonBlock title="Example" content={lesson.example} />
          <LessonBlock title="Exercise" content={lesson.exercise} />

          {resources && resources.length > 0 && (
            <div className="mt-8 bg-[#11131e]/50 border border-slate-800 text-white p-6 rounded-xl backdrop-blur-md hover:border-purple-500/30 transition-all">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <span>📚</span> Supplementary Resources & Video Guides
              </h3>
              <div className="space-y-3">
                {resources.map((res) => {
                  const Icon = res.type === 'video' ? Video : ExternalLink;
                  const iconColor = res.type === 'video' ? 'text-red-500' : 'text-purple-500';
                  return (
                    <a
                      key={res.url}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/40 p-4 hover:border-purple-500/25 transition-all hover:bg-slate-950/60"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={iconColor} size={20} />
                        <span className="font-medium text-slate-200">{res.title}</span>
                      </div>
                      <span className="text-xs text-slate-400">Open link</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={generateQuiz} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white"><GraduationCap size={18} /> Generate Quiz</button>
            <button onClick={complete} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-5 py-3 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"><Check size={18} /> Mark Complete</button>
            {lesson.nextTopic && <Link to={`/learning/${encodeURIComponent(lesson.nextTopic)}`} className="focus-ring rounded-lg border border-slate-200 dark:border-slate-800 px-5 py-3 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Next Topic</Link>}
          </div>
        </article>
        {quiz && (
          <section className="page-band p-6 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-slate-900 light:text-slate-950 dark:text-white">Quiz: {quiz.skill}</h2>
                  {quizMetadata.cached && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                      ⚡ Loaded from local cache
                    </span>
                  )}
                </div>
                {quizResult && <p className="mt-1 text-sm text-slate-500 light:text-slate-700 dark:text-slate-400">Answer review is ready. Revisit each question below.</p>}
              </div>
              {quizResult && (
                <div className="rounded-lg bg-slate-950 px-5 py-3 text-white">
                  <p className="text-xs font-medium uppercase text-blue-100">Score</p>
                  <p className="mt-1 text-2xl font-semibold">{quizResult.score}/{quizResult.total} <span className="text-base text-slate-300">({quizResult.accuracy}%)</span></p>
                </div>
              )}
            </div>
            {quizMetadata.ai?.fallback && (
              <div className="mt-4 space-y-3">
                {quizMetadata.ai.reason === 'rate_limited' && (
                  <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30 p-4 text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2 shadow-sm">
                    <span className="text-base">⚠️</span>
                    <div>
                      <span className="font-semibold">AI System Busy:</span> Our AI system is receiving high traffic right now. Showing a study preview while we reconnect!
                    </div>
                  </div>
                )}
                {(quizMetadata.ai.reason === 'missing_api_key' || quizMetadata.ai.reason === 'model_init_failed') && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                  <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-200 flex items-start gap-2 shadow-sm">
                    <span className="text-base">🛠️</span>
                    <div>
                      <span className="font-semibold">Developer Alert:</span> Gemini API key is missing or model initialization failed. Serving local fallback content.
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="mt-5 space-y-5">
              {quiz.questions.map((item, index) => (
                <div key={item.question} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{index + 1}. {item.question}</p>
                    {quizResult && (
                      quizResult.answers[index] === item.answer
                        ? <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 dark:bg-green-950/40 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-300"><CheckCircle2 size={14} /> Correct</span>
                        : <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 dark:bg-red-950/40 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-300"><XCircle size={14} /> Review</span>
                    )}
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {item.options.map((option) => {
                      const selected = answers[index] === option;
                      const submittedAnswer = quizResult?.answers[index];
                      const isCorrectAnswer = quizResult && option === item.answer;
                      const isWrongAnswer = quizResult && submittedAnswer === option && option !== item.answer;
                      const optionClass = isCorrectAnswer
                        ? 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300'
                        : isWrongAnswer
                          ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                          : selected
                            ? 'border-indigo-500 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';

                      return (
                        <button key={option} disabled={Boolean(quizResult)} onClick={() => setAnswers({ ...answers, [index]: option })} className={`rounded-lg border px-3 py-2 text-left text-sm disabled:cursor-default ${optionClass}`}>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {quizResult && (
                    <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-700 light:text-slate-800 dark:text-slate-300">
                      <p><span className="font-medium">Your answer:</span> {quizResult.answers[index] || 'No answer selected'}</p>
                      <p className="mt-1"><span className="font-medium">Correct answer:</span> {item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={submitQuiz} disabled={Boolean(quizResult)} className="focus-ring mt-5 rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white disabled:opacity-60">{quizResult ? 'Quiz Submitted' : 'Submit Quiz'}</button>
          </section>
        )}
        <section className="page-band p-6 text-slate-900 light:text-slate-900 dark:text-slate-100">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <p className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-sm font-medium text-indigo-700 dark:text-indigo-400"><StickyNote size={16} /> Notes</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900 light:text-slate-950 dark:text-white">Your notes for {skill}</h2>
              <p className="mt-1 text-sm text-slate-500 light:text-slate-700 dark:text-slate-400">Capture examples, reminders, and questions while you learn.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => saveNote()} disabled={note.loading || note.saving || note.content === note.saved} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                <Save size={16} />
                {note.saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={deleteNote} disabled={note.loading || note.saving || !note.saved} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
          <textarea
            value={note.content}
            onChange={(event) => setNote((current) => ({ ...current, content: event.target.value }))}
            disabled={note.loading}
            rows={7}
            placeholder={note.loading ? 'Loading notes...' : 'Write a note for this skill'}
            className="focus-ring mt-5 w-full resize-y rounded-lg border border-slate-200 dark:border-purple-500/20 bg-white dark:bg-[#11131e]/80 px-4 py-3 leading-6 text-slate-700 light:text-slate-800 dark:text-slate-200 disabled:bg-slate-50 dark:disabled:bg-slate-900"
          />
          <p className="mt-2 text-sm text-slate-500 light:text-slate-600 dark:text-slate-400">{note.content === note.saved ? 'Saved' : 'Unsaved changes'}</p>
        </section>
      </section>
      <aside className="page-band flex h-[720px] flex-col p-4 text-slate-900 light:text-slate-900 dark:text-slate-100">
        <h2 className="px-2 text-sm font-semibold uppercase text-slate-500 light:text-slate-600 dark:text-slate-400">AI Tutor</h2>
        <div className="mt-3 flex-1 space-y-4 overflow-y-auto pr-1">
          {chat.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-lg bg-white dark:bg-slate-900 p-6 text-center text-slate-600 light:text-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              <span className="text-3xl mb-2">💬</span>
              <p className="text-sm font-medium leading-relaxed">
                Have questions about this topic? Ask the AI Tutor anything below to get beginner-friendly explanations!
              </p>
            </div>
          ) : (
            chat.map((msg, index) => (
              <div key={`${msg.createdAt || index}-${msg.role}`} className={`rounded-lg px-4 py-3 text-sm leading-6 ${msg.role === 'user' ? 'ml-8 bg-indigo-600 text-white' : 'mr-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 light:text-slate-800 dark:text-slate-300'}`}>
                {msg.role === 'assistant' ? <TutorMessage content={msg.content} /> : <p className="whitespace-pre-line">{msg.content}</p>}
              </div>
            ))
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && ask()} placeholder={`Ask about ${skill}`} className="focus-ring min-w-0 flex-1 rounded-lg border border-slate-200 dark:border-purple-500/20 bg-white dark:bg-[#11131e]/80 px-3 py-3 text-slate-800 light:text-slate-900 dark:text-slate-200" />
          <button onClick={ask} className="focus-ring rounded-lg bg-indigo-600 p-3 text-white"><Send size={18} /></button>
        </div>
      </aside>
    </div>
  );
}

function LessonBlock({ title, content }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-slate-900 light:text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-3 whitespace-pre-line leading-7 text-slate-700 light:text-slate-800 dark:text-slate-300">{content}</p>
    </section>
  );
}

function TutorMessage({ content }) {
  const lines = String(content || '').split(/\r?\n/);
  const numberedItems = [];
  const blocks = [];

  const flushNumberedItems = () => {
    if (!numberedItems.length) return;
    blocks.push({ type: 'numbered', items: [...numberedItems] });
    numberedItems.length = 0;
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    const numbered = trimmed.match(/^(\d+)[.)]\s+(.+)/);
    const isPractice = /practice|task|exercise|try this/i.test(trimmed);

    if (!trimmed) {
      flushNumberedItems();
      blocks.push({ type: 'space' });
      return;
    }

    if (numbered) {
      numberedItems.push({ number: numbered[1], text: numbered[2], practice: isPractice });
      return;
    }

    flushNumberedItems();
    blocks.push({ type: isPractice ? 'practice' : 'paragraph', text: trimmed });
  });

  flushNumberedItems();

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        if (block.type === 'space') return <div key={index} className="h-1" />;

        if (block.type === 'numbered') {
          return (
            <ol key={index} className="space-y-2">
              {block.items.map((item) => (
                <li key={`${item.number}-${item.text}`} className={`grid grid-cols-[28px_1fr] gap-2 rounded-lg px-2 py-1.5 ${item.practice ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200' : 'text-slate-700 light:text-slate-850 dark:text-slate-300'}`}>
                  <span className={`grid h-6 w-6 place-items-center rounded-lg text-xs font-semibold ${item.practice ? 'bg-amber-200 dark:bg-amber-900/60 text-amber-900' : 'bg-white dark:bg-slate-800 text-slate-600 light:text-slate-800 dark:text-slate-400'}`}>{item.number}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === 'practice') {
          return <p key={index} className="rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 font-medium text-amber-900 dark:text-amber-200">{block.text}</p>;
        }

        return <p key={index} className="whitespace-pre-wrap text-slate-700 light:text-slate-800 dark:text-slate-300">{block.text}</p>;
      })}
    </div>
  );
}
