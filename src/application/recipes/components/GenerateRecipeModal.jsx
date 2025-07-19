import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Chip, Stack
} from '@mui/material';

export default function GenerateRecipeModal({ open, onClose, onSubmit, loading }) {
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // Voice Recognition Setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
  }

  const handleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      const words = transcript.split(/\s+/); // Add each spoken word as ingredient
      setIngredients(prev => [...prev, ...words]);
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
    };
  };

  const handleAddIngredient = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      setIngredients(prev => [...prev, inputValue.trim()]);
      setInputValue('');
      e.preventDefault();
    }
  };

  const handleDeleteIngredient = (index) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Generate Recipe</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="Add ingredient (press Enter)"
            placeholder="e.g. flour"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleAddIngredient}
            fullWidth
            margin="normal"
          />
          <Button variant="outlined" onClick={handleVoiceInput}>🎤</Button>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          {ingredients.map((ing, i) => (
            <Chip
              key={i}
              label={ing}
              onDelete={() => handleDeleteIngredient(i)}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => onSubmit(ingredients)}
          variant="contained"
          disabled={loading || ingredients.length === 0}
        >
          {loading ? 'Generating…' : 'Generate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
