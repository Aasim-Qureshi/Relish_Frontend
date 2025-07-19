import SignupForm from '../components/SignupForm';
import { useSignup } from '../hooks/useSignup';

export default function SignupPage() {
  const { signupUser, loading, error } = useSignup();

  const handleSubmit = (formData) => signupUser(formData);

  return (
    <div>
      {error && <Typography color="error" align="center">{error}</Typography>}
      <SignupForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
