import { NextResponse } from 'next/server';
import { loginUser } from '@/utils/models';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Login user
    const { user, token } = await loginUser(email, password);
    
    // Return user data and token (exclude password)
    const userData = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt
    };
    
    return NextResponse.json({ user: userData, token });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: error.message || 'Login failed' },
      { status: 401 }
    );
  }
}
