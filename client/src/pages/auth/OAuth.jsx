import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingScreen from '../../components/LoadingScreen';

export default function OAuth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) localStorage.setItem('learnsphere_token', token);
    navigate('/', { replace: true });
  }, [navigate, params]);

  return <LoadingScreen />;
}
