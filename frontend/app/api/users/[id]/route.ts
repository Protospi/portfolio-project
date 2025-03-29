import { NextRequest, NextResponse } from 'next/server';

// Define the backend URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

/**
 * API endpoint to get a user by ID
 * GET /api/users/[id]
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;
    
    // Send the request to the backend API
    const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const user = await response.json();
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}