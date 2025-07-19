import React, { useState } from 'react';
import { Box, Button, TextField, FormControl, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const validate = values => {
  const errors = {};
  if (!values.name) errors.name = 'Name is required';
  else if (values.name.length < 2) errors.name = 'Min 2 chars';
  if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = 'Valid email required';
  if (values.password.length < 8) errors.password = 'Min 8 chars';
  if (values.password !== values.confirmPassword)
    errors.confirmPassword = 'Passwords must match';
  return errors;
};

export default function SignupForm({ onSubmit, loading }) {
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
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
      <Typography variant="h5" align="center" gutterBottom>Sign Up</Typography>

      {[
        { label: 'Name', name: 'name', type: 'text' },
        { label: 'Email', name: 'email', type: 'email' },
        { label: 'Password', name: 'password', type: 'password' },
        { label: 'Confirm Password', name: 'confirmPassword', type: 'password' },
      ].map(({ label, name, type }) => (
        <FormControl key={name} fullWidth sx={{ mt: 2 }} error={!!errors[name]}>
          <TextField
            label={label}
            name={name}
            type={type}
            value={values[name]}
            onChange={handleChange}
            error={!!errors[name]}
            helperText={errors[name] || ' '}
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
        {loading ? 'Signing up…' : 'Sign Up'}
      </Button>

      <Typography align="center" sx={{ mt: 2 }}>
        Already have an account?{' '}
        <Link component={RouterLink} to="/login" variant="body2">
          Login
        </Link>
      </Typography>
    </Box>
  );
}
