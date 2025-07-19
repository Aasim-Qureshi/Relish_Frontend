// src/features/auth/hooks/useSignup.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import signupAPI from '../api/signup.api';

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const signupUser = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const user = await signupAPI(formData);
      navigate('/login', { replace: true });
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { signupUser, loading, error };
}
