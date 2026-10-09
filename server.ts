import express from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = (process.env.PORT && process.env.PORT !== '8080') ? Number(process.env.PORT) : 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI server-side with user's key
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// System Prompt for Priya Persona
const PRIYA_SYSTEM_INSTRUCTION = `
You are Priya, a realistic, production-style, voice-first native Android AI assistant (package: com.priya.aiassistant).
Persona guidelines:
- Name: Priya.
- Gender persona: Female, young adult style.
- Personality traits: Confident, smart, witty, friendly, emotionally responsive, playful, slightly teasing, helpful, natural.
- Language & Code-switching: Automatically understand and naturally respond in Hindi, Urdu, Hinglish, and English depending on how the user speaks. If the user speaks in Hindi/Hinglish (e.g., "Priya mujhe kal 8 baje yaad dila dena"), reply naturally in Hinglish/Hindi (e.g., "Bilkul! Kal subah 8 baje ka reminder set kar dete hain."). If English, speak fluent natural English.
- Tone: Casual, authentic, human-like voice assistant.
- Strictly Avoid: Robotic canned phrases, repetitive filler, explicit adult content, unsafe instructions, or falsely claiming an action was completed when a tool failed.
- Device Actions: You have tools for device actions (openWebsite, makePhoneCall, findContact, sendSMS, getLocation, openCamera, openGallery, openApp, controlMusic, getWeather, setReminder). Always invoke tools when appropriate.
`;

const PRIYA_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'openWebsite',
        description: 'Open a website URL requested by the user.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            url: { type: Type.STRING, description: 'The web URL to open, e.g. https://google.com' }
          },
          required: ['url']
        }
      },
      {
        name: 'makePhoneCall',
        description: 'Call a contact or phone number.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            phone_number: { type: Type.STRING, description: 'The phone number to dial' },
            contact_name: { type: Type.STRING, description: 'The contact name if known' }
          },
          required: ['phone_number']
        }
      },
      {
        name: 'findContact',
        description: 'Search device contacts by name.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Name of the contact to search for' }
          },
          required: ['name']
        }
      },
      {
        name: 'sendSMS',
        description: 'Prepare or send an SMS text message.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            phone_number: { type: Type.STRING, description: 'Destination phone number or contact' },
            message: { type: Type.STRING, description: 'Text message content' }
          },
          required: ['phone_number', 'message']
        }
      },
      {
        name: 'getLocation',
        description: 'Get device current location coordinates and city name.',
        parameters: {
          type: Type.OBJECT,
          properties: {}
        }
      },
      {
        name: 'openCamera',
        description: 'Launch the camera to take a photo or scan visual objects.',
        parameters: {
          type: Type.OBJECT,
          properties: {}
        }
      },
      {
        name: 'openGallery',
        description: 'Open photos and files gallery.',
        parameters: {
          type: Type.OBJECT,
          properties: {}
        }
      },
      {
        name: 'openApp',
        description: 'Launch an installed Android application.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            app_name: { type: Type.STRING, description: 'Application name e.g. WhatsApp, Spotify, YouTube, Settings' }
          },
          required: ['app_name']
        }
      },
      {
        name: 'controlMusic',
        description: 'Control music playback (play, pause, next, ambient).',
        parameters: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, description: 'play, pause, next, or previous' },
            track: { type: Type.STRING, description: 'Optional track name or genre' }
          },
          required: ['action']
        }
      },
      {
        name: 'getWeather',
        description: 'Get current weather forecast for current or specified location.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            location: { type: Type.STRING, description: 'City name or current' }
          }
        }
      },
      {
        name: 'setReminder',
        description: 'Set a reminder or memory note for the user.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            reminder_text: { type: Type.STRING, description: 'The task or reminder message' },
            time: { type: Type.STRING, description: 'When to remind, e.g. tomorrow at 8 AM, 15 minutes' }
          },
          required: ['reminder_text']
        }
      }
    ]
  }
];

// Helper to synthesize speech using gemini-3.8-flash-lite-tts
async function synthesizeSpeech(text: string): Promise<string | null> {
  if (!ai || !text.trim()) return null;
  try {
    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text: text.slice(0, 400) }]
        }
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' } // Natural female voice
          }
        }
      }
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (err) {
    console.warn('TTS generation notice:', err instanceof Error ? err.message : err);
    return null;
  }
}

// Health status API
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'online',
    assistant: 'Priya',
    package: 'com.priya.aiassistant',
    hasApiKey: Boolean(apiKey),
    capabilities: ['voice-first', 'gemini-live', 'android-device-actions', 'tts']
  });
});

