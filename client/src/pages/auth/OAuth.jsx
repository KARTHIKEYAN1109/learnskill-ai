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
      let token = params.get('token');

      if (error) {
        navigate(`/login?oauth=${encodeURIComponent(error)}`, { replace: true });
        return;
      }

      try {
        if (!token) {
          const refreshRes = await authApi.refresh();
          token = refreshRes.data.accessToken;
        }

        localStorage.setItem('learnsphere_token', token);

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
