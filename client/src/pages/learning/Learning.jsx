import { useEffect, useMemo, useState } from 'react';
import { Bookmark, Check, CheckCircle2, GraduationCap, Send, Sparkles, XCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import { learningApi } from '../../api/endpoints';

export default function Learning() {
  const { skill: routeSkill } = useParams();
  const navigate = useNavigate();
  const [path, setPath] = useState(null);
  const [progress, setProgress] = useState(null);
  const [lessonState, setLessonState] = useState({ lesson: null, loading: true, bookmarked: false });
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [chat, setChat] = useState([]);
  const [question, setQuestion] = useState('');
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
    setAnswers({});
    setQuizResult(null);
    learningApi.lesson(skill).then(({ data }) => setLessonState({ lesson: data.lesson, loading: false, bookmarked: data.bookmarked }));
    learningApi.tutorHistory(skill).then(({ data }) => setChat(data.messages || [])).catch(() => {});
  }, [skill]);

  if (!path && !skill) return <EmptyState title="No active skill" copy="Generate a roadmap from your resume before starting lessons." to="/resume" action="Analyze resume" />;
  if (lessonState.loading) return <Skeleton className="h-[640px]" />;
  const lesson = lessonState.lesson;
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

  return (
    <div className="grid gap-6 xl:grid-cols-[260px_1fr_340px]">
      <aside className="page-band h-fit p-4">
        <h2 className="px-2 text-sm font-semibold uppercase text-slate-500">Roadmap</h2>
        <div className="mt-3 space-y-1">
          {roadmap.map((item) => <Link key={item} to={`/learning/${encodeURIComponent(item)}`} className={`block rounded-lg px-3 py-3 text-sm font-medium ${item === skill ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}>{item}</Link>)}
        </div>
      </aside>
      <section className="space-y-6">
        <article className="page-band p-6 lg:p-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <p className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"><Sparkles size={16} /> AI Lesson</p>
              <h1 className="mt-4 text-3xl font-semibold">{lesson.title}</h1>
            </div>
            <button onClick={() => learningApi.bookmark(lesson._id).then(({ data }) => setLessonState((s) => ({ ...s, bookmarked: data.bookmarked })))} className="focus-ring rounded-lg border border-slate-200 p-3 text-slate-600 hover:bg-slate-50" title="Bookmark lesson">
              <Bookmark size={20} fill={lessonState.bookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
          <LessonBlock title="Explanation" content={lesson.explanation} />
          <LessonBlock title="Example" content={lesson.example} />
          <LessonBlock title="Exercise" content={lesson.exercise} />
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={generateQuiz} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white"><GraduationCap size={18} /> Generate Quiz</button>
            <button onClick={complete} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-3 font-semibold text-slate-700"><Check size={18} /> Mark Complete</button>
            {lesson.nextTopic && <Link to={`/learning/${encodeURIComponent(lesson.nextTopic)}`} className="focus-ring rounded-lg border border-slate-200 px-5 py-3 font-semibold text-slate-700">Next Topic</Link>}
          </div>
        </article>
        {quiz && (
          <section className="page-band p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <h2 className="text-xl font-semibold">Quiz: {quiz.skill}</h2>
                {quizResult && <p className="mt-1 text-sm text-slate-500">Answer review is ready. Revisit each question below.</p>}
              </div>
              {quizResult && (
                <div className="rounded-lg bg-slate-950 px-5 py-3 text-white">
                  <p className="text-xs font-medium uppercase text-blue-100">Score</p>
                  <p className="mt-1 text-2xl font-semibold">{quizResult.score}/{quizResult.total} <span className="text-base text-slate-300">({quizResult.accuracy}%)</span></p>
                </div>
              )}
            </div>
            <div className="mt-5 space-y-5">
              {quiz.questions.map((item, index) => (
                <div key={item.question} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{index + 1}. {item.question}</p>
                    {quizResult && (
                      quizResult.answers[index] === item.answer
                        ? <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-xs font-medium text-green-700"><CheckCircle2 size={14} /> Correct</span>
                        : <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-700"><XCircle size={14} /> Review</span>
                    )}
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {item.options.map((option) => {
                      const selected = answers[index] === option;
                      const submittedAnswer = quizResult?.answers[index];
                      const isCorrectAnswer = quizResult && option === item.answer;
                      const isWrongAnswer = quizResult && submittedAnswer === option && option !== item.answer;
                      const optionClass = isCorrectAnswer
                        ? 'border-green-300 bg-green-50 text-green-800'
                        : isWrongAnswer
                          ? 'border-red-300 bg-red-50 text-red-800'
                          : selected
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200';

                      return (
                        <button key={option} disabled={Boolean(quizResult)} onClick={() => setAnswers({ ...answers, [index]: option })} className={`rounded-lg border px-3 py-2 text-left text-sm disabled:cursor-default ${optionClass}`}>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {quizResult && (
                    <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
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
      </section>
      <aside className="page-band flex h-[720px] flex-col p-4">
        <h2 className="px-2 text-sm font-semibold uppercase text-slate-500">AI Tutor</h2>
        <div className="mt-3 flex-1 space-y-4 overflow-y-auto pr-1">
          {chat.map((msg, index) => (
            <div key={`${msg.createdAt || index}-${msg.role}`} className={`rounded-lg px-4 py-3 text-sm leading-6 ${msg.role === 'user' ? 'ml-8 bg-indigo-600 text-white' : 'mr-8 border border-slate-200 bg-slate-50 text-slate-700'}`}>
              {msg.role === 'assistant' ? <TutorMessage content={msg.content} /> : <p className="whitespace-pre-line">{msg.content}</p>}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && ask()} placeholder={`Ask about ${skill}`} className="focus-ring min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-3" />
          <button onClick={ask} className="focus-ring rounded-lg bg-indigo-600 p-3 text-white"><Send size={18} /></button>
        </div>
      </aside>
    </div>
  );
}

function LessonBlock({ title, content }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">{content}</p>
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
                <li key={`${item.number}-${item.text}`} className={`grid grid-cols-[28px_1fr] gap-2 rounded-lg px-2 py-1.5 ${item.practice ? 'bg-amber-50 text-amber-900' : ''}`}>
                  <span className={`grid h-6 w-6 place-items-center rounded-lg text-xs font-semibold ${item.practice ? 'bg-amber-200 text-amber-950' : 'bg-white text-slate-600'}`}>{item.number}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === 'practice') {
          return <p key={index} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-medium text-amber-900">{block.text}</p>;
        }

        return <p key={index} className="whitespace-pre-wrap">{block.text}</p>;
      })}
    </div>
  );
}
