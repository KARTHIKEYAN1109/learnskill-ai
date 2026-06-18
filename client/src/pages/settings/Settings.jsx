import { useEffect, useState } from 'react';
import { KeyRound, Save, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/endpoints';
import { useAuth } from '../../store/AuthContext';

const initialPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

export default function Settings() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [profileState, setProfileState] = useState({ loading: false, message: '', error: '' });
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [passwordState, setPasswordState] = useState({ loading: false, message: '', error: '' });
  const [deleteState, setDeleteState] = useState({ confirm: '', loading: false, error: '' });
  const isGoogleAccount = user?.provider === 'google';

  useEffect(() => {
    setName(user?.name || '');
  }, [user?.name]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileState({ loading: true, message: '', error: '' });

    try {
      const { data } = await authApi.updateProfile({ name });
      setUser(data.user);
      setProfileState({ loading: false, message: 'Profile updated', error: '' });
    } catch (error) {
      setProfileState({ loading: false, message: '', error: error.response?.data?.message || 'Could not update profile' });
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordState({ loading: false, message: '', error: 'New passwords do not match' });
      return;
    }

    setPasswordState({ loading: true, message: '', error: '' });

    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      localStorage.removeItem('learnsphere_token');
      setUser(null);
      navigate('/login', { replace: true });
    } catch (error) {
      setPasswordState({ loading: false, message: '', error: error.response?.data?.message || 'Could not update password' });
    }
  };

  const deleteAccount = async (event) => {
    event.preventDefault();
    setDeleteState((current) => ({ ...current, loading: true, error: '' }));

    try {
      await authApi.deleteAccount();
      localStorage.removeItem('learnsphere_token');
      setUser(null);
      navigate('/register', { replace: true });
    } catch (error) {
      setDeleteState((current) => ({ ...current, loading: false, error: error.response?.data?.message || 'Could not delete account' }));
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr] text-slate-900 light:text-slate-900 dark:text-slate-100">
      <section className="space-y-6">
        <div className="page-band p-6">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=4f46e5&color=fff`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=4f46e5&color=fff`;
            }}
            alt=""
            className="h-20 w-20 rounded-full"
          />
          <h1 className="mt-4 text-2xl font-semibold text-slate-900 light:text-slate-950 dark:text-white">{user?.name}</h1>
          <p className="text-slate-500 dark:text-slate-400">{user?.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex rounded-lg bg-indigo-50 dark:bg-indigo-950/40 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">{user?.role}</span>
            <span className="inline-flex rounded-lg bg-blue-50 dark:bg-blue-950/40 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300">{isGoogleAccount ? 'Google OAuth' : 'Email/Password'}</span>
          </div>
        </div>
        <SettingsSummary icon={ShieldCheck} title="Account Provider" copy={isGoogleAccount ? 'This account signs in through Google OAuth.' : 'This account uses email and password authentication.'} />
      </section>

      <section className="space-y-6">
        <form onSubmit={saveProfile} className="page-band p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 p-3 text-blue-700 dark:text-blue-400"><UserRound size={22} /></div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 light:text-slate-950 dark:text-white">Edit Profile</h2>
              <p className="mt-1 text-sm text-slate-500 light:text-slate-600 dark:text-slate-400">Update your display name. Email stays read-only.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-600 light:text-slate-700 dark:text-slate-400">Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} className="focus-ring mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131e]/80 text-slate-900 light:text-slate-950 dark:text-white px-4 py-3" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-600 light:text-slate-700 dark:text-slate-400">Email</span>
              <input value={user?.email || ''} readOnly className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 px-4 py-3 text-slate-500 light:text-slate-700 dark:text-slate-400" />
            </label>
          </div>
          <FormMessage state={profileState} />
          <button disabled={profileState.loading || name.trim().length < 2} className="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-50">
            <Save size={18} />
            {profileState.loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        <form onSubmit={changePassword} className="page-band p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 p-3 text-indigo-700 dark:text-indigo-400"><KeyRound size={22} /></div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 light:text-slate-950 dark:text-white">Change Password</h2>
              <p className="mt-1 text-sm text-slate-500 light:text-slate-600 dark:text-slate-400">{isGoogleAccount ? 'Google accounts manage passwords through Google.' : 'Verify your current password before choosing a new one.'}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <PasswordInput label="Current password" value={passwordForm.currentPassword} disabled={isGoogleAccount} onChange={(value) => setPasswordForm({ ...passwordForm, currentPassword: value })} />
            <PasswordInput label="New password" value={passwordForm.newPassword} disabled={isGoogleAccount} onChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })} />
            <PasswordInput label="Confirm password" value={passwordForm.confirmPassword} disabled={isGoogleAccount} onChange={(value) => setPasswordForm({ ...passwordForm, confirmPassword: value })} />
          </div>
          <FormMessage state={passwordState} />
          <button disabled={isGoogleAccount || passwordState.loading || passwordForm.newPassword.length < 8} className="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-950 dark:bg-slate-900 border dark:border-purple-500/20 px-5 py-3 font-semibold text-white disabled:opacity-50">
            <KeyRound size={18} />
            {passwordState.loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <form onSubmit={deleteAccount} className="page-band border-red-200 dark:border-red-900/40 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-red-50 dark:bg-red-950/40 p-3 text-red-700 dark:text-red-400"><Trash2 size={22} /></div>
            <div>
              <h2 className="text-lg font-semibold text-red-900 dark:text-red-400">Delete Account</h2>
              <p className="mt-1 text-sm text-slate-500 light:text-slate-600 dark:text-slate-400">This removes your progress, learning paths, notes, bookmarks, and tutor messages.</p>
            </div>
          </div>
          <label className="mt-5 block">
            <span className="text-sm font-medium text-slate-600 light:text-slate-700 dark:text-slate-400">Type DELETE to confirm</span>
            <input value={deleteState.confirm} onChange={(event) => setDeleteState({ confirm: event.target.value, loading: false, error: '' })} className="focus-ring mt-2 w-full rounded-lg border border-red-200 dark:border-red-900/40 bg-white dark:bg-[#11131e]/80 text-slate-900 light:text-slate-950 dark:text-white px-4 py-3" />
          </label>
          {deleteState.error && <p className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">{deleteState.error}</p>}
          <button disabled={deleteState.confirm !== 'DELETE' || deleteState.loading} className="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white disabled:opacity-50">
            <Trash2 size={18} />
            {deleteState.loading ? 'Deleting...' : 'Delete Account'}
          </button>
        </form>
      </section>
    </div>
  );
}

function SettingsSummary({ icon: Icon, title, copy }) {
  return (
    <div className="page-band flex items-start gap-4 p-5">
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 p-3 text-blue-700 dark:text-blue-400"><Icon size={22} /></div>
      <div>
        <h2 className="font-semibold text-slate-900 light:text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-500 light:text-slate-700 dark:text-slate-400">{copy}</p>
      </div>
    </div>
  );
}

function PasswordInput({ label, value, onChange, disabled }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600 light:text-slate-700 dark:text-slate-400">{label}</span>
      <input type="password" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="focus-ring mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131e]/80 text-slate-900 light:text-slate-950 dark:text-white px-4 py-3 disabled:bg-slate-50 light:disabled:text-slate-600 dark:disabled:bg-slate-900/40" />
    </label>
  );
}

function FormMessage({ state }) {
  if (state.error) return <p className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">{state.error}</p>;
  if (state.message) return <p className="mt-4 rounded-lg bg-green-50 dark:bg-green-950/30 px-4 py-3 text-sm text-green-700 dark:text-green-400">{state.message}</p>;
  return null;
}
