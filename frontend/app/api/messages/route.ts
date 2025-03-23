import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to save a message to the database
 * POST /api/messages
 */
export async function POST(request: NextRequest) {
  try {
    // Get the message data from the request
    const messageData = await request.json();
    
    // Send the message data to the backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: messageData.role === 'user' ? 'user' : 'assistant',
        conversationId: messageData.conversationId,
        userName: 'website-visitor', // Default user name for website visitors
        messageAuthor: messageData.role,
        messageType: 'text',
        text: messageData.content,
        language: messageData.languageCode,
        agent: messageData.agent,
        toolsCalled: [], // Default empty array since we're not using tools yet
        createdAt: messageData.timestamp || new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const savedMessage = await response.json();
    return NextResponse.json(savedMessage, { status: 201 });
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
} 