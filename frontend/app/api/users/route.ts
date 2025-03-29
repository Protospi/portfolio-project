import { NextRequest, NextResponse } from 'next/server';

// Define the backend URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

/**
 * API endpoint to create a new user
 * POST /api/users
 */
export async function POST(request: NextRequest) {
  try {
    // Get user data from the request
    const userData = await request.json();
    
    // Ensure language is provided
    if (!userData.language) {
      return NextResponse.json(
        { error: 'Language is required' },
        { status: 400 }
      );
    }
    
    // Send the user data to the backend API
    const response = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        language: userData.language,
        name: userData.name || 'website-visitor',
        email: userData.email || ''
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Backend API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const createdUser = await response.json();
    console.log('User created successfully:', createdUser._id);
    
    return NextResponse.json(createdUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 