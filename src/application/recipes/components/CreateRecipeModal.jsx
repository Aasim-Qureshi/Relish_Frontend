import { useState, useRef, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Chip, Stack, Typography, Alert
} from '@mui/material';

export default function CreateRecipeModal({ open, onClose, onSubmit, loading }) {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState('');

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

  useEffect(() => {
    const checkSpeechSupport = async () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setSpeechSupported(false);
        return;
      }

      const isSecure = window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

      if (!isSecure) {
        setSpeechSupported(false);
        setLastError('HTTPS required for speech recognition');
        return;
      }

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          setSpeechSupported(true);
          setLastError('');
        } else {
          setSpeechSupported(false);
          setLastError('Microphone not available');
        }
      } catch (error) {
        setSpeechSupported(false);
        setLastError('Microphone permission denied');
      }
    };

    checkSpeechSupport();
  }, []);

  const handleVoiceInput = async (type) => {
    if (!speechSupported) {
      alert('Speech recognition not available. ' + lastError);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (!navigator.onLine) {
      alert('No internet connection. Speech recognition requires internet access.');
      return;
    }

    await startSpeechRecognition(type);
  };

  const startSpeechRecognition = async (type, attempt = 0) => {
    const MAX_RETRIES = 2;

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
        }
        recognitionRef.current = null;
      }

      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      const timeout = setTimeout(() => {
        if (recognitionRef.current && isListening) {
          recognitionRef.current.stop();
          setIsListening(false);
        }
      }, 10000); // 10 second timeout

      setIsListening(true);
      setRetryCount(attempt);

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started, attempt:', attempt + 1);
      };

      recognitionRef.current.onresult = (event) => {
        clearTimeout(timeout);
        try {
          if (event.results && event.results[0] && event.results[0][0]) {
            const transcript = event.results[0][0].transcript.trim();
            console.log('Speech result:', transcript);

            if (transcript) {
              if (type === 'ingredient') {
                const ingredients = transcript
                  .split(/[,;]/)
                  .map(item => item.trim())
                  .filter(item => item.length > 0);

                setValues(v => ({
                  ...v,
                  ingredients: [...v.ingredients, ...ingredients]
                }));
              } else if (type === 'tag') {
                const tags = transcript
                  .split(/[,;]/)
                  .map(item => item.trim())
                  .filter(item => item.length > 0);

                setValues(v => ({
                  ...v,
                  tags: [...v.tags, ...tags]
                }));
              }
              setLastError(''); // Clear any previous errors
            }
          }
        } catch (error) {
          console.error('Error processing speech result:', error);
        }
        setIsListening(false);
        setRetryCount(0);
      };

      recognitionRef.current.onerror = async (event) => {
        clearTimeout(timeout);
        console.error('Speech recognition error:', event.error, 'attempt:', attempt + 1);
        setIsListening(false);

        if (event.error === 'network' && attempt < MAX_RETRIES) {
          console.log('Network error, retrying in 1 second...');
          setLastError(`Network error, retrying... (${attempt + 1}/${MAX_RETRIES + 1})`);

          setTimeout(() => {
            startSpeechRecognition(type, attempt + 1);
          }, 1000);
          return;
        }

        let errorMessage = '';
        switch (event.error) {
          case 'network':
            errorMessage = 'Network connection failed after multiple attempts. Please check your internet connection and try again.';
            setLastError('Network connection issues');
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone permissions and refresh the page.';
            setLastError('Microphone access denied');
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak clearly and try again.';
            setLastError('No speech detected');
            break;
          case 'audio-capture':
            errorMessage = 'No microphone detected. Please connect a microphone.';
            setLastError('No microphone available');
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech service blocked. Please use HTTPS and refresh the page.';
            setLastError('Speech service blocked');
            break;
          case 'aborted':
            setRetryCount(0);
            return;
          default:
            errorMessage = `Speech recognition failed: ${event.error}. Please try again.`;
            setLastError(`Speech error: ${event.error}`);
        }

        if (errorMessage) {
          alert(errorMessage);
        }
        setRetryCount(0);
      };

      recognitionRef.current.onend = () => {
        clearTimeout(timeout);
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognitionRef.current.start();

    } catch (error) {
      console.error('Speech recognition setup error:', error);
      setIsListening(false);
      setRetryCount(0);
      alert('Unable to initialize speech recognition. Please try again.');
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

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
        {/* Title Field with Voice */}
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="Title"
            name="title"
            fullWidth
            margin="normal"
            value={values.title}
            onChange={handleChange}
          />
          <Button
            variant={isListening && voiceTargetField === 'title' ? "contained" : "outlined"}
            color={isListening && voiceTargetField === 'title' ? "secondary" : "primary"}
            onClick={() => handleVoiceInput('title')}
            disabled={!speechSupported}
            title="Voice input for title"
          >
            {isListening && voiceTargetField === 'title' ? '⏹️' : '🎤'}
          </Button>
        </Stack>

        {/* Ingredient Input with Voice */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
          <TextField
            label="Add ingredient (press Enter)"
            fullWidth
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyDown={handleAddIngredient}
          />
          <Button
            variant={isListening && voiceTargetField === 'ingredient' ? "contained" : "outlined"}
            color={isListening && voiceTargetField === 'ingredient' ? "secondary" : "primary"}
            onClick={() => handleVoiceInput('ingredient')}
            disabled={!speechSupported}
            title="Voice input for ingredient"
          >
            {isListening && voiceTargetField === 'ingredient' ? '⏹️' : '🎤'}
          </Button>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          {values.ingredients.map((ing, i) => (
            <Chip key={i} label={ing} onDelete={() => handleDeleteIngredient(i)} />
          ))}
        </Stack>

        {/* Instructions Field with Voice */}
        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 2 }}>
          <TextField
            label="Instructions"
            name="instructions"
            fullWidth
            margin="normal"
            multiline
            value={values.instructions}
            onChange={handleChange}
          />
          <Button
            variant={isListening && voiceTargetField === 'instructions' ? "contained" : "outlined"}
            color={isListening && voiceTargetField === 'instructions' ? "secondary" : "primary"}
            onClick={() => handleVoiceInput('instructions')}
            disabled={!speechSupported}
            title="Voice input for instructions"
            sx={{ mt: 2 }}
          >
            {isListening && voiceTargetField === 'instructions' ? '⏹️' : '🎤'}
          </Button>
        </Stack>

        {/* Tag Input with Voice */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
          <TextField
            label="Add tag (press Enter)"
            fullWidth
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
          />
          <Button
            variant={isListening && voiceTargetField === 'tag' ? "contained" : "outlined"}
            color={isListening && voiceTargetField === 'tag' ? "secondary" : "primary"}
            onClick={() => handleVoiceInput('tag')}
            disabled={!speechSupported}
            title="Voice input for tag"
          >
            {isListening && voiceTargetField === 'tag' ? '⏹️' : '🎤'}
          </Button>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          {values.tags.map((tag, i) => (
            <Chip key={i} label={tag} onDelete={() => handleDeleteTag(i)} />
          ))}
        </Stack>

        {/* Image Upload */}
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

        {/* Speech Errors and Retry Info */}
        {!speechSupported && lastError && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Speech recognition unavailable: {lastError}
            {lastError.includes('HTTPS') && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Try accessing this page via HTTPS or use localhost for testing.
              </Typography>
            )}
            {lastError.includes('Microphone') && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Please allow microphone permissions and refresh the page.
              </Typography>
            )}
          </Alert>
        )}
        {retryCount > 0 && (
          <Alert severity="info" sx={{ mt: 1 }}>
            Retrying speech recognition... (Attempt {retryCount + 1}/3)
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