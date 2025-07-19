import { useState } from 'react';
import loginAPI from '../api/login.api';
import { useNavigate } from 'react-router-dom';

export function useLoginController() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    setLoading(true);
    setError(null);
    const res = await loginAPI(formData);
    if (res.error) {
      setError(res.error);
      setLoading(false);
      return null;
    }
    navigate('/dashboard');
    setLoading(false);
    return res;
  };

  return { handleLogin, loading, error };
}
