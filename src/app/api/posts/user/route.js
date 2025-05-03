import { NextResponse } from 'next/server';
import { getPostsByUser, verifyToken } from '@/utils/models';

// GET handler to fetch posts for the current user
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

    // Verify token and get user
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get posts by user
    const posts = await getPostsByUser(user._id);

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json(
      { message: 'Error fetching user posts' },
      { status: 500 }
    );
  }
}
