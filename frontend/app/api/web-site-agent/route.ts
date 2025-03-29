import { NextResponse } from 'next/server';

// Define the backend URL - in production this would come from environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Valid messages array is required' },
        { status: 400 }
      );
    }

    if (!body.userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Extract messages, language, agent, and conversationId from the request
    const { messages, language, agent, conversationId, userId } = body;

    // Prepare the payload for the backend
    const backendPayload = {
      messages,
      language: language || 'en', // Default to English if no language specified
      agent: agent || 'website', // Default to website agent if not specified
      conversationId, // Forward the conversation ID to the backend
      userId // Forward the user ID to the backend
    };

    // Forward the request to the backend and handle streaming
    const response = await fetch(`${BACKEND_URL}/api/web-site-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error: ${response.status}`, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    // Return a streaming response
    const readable = response.body;
    if (!readable) {
      return NextResponse.json(
        { error: 'No response body from backend' },
        { status: 500 }
      );
    }

    // Create a streaming response
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in web-site-agent API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 