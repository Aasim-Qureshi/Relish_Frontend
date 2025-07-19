import { useState, useRef, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Chip, Stack, Typography
} from '@mui/material';

export default function CreateRecipeModal({ open, onClose, onSubmit, loading }) {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

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

  // Initialize speech recognition once
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      // Request microphone permission on component mount
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => {
            setSpeechSupported(true);
          })
          .catch((error) => {
            console.warn('Microphone permission denied:', error);
            setSpeechSupported(false);
          });
      }
    } else {
      setSpeechSupported(false);
    }
  }, []);

  const handleVoiceInput = async (type) => {
    if (!recognitionRef.current || !speechSupported) {
      alert('Speech recognition not supported or microphone permission denied.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      // Request microphone permission before starting
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setIsListening(true);

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        console.log('Speech result:', transcript);
        
        if (transcript) {
          if (type === 'ingredient') {
            // Split by common separators and clean up
            const ingredients = transcript
              .split(/[,;]/)
              .map(item => item.trim())
              .filter(item => item.length > 0);
            
            setValues(v => ({ 
              ...v, 
              ingredients: [...v.ingredients, ...ingredients] 
            }));
          } else if (type === 'tag') {
            // Split by common separators for tags
            const tags = transcript
              .split(/[,;]/)
              .map(item => item.trim())
              .filter(item => item.length > 0);
            
            setValues(v => ({ 
              ...v, 
              tags: [...v.tags, ...tags] 
            }));
          }
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = 'Speech recognition failed. ';
        switch(event.error) {
          case 'network':
            errorMessage += 'Please check your internet connection.';
            break;
          case 'not-allowed':
            errorMessage += 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'no-speech':
            errorMessage += 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage += 'No microphone found. Please connect a microphone.';
            break;
          case 'service-not-allowed':
            errorMessage += 'Speech service not allowed. Try using HTTPS.';
            break;
          default:
            errorMessage += 'Please try again.';
        }
        alert(errorMessage);
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognitionRef.current.start();

    } catch (error) {
      console.error('Microphone access error:', error);
      setIsListening(false);
      alert('Unable to access microphone. Please check permissions and try again.');
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
            variant={isListening ? "contained" : "outlined"}
            color={isListening ? "secondary" : "primary"}
            onClick={() => handleVoiceInput('ingredient')}
            disabled={!speechSupported}
          >
            {isListening ? '⏹️' : '🎤'}
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
            variant={isListening ? "contained" : "outlined"}
            color={isListening ? "secondary" : "primary"}
            onClick={() => handleVoiceInput('tag')}
            disabled={!speechSupported}
          >
            {isListening ? '⏹️' : '🎤'}
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

        {!speechSupported && (
          <Typography variant="body2" color="warning" sx={{ mt: 1 }}>
            Speech recognition not available. Please ensure you're using HTTPS and have microphone permissions.
          </Typography>
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