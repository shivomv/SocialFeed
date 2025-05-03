import { NextResponse } from 'next/server';
import { verifyToken, uploadFile } from '@/utils/models';
import { writeFile, mkdir, access } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Get file details
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const originalName = file.name;
    const fileExt = path.extname(originalName);
    const filename = `${uuidv4()}${fileExt}`;

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await createDirIfNotExists(uploadDir);

    // Create user directory if it doesn't exist
    const userDir = path.join(uploadDir, user._id.toString());
    await createDirIfNotExists(userDir);

    // Save file to disk
    const filePath = path.join(userDir, filename);
    await writeFile(filePath, buffer);

    // Create relative path for URL
    const relativePath = path.join('uploads', user._id.toString(), filename).replace(/\\/g, '/');
    const url = `/uploads/${user._id.toString()}/${filename}`;

    // Save file info to database
    const fileDoc = await uploadFile({
      filename,
      originalName,
      mimetype: file.type,
      size: buffer.length,
      path: relativePath,
      url,
      uploadedBy: user._id,
    });

    return NextResponse.json({
      url,
      fileId: fileDoc._id,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { message: 'Error uploading file' },
      { status: 500 }
    );
  }
}

// Helper function to create directory if it doesn't exist
async function createDirIfNotExists(dir) {
  try {
    await access(dir);
  } catch (error) {
    await mkdir(dir, { recursive: true });
  }
}
