import { NextResponse } from 'next/server';
import { getAllPosts, createPost, verifyToken } from '@/utils/models';

// GET handler to fetch all posts
export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { message: 'Error fetching posts' },
      { status: 500 }
    );
  }
}

// POST handler to create a new post
export async function POST(request) {
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

    const { content, imageUrl } = await request.json();

    if (!content) {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      );
    }

    // Create post
    const newPost = await createPost({
      content,
      imageUrl: imageUrl || '',
      author: user._id,
    });

    // Fetch the populated post
    const populatedPost = await newPost.populate('author', 'fullName email profileImage');

    // Serialize the MongoDB object
    const serializedPost = {
      id: populatedPost._id.toString(),
      content: populatedPost.content,
      imageUrl: populatedPost.imageUrl || '',
      createdAt: populatedPost.createdAt.toISOString(),
      updatedAt: populatedPost.updatedAt.toISOString(),
      author: populatedPost.author ? {
        id: populatedPost.author._id.toString(),
        fullName: populatedPost.author.fullName,
        email: populatedPost.author.email,
        profileImage: populatedPost.author.profileImage
      } : null,
      likes: []
    };

    return NextResponse.json(serializedPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { message: 'Error creating post' },
      { status: 500 }
    );
  }
}
