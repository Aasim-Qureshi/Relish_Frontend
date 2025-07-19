import { TextField } from '@mui/material';

export default function SearchBar({ value, onChange }) {
  return (
    <TextField
      fullWidth
      placeholder="Search recipes… use #tag for tags"
      value={value}
      onChange={onChange}
      variant="outlined"
      sx={{ mb: 2 }}
    />
  );
}
