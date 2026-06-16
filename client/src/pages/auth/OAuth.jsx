import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/endpoints';
import LoadingScreen from '../../components/LoadingScreen';
import { useAuth } from '../../store/AuthContext';

export default function OAuth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const completeOAuth = async () => {
      const error = params.get('error');
      const token = params.get('token');

      if (error || !token) {
        navigate(`/login?oauth=${encodeURIComponent(error || 'missing_token')}`, { replace: true });
        return;
      }

      localStorage.setItem('learnsphere_token', token);

      try {
        const { data } = await authApi.me();
        setUser(data.user);
        navigate('/', { replace: true });
      } catch {
        localStorage.removeItem('learnsphere_token');
        navigate('/login?oauth=session_failed', { replace: true });
      }
    };

    completeOAuth();
  }, [navigate, params, setUser]);

  return <LoadingScreen />;
}
