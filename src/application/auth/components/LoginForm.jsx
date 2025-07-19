import React, { useState } from 'react';
import { Box, Button, TextField, FormControl, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const validate = values => {
  const errors = {};
  if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = 'Valid email required';
  if (!values.password) errors.password = 'Password is required';
  return errors;
};

export default function LoginForm({ onSubmit, loading }) {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleChange = ({ target: { name, value } }) =>
    setValues(prev => ({ ...prev, [name]: value }));

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (!Object.keys(errs).length) onSubmit(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ maxWidth: 500, mx: 'auto', p: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>Login</Typography>

      {['email', 'password'].map((field) => (
        <FormControl key={field} fullWidth sx={{ mt: 2 }} error={!!errors[field]}>
          <TextField
            label={field === 'email' ? 'Email' : 'Password'}
            name={field}
            type={field}
            value={values[field]}
            onChange={handleChange}
            error={!!errors[field]}
            helperText={errors[field] || ' '}
            variant="outlined"
            required
          />
        </FormControl>
      ))}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{ mt: 4, py: 1.5, borderRadius: '16px', fontWeight: 600 }}
      >
        {loading ? 'Logging in…' : 'Login'}
      </Button>

      <Typography align="center" sx={{ mt: 2 }}>
        Don’t have an account?{' '}
        <Link component={RouterLink} to="/" variant="body2">
          Sign Up
        </Link>
      </Typography>
    </Box>
  );
}
