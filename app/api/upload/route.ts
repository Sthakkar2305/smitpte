import { NextResponse, NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { verifyToken, getTokenFromHeaders } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request);
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, new Uint8Array(buffer));

    // Return file info
    return NextResponse.json({
      filename,
      originalName: file.name,
      path: `/uploads/${filename}`,
      fileType: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
  }
}
