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
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
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
          <h1 className="mt-4 text-2xl font-semibold">{user?.name}</h1>
          <p className="text-slate-500">{user?.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">{user?.role}</span>
            <span className="inline-flex rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">{isGoogleAccount ? 'Google OAuth' : 'Email/Password'}</span>
          </div>
        </div>
        <SettingsSummary icon={ShieldCheck} title="Account Provider" copy={isGoogleAccount ? 'This account signs in through Google OAuth.' : 'This account uses email and password authentication.'} />
      </section>

      <section className="space-y-6">
        <form onSubmit={saveProfile} className="page-band p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-700"><UserRound size={22} /></div>
            <div>
              <h2 className="text-lg font-semibold">Edit Profile</h2>
              <p className="mt-1 text-sm text-slate-500">Update your display name. Email stays read-only.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-600">Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} className="focus-ring mt-2 w-full rounded-lg border border-slate-200 px-4 py-3" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-600">Email</span>
              <input value={user?.email || ''} readOnly className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500" />
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
            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-700"><KeyRound size={22} /></div>
            <div>
              <h2 className="text-lg font-semibold">Change Password</h2>
              <p className="mt-1 text-sm text-slate-500">{isGoogleAccount ? 'Google accounts manage passwords through Google.' : 'Verify your current password before choosing a new one.'}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <PasswordInput label="Current password" value={passwordForm.currentPassword} disabled={isGoogleAccount} onChange={(value) => setPasswordForm({ ...passwordForm, currentPassword: value })} />
            <PasswordInput label="New password" value={passwordForm.newPassword} disabled={isGoogleAccount} onChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })} />
            <PasswordInput label="Confirm password" value={passwordForm.confirmPassword} disabled={isGoogleAccount} onChange={(value) => setPasswordForm({ ...passwordForm, confirmPassword: value })} />
          </div>
          <FormMessage state={passwordState} />
          <button disabled={isGoogleAccount || passwordState.loading || passwordForm.newPassword.length < 8} className="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white disabled:opacity-50">
            <KeyRound size={18} />
            {passwordState.loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <form onSubmit={deleteAccount} className="page-band border-red-200 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-red-50 p-3 text-red-700"><Trash2 size={22} /></div>
            <div>
              <h2 className="text-lg font-semibold text-red-950">Delete Account</h2>
              <p className="mt-1 text-sm text-slate-500">This removes your progress, learning paths, notes, bookmarks, and tutor messages.</p>
            </div>
          </div>
          <label className="mt-5 block">
            <span className="text-sm font-medium text-slate-600">Type DELETE to confirm</span>
            <input value={deleteState.confirm} onChange={(event) => setDeleteState({ confirm: event.target.value, loading: false, error: '' })} className="focus-ring mt-2 w-full rounded-lg border border-red-200 px-4 py-3" />
          </label>
          {deleteState.error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{deleteState.error}</p>}
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
      <div className="rounded-lg bg-blue-50 p-3 text-blue-700"><Icon size={22} /></div>
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{copy}</p>
      </div>
    </div>
  );
}

function PasswordInput({ label, value, onChange, disabled }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <input type="password" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="focus-ring mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 disabled:bg-slate-50" />
    </label>
  );
}

function FormMessage({ state }) {
  if (state.error) return <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>;
  if (state.message) return <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{state.message}</p>;
  return null;
}
