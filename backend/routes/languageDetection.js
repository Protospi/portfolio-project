import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST endpoint for language detection
router.post('/language-detection', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text input is required' });
    }
    
    // For testing purposes:
    // If OpenAI API key is not set or is the placeholder, use mock response
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.log('Using mock language detection response (no valid API key found)');
      return res.json(mockDetectLanguage(text));
    }
    
    const response = await detectLanguage(text);
    
    res.json(response);
  } catch (error) {
    console.error('Error in language detection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock function for testing without OpenAI API key
function mockDetectLanguage(userInput) {
  console.log('Mock detecting language for:', userInput);
  
  // Simple language detection based on common words/characters
  let detectedLanguage = 'Unknown';
  
  // Very basic detection for demo purposes
  if (/hello|world|test|the|is|this|work|portfolio/i.test(userInput)) {
    detectedLanguage = 'English';
  } else if (/hola|mundo|prueba|el|es|este|trabajo|portafolio|gracias|buenos/i.test(userInput)) {
    detectedLanguage = 'Spanish';
  } else if (/bonjour|monde|ceci|est|un|le/i.test(userInput)) {
    detectedLanguage = 'French';
  } else if (/こんにちは|世界|テスト|は|です|この/i.test(userInput)) {
    detectedLanguage = 'Japanese';
  }
  
  return {
    language: detectedLanguage,
    rawResponse: {
      role: "assistant",
      content: detectedLanguage
    },
    isMock: true
  };
}

// Function that uses OpenAI to detect language
async function detectLanguage(userInput) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a language detection assistant. 
          Analyze the text and determine what language it's written in. 
          Respond with the language name only.
          If the language is not detected, respond with just the word English.`
        },
        {
          role: "user",
          content: userInput,
        },
      ],
    });
    console.log(completion.choices[0].message.content)

    return {
      language: completion.choices[0].message.content,
      rawResponse: completion.choices[0].message,
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to detect language');
  }
}

export { router as languageDetectionRouter }; 