// Voice / chat turn API endpoint
app.post('/api/voice-turn', async (req, res) => {
  try {
    const { message, history = [], audioBase64, mimeType = 'audio/webm', locationInfo } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in server environment. Please set GEMINI_API_KEY in the Secrets panel.'
      });
    }

    // Build contents
    const contents: any[] = [];

    // Append prior history (capped to last 8 turns)
    const recentHistory = Array.isArray(history) ? history.slice(-8) : [];
    for (const h of recentHistory) {
      if (h.role && h.text) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.text }]
        });
      }
    }

    const currentParts: any[] = [];
    if (audioBase64) {
      currentParts.push({
        inlineData: {
          mimeType: mimeType,
          data: audioBase64
        }
      });
    }

    let userPromptText = message || '';
    if (locationInfo) {
      userPromptText += `\n[Device Context: Location=${locationInfo.city || 'current'}, Weather=${locationInfo.temp || '31°C Clear'}]`;
    }

    if (userPromptText) {
      currentParts.push({ text: userPromptText });
    }

    if (currentParts.length === 0) {
      return res.status(400).json({ error: 'No audio or message provided' });
    }

    contents.push({
      role: 'user',
      parts: currentParts
    });

    // Call Gemini 3.8 Flash model with fallback to gemini-flash-latest
    let response: any = null;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: PRIYA_SYSTEM_INSTRUCTION,
          tools: PRIYA_TOOLS as any,
          temperature: 0.7
        }
      });
    } catch (err: any) {
      console.warn('Falling back to gemini-flash-latest for voice-turn:', err?.message || err);
      response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents,
        config: {
          systemInstruction: PRIYA_SYSTEM_INSTRUCTION,
          tools: PRIYA_TOOLS as any,
          temperature: 0.7
        }
      });
    }

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    let textResponse = '';
    const functionCalls: any[] = [];

    for (const part of parts) {
      if (part.text) {
        textResponse += part.text;
      }
      if (part.functionCall) {
        functionCalls.push(part.functionCall);
      }
    }

    // If there is function call but no text, synthesize brief acknowledgement
    if (functionCalls.length > 0 && !textResponse) {
      const call = functionCalls[0];
      if (call.name === 'openCamera') textResponse = 'Opening camera right away.';
      else if (call.name === 'makePhoneCall') textResponse = `Calling ${call.args?.contact_name || call.args?.phone_number || 'contact'}.`;
      else if (call.name === 'sendSMS') textResponse = `Drafting message to ${call.args?.phone_number}.`;
      else if (call.name === 'openApp') textResponse = `Opening ${call.args?.app_name}.`;
      else if (call.name === 'controlMusic') textResponse = `Playing music for you.`;
      else if (call.name === 'getWeather') textResponse = `Checking current weather conditions.`;
      else if (call.name === 'setReminder') textResponse = `Bilkul! Reminder note kar liya hai.`;
      else textResponse = 'Working on that for you!';
    }

    // Generate voice audio for Priya's response
    let audioWavBase64: string | null = null;
    if (textResponse) {
      audioWavBase64 = await synthesizeSpeech(textResponse);
    }

    res.json({
      text: textResponse,
      audioBase64: audioWavBase64,
      functionCalls
    });
  } catch (error: any) {
    console.error('Error in /api/voice-turn:', error);
    res.status(500).json({
      error: error?.message || 'Voice turn processing encountered an error'
    });
  }
});

// Dedicated TTS endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const audio = await synthesizeSpeech(text);
    if (!audio) {
      return res.status(500).json({ error: 'Failed to synthesize audio' });
    }
    res.json({ audioBase64: audio });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Multimodal Camera Object Analysis endpoint
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', userPrompt = '' } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in server environment.'
      });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    const visionPrompt = userPrompt
      ? `User question about this image: "${userPrompt}". Carefully inspect the image and answer in Priya's natural, witty, friendly tone (Hinglish/Hindi/English code-switching). Identify the primary object or scene, its details, and any helpful context.`
      : `Carefully inspect this image captured from the user's phone camera.
In Priya's signature warm, witty, natural voice persona (friendly Hinglish/Hindi and English, e.g. "Ye ek ... hai"):
1. Identify the main object, product, text, or device clearly.
2. Explain what it is, its purpose, or key features.
3. Give one practical tip or interesting fact about it.
Keep the answer natural, engaging, and concise (3-4 sentences max), perfect for voice assistant output.`;

    let response: any = null;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64
                }
              },
              { text: visionPrompt }
            ]
          }
        ],
        config: {
          systemInstruction: PRIYA_SYSTEM_INSTRUCTION,
          temperature: 0.6
        }
      });
    } catch (err: any) {
      console.warn('Falling back to gemini-flash-latest for vision:', err?.message || err);
      response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64
                }
              },
              { text: visionPrompt }
            ]
          }
        ],
        config: {
          systemInstruction: PRIYA_SYSTEM_INSTRUCTION,
          temperature: 0.6
        }
      });
    }

    const candidate = response.candidates?.[0];
    const analysisText = candidate?.content?.parts?.find((p: any) => p.text)?.text || 'Main is object ko theek se pehchan nahi paayi, kripya roshni mein dobara scan kijiye.';

    const audioBase64 = await synthesizeSpeech(analysisText);

    res.json({
      analysisText,
      audioBase64
    });
  } catch (error: any) {
    console.error('Vision analysis error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to analyze image'
    });
  }
});

// WebSocket server on /api/live for streaming audio interaction
const wss = new WebSocketServer({ server, path: '/api/live' });

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected to Priya Live Audio stream');

  ws.on('message', async (data: Buffer | string) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (parsed.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
        return;
      }

      if (parsed.type === 'audio_chunk' || parsed.type === 'user_speech') {
        // Handle incoming client audio chunk or transcribe
        const promptText = parsed.text || 'Hey Priya, how are you?';
        if (ai) {
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [{ role: 'user', parts: [{ text: promptText }] }],
            config: {
              systemInstruction: PRIYA_SYSTEM_INSTRUCTION,
              tools: PRIYA_TOOLS as any
            }
          });
          const text = response.candidates?.[0]?.content?.parts?.find(p => p.text)?.text || 'Haan bolo, main sun rahi hoon.';
          const audio = await synthesizeSpeech(text);
          ws.send(JSON.stringify({
            type: 'assistant_response',
            text,
            audioBase64: audio
          }));
        }
      }
    } catch (e) {
      console.error('WS message error:', e);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from Priya Live');
  });
});

wss.on('error', (err) => {
  console.warn('WebSocket server notice:', err.message);
});

// Setup Vite middlewares in development or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use.`);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`Priya AI Assistant server running on port ${port} (0.0.0.0)`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
