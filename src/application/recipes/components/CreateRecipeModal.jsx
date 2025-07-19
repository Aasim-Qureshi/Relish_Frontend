import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Chip, Stack, Typography, Alert
} from '@mui/material';
import SpeechRecognition, {
  useSpeechRecognition
} from 'react-speech-recognition';

export default function CreateRecipeModal({ open, onClose, onSubmit, loading }) {
  const [values, setValues] = useState({
    title: '',
    tags: [],
    ingredients: [],
    instructions: '',
    imageFile: null
  });

  const [tagInput, setTagInput] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  const [imageError, setImageError] = useState('');
  const [voiceInputType, setVoiceInputType] = useState(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const handleTranscript = (type) => {
    const items = transcript
      .split(/[,;]/)
      .map((t) => t.trim())
      .filter(Boolean);

    if (items.length === 0) return;

    setValues((v) => ({
      ...v,
      [type]: [...v[type], ...items]
    }));

    resetTranscript();
  };

  const handleVoiceInput = (type) => {
    if (!browserSupportsSpeechRecognition) {
      alert('Speech recognition not supported in your browser.');
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
      handleTranscript(voiceInputType);
      setVoiceInputType(null);
    } else {
      resetTranscript();
      setVoiceInputType(type);
      SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setValues(v => ({ ...v, tags: [...v.tags, tagInput.trim()] }));
      setTagInput('');
      e.preventDefault();
    }
  };

  const handleDeleteTag = (index) => {
    setValues(v => ({
      ...v,
      tags: v.tags.filter((_, i) => i !== index)
    }));
  };

  const handleAddIngredient = (e) => {
    if (e.key === 'Enter' && ingredientInput.trim()) {
      setValues(v => ({ ...v, ingredients: [...v.ingredients, ingredientInput.trim()] }));
      setIngredientInput('');
      e.preventDefault();
    }
  };

  const handleDeleteIngredient = (index) => {
    setValues(v => ({
      ...v,
      ingredients: v.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setImageError('Please upload a valid image file.');
        setValues((v) => ({ ...v, imageFile: null }));
      } else {
        setImageError('');
        setValues((v) => ({ ...v, imageFile: file }));
      }
    }
  };

  const handleSubmit = () => {
    if (values.ingredients.length === 0) {
      alert('Please add at least one ingredient.');
      return;
    }

    if (imageError) {
      alert('Please fix the image error before submitting.');
      return;
    }

    const formData = new FormData();
    Object.entries(values).forEach(([k, val]) => {
      if (k === 'tags' || k === 'ingredients') {
        val.forEach(item => formData.append(`${k}[]`, item));
      } else if (k === 'imageFile') {
        formData.append('image', val);
      } else if (val !== null) {
        formData.append(k, val);
      }
    });

    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Recipe</DialogTitle>
      <DialogContent>
        <TextField
          label="Title"
          name="title"
          fullWidth
          margin="normal"
          value={values.title}
          onChange={handleChange}
        />

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
          <TextField
            label="Add ingredient (press Enter)"
            fullWidth
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyDown={handleAddIngredient}
          />
          <Button
            variant={listening && voiceInputType === 'ingredients' ? 'contained' : 'outlined'}
            color={listening ? 'secondary' : 'primary'}
            onClick={() => handleVoiceInput('ingredients')}
            disabled={!browserSupportsSpeechRecognition}
          >
            {listening && voiceInputType === 'ingredients' ? '⏹️ Stop' : '🎤'}
          </Button>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          {values.ingredients.map((ing, i) => (
            <Chip
              key={i}
              label={ing}
              onDelete={() => handleDeleteIngredient(i)}
            />
          ))}
        </Stack>

        <TextField
          label="Instructions"
          name="instructions"
          fullWidth
          margin="normal"
          multiline
          value={values.instructions}
          onChange={handleChange}
        />

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
          <TextField
            label="Add tag (press Enter)"
            fullWidth
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
          />
          <Button
            variant={listening && voiceInputType === 'tags' ? 'contained' : 'outlined'}
            color={listening ? 'secondary' : 'primary'}
            onClick={() => handleVoiceInput('tags')}
            disabled={!browserSupportsSpeechRecognition}
          >
            {listening && voiceInputType === 'tags' ? '⏹️ Stop' : '🎤'}
          </Button>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          {values.tags.map((tag, i) => (
            <Chip
              key={i}
              label={tag}
              onDelete={() => handleDeleteTag(i)}
            />
          ))}
        </Stack>

        <Button variant="outlined" component="label" sx={{ mt: 2 }}>
          Upload Image
          <input
            type="file"
            hidden
            accept="image/*"
            name="imageFile"
            onChange={handleFileChange}
          />
        </Button>

        {values.imageFile && !imageError && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected: {values.imageFile.name}
          </Typography>
        )}

        {imageError && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {imageError}
          </Typography>
        )}

        {!browserSupportsSpeechRecognition && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Speech recognition not supported in this browser. Try using Chrome or Edge over HTTPS.
          </Alert>
        )}

        {listening && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Listening... Speak now.
            <Typography variant="body2" sx={{ mt: 1 }}>
              <i>{transcript}</i>
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
