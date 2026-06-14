import { useEffect, useMemo, useState } from 'react';
import { Bookmark, Check, GraduationCap, Send, Sparkles } from 'lucide-react';
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
  };

  const submitQuiz = async () => {
    const ordered = quiz.questions.map((_, index) => answers[index]);
    await learningApi.submitQuiz({ skill, answers: ordered });
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
            <h2 className="text-xl font-semibold">Quiz: {quiz.skill}</h2>
            <div className="mt-5 space-y-5">
              {quiz.questions.map((item, index) => (
                <div key={item.question} className="rounded-lg border border-slate-200 p-4">
                  <p className="font-medium">{index + 1}. {item.question}</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {item.options.map((option) => <button key={option} onClick={() => setAnswers({ ...answers, [index]: option })} className={`rounded-lg border px-3 py-2 text-left text-sm ${answers[index] === option ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200'}`}>{option}</button>)}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={submitQuiz} className="focus-ring mt-5 rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white">Submit Quiz</button>
          </section>
        )}
      </section>
      <aside className="page-band flex h-[720px] flex-col p-4">
        <h2 className="px-2 text-sm font-semibold uppercase text-slate-500">AI Tutor</h2>
        <div className="mt-3 flex-1 space-y-3 overflow-y-auto pr-1">
          {chat.map((msg, index) => <div key={`${msg.createdAt || index}-${msg.role}`} className={`rounded-lg px-4 py-3 text-sm ${msg.role === 'user' ? 'ml-8 bg-indigo-600 text-white' : 'mr-8 bg-slate-100 text-slate-700'}`}>{msg.content}</div>)}
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
