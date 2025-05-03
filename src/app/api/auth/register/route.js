import { NextResponse } from 'next/server';
import { registerUser } from '@/utils/models';

export async function POST(request) {
  try {
    const { email, password, fullName } = await request.json();
    
    // Validate input
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { message: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }
    
    // Register user
    const { user, token } = await registerUser({ email, password, fullName });
    
    // Return user data and token (exclude password)
    const userData = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt
    };
    
    return NextResponse.json({ user: userData, token }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}
