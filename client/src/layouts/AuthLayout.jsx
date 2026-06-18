import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <main className="grid min-h-screen bg-white dark:bg-[#090a0f] lg:grid-cols-[1.1fr_0.9fr] transition-colors duration-200">
      <section className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"
          alt="Digital learning workspace"
          className="h-full w-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-slate-950/45 to-blue-900/70" />
        <div className="absolute bottom-12 left-12 max-w-xl text-white">
          <p className="text-sm font-bold uppercase tracking-[0.18em]">
            <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">LearnSphere</span>
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight">Turn a resume into a personal learning operating system.</h1>
          <p className="mt-5 text-lg text-blue-50">Skill gaps, roadmaps, lessons, quizzes, and an AI tutor in one polished workspace.</p>
        </div>
      </section>
      <section className="flex items-center justify-center p-6 bg-white dark:bg-[#090a0f] transition-colors duration-200">
        <Outlet />
      </section>
    </main>
  );
}
