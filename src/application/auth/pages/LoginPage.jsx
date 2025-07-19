import { Typography, Container } from '@mui/material';
import LoginForm from '../components/LoginForm';
import { useLoginController } from '../hooks/useLogin';

export default function LoginPage() {
  const { handleLogin, loading, error } = useLoginController();

  const onSubmit = (values) => {
    handleLogin(values);
  };

  return (
    <Container component="main" maxWidth="sm">
      {error && (
        <Typography color="error" align="center" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      <LoginForm onSubmit={onSubmit} loading={loading} />
    </Container>
  );
}
