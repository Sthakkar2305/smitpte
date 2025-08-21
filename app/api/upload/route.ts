// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyToken } from '@/utils/auth';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    
    // Convert ArrayBuffer to Uint8Array
    const buffer = new Uint8Array(bytes);
    
    // Ensure uploads directory exists
    const uploadsDir = "/tmp";;
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      console.error('Error creating uploads directory:', err);
    }

    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || '';
    const baseName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueFilename = `${sanitizedBaseName}_${timestamp}.${fileExtension}`;
    
    const filePath = path.join(uploadsDir, uniqueFilename);
    
    // Write file
    await writeFile(filePath, buffer);

    // Return the file information with the correct filename
    return NextResponse.json({
      originalName: file.name,
      filename: uniqueFilename, // This should not be undefined
      url: `/api/download/${uniqueFilename}?originalName=${encodeURIComponent(file.name)}`,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}