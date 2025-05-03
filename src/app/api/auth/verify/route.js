import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/models';

export async function GET(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Return user data (exclude password and sessions)
    const userData = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      profileImage: user.profileImage,
      createdAt: user.createdAt
    };
    
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
}
