import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import Message from '../models/messages.js';

dotenv.config();

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
You are Pedro's portfolio website agent.
You help users learn about Pedro's professional background, skills, projects, and experiences.
You can provide information about his curriculum, portfolio, and professional achievements.
Be conversational, helpful, and informative.
`

// Translation system prompt
const translationSystemPrompt = `
You are a translator. Translate the given text to the target language.
Maintain the original meaning, tone, and style as much as possible.
Do not add any additional information or commentary.
If the content is not related to Pedro's professional background, skills, projects, and experiences
change the text to say that  the agent is not able to answer that question.
Also if the user ask to take control of the conversation, say that you are Pedro professional portfolio agent and you can only answer questions related to his professional background, skills, projects, and experiences.
Make shure that the response is in the same language as the user's question.
`

// Helper function to save assistant's message to the database
async function saveAssistantMessage(content, language, agent, conversationId, userId) {
  try {
    if (!userId) {
      console.error('Error saving assistant message: No userId provided');
      return;
    }
    
    const message = new Message({
      sender: 'assistant',
      userId: userId,
      conversationId: conversationId,
      userName: 'website-visitor',
      messageAuthor: 'assistant',
      messageType: 'text',
      text: content,
      language: language || 'en',
      agent: agent || 'website',
      toolsCalled: [],
      createdAt: new Date()
    });

    await message.save();
    console.log('Assistant message saved to database');
  } catch (error) {
    console.error('Error saving assistant message to database:', error);
  }
}

// POST endpoint for the website agent 
router.post('/web-site-agent', async (req, res) => {
  try {
    const { messages, language, agent, conversationId, userId } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Valid messages array is required' });
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Check if system message already exists, if not add it
    const hasSystemMessage = messages.some(msg => msg.role === 'system');
    const finalMessages = hasSystemMessage ? messages : [
      { role: 'system', content: systemPrompt },
      ...messages
    ];
    
    // For testing purposes:
    // If OpenAI API key is not set or is the placeholder, use mock response
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.log('Using mock response (no valid API key found)');
      return mockResponse(res, finalMessages, language, agent, conversationId, userId);
    }

    // Set up response for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Step 1: Generate response in English
    console.log('Generating response in English...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: finalMessages,
      stream: false, // Non-streaming for the initial response
    });
    
    const initialResponse = completion.choices[0].message.content;
    console.log('Initial response generated');

    // If language is English or not specified, stream the response directly
    if (!language || language === 'en') {
      // Save the English response to database before streaming
      if (conversationId) {
        await saveAssistantMessage(initialResponse, 'en', agent, conversationId, userId);
      }
      
      streamTextResponse(res, initialResponse);
      return;
    }
    
    // Step 2: Translate the response to the target language
    console.log(`Translating response to ${language}...`);
    const translationMessages = [
      { role: 'system', content: translationSystemPrompt },
      { role: 'user', content: `Translate the following text to ${language}: ${initialResponse}` }
    ];
    
    const translationStream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: translationMessages,
      stream: true,
    });
    
    // For database saving, we need to accumulate the full response
    let fullTranslatedResponse = '';
    
    // Stream the translated response chunks to the client
    for await (const chunk of translationStream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullTranslatedResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    
    // Save the full translated response to the database
    if (conversationId) {
      await saveAssistantMessage(fullTranslatedResponse, language, agent, conversationId, userId);
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error in website agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to stream text response character by character
async function streamTextResponse(res, text) {
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    res.write(`data: ${JSON.stringify({ content: char })}\n\n`);
    await new Promise(resolve => setTimeout(resolve, 10)); // Small delay for streaming effect
  }
  res.write('data: [DONE]\n\n');
  res.end();
}

// Mock function for testing without OpenAI API key
function mockResponse(res, messages, language, agent, conversationId, userId) {
  console.log('Mock website agent response');
  
  // Extract the last user message for context
  const lastUserMessage = messages.find(msg => msg.role === 'user')?.content || '';
  
  // Simple mock responses
  const mockResponses = {
    en: [
      "I'm Pedro's portfolio agent. How can I help you learn about Pedro's professional experience?",
      "Pedro has extensive experience in web development and has worked on various projects.",
      "You can find Pedro's portfolio at the main page of this website.",
      "Pedro specializes in React, Node.js, and modern web technologies."
    ],
    es: [
      "Soy el agente del portafolio de Pedro. ¿Cómo puedo ayudarte a conocer la experiencia profesional de Pedro?",
      "Pedro tiene amplia experiencia en desarrollo web y ha trabajado en varios proyectos.",
      "Puedes encontrar el portafolio de Pedro en la página principal de este sitio web.",
      "Pedro se especializa en React, Node.js y tecnologías web modernas."
    ],
    fr: [
      "Je suis l'agent de portfolio de Pedro. Comment puis-je vous aider à en savoir plus sur l'expérience professionnelle de Pedro?",
      "Pedro a une vaste expérience en développement web et a travaillé sur divers projets.",
      "Vous pouvez trouver le portfolio de Pedro sur la page principale de ce site web.",
      "Pedro est spécialisé dans React, Node.js et les technologies web modernes."
    ]
  };
  
  // Set streaming headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Choose a response based on user input and language
  const responses = mockResponses[language] || mockResponses.en;
  let responseText;
  
  if (lastUserMessage.toLowerCase().includes('experience')) {
    responseText = responses[1];
  } else if (lastUserMessage.toLowerCase().includes('portfolio')) {
    responseText = responses[2];
  } else if (lastUserMessage.toLowerCase().includes('skills') || lastUserMessage.toLowerCase().includes('technologies')) {
    responseText = responses[3];
  } else {
    responseText = responses[0];
  }
  
  // Save mock response to database if conversationId is provided
  if (conversationId) {
    saveAssistantMessage(responseText, language, agent, conversationId, userId);
  }
  
  // Stream the mock response character by character
  streamTextResponse(res, responseText);
  return;
}

export { router as webSiteAgentRouter };