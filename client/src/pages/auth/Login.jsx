import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Brain, Chrome } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get('oauth');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(oauthError === 'google_not_configured' ? 'Google login is not configured yet' : oauthError ? 'Google login failed. Please try again.' : '');
  const [loading, setLoading] = useState(false);
  const googleUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-md rounded-lg bg-white dark:bg-[#11131e]/90 border dark:border-purple-500/20 p-8 shadow-soft text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-indigo-600 text-white"><Brain /></div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Welcome back</h1>
          <p className="text-slate-500 dark:text-slate-400">Continue your roadmap</p>
        </div>
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">{error}</p>}
      <form onSubmit={submit} className="space-y-4">
        <input className="focus-ring w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090a0f] text-slate-900 dark:text-white px-4 py-3" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="focus-ring w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090a0f] text-slate-900 dark:text-white px-4 py-3" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button disabled={loading} className="focus-ring w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white disabled:opacity-60">{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
      <a href={googleUrl} className="focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131e]/90 text-slate-700 dark:text-slate-200 px-4 py-3 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition">
        <Chrome size={18} />
        Continue with Google
      </a>
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">New to LearnSphere? <Link className="font-medium text-indigo-700 dark:text-indigo-400" to="/register">Create an account</Link></p>
    </section>
  );
}
