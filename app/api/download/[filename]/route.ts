import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { promises as fsp } from 'fs';

export const runtime = 'nodejs';

// For Cloudinary files, we'll redirect to the Cloudinary URL
// For local files, we'll serve them directly

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;
  
  try {
    // Check if this is a Cloudinary file (indicated by a query parameter)
    const url = new URL(req.url);
    const isCloudinary = url.searchParams.get('cloudinary');
    const cloudinaryUrl = url.searchParams.get('url');
    const originalName = url.searchParams.get('originalName') || filename;
    
    // If it's a Cloudinary file, redirect to the Cloudinary URL
    if (isCloudinary && cloudinaryUrl) {
      return NextResponse.redirect(cloudinaryUrl);
    }
    
    // For local files, try to find them in various directories
    const CANDIDATE_UPLOAD_DIRS = [
      path.join(process.cwd(), 'uploads'),
      path.join(process.cwd(), 'project', 'uploads'),
      path.join(__dirname, '..', '..', '..', 'uploads'),
      '/tmp',
    ];

    let filePath: string | null = null;
    for (const dir of CANDIDATE_UPLOAD_DIRS) {
      const p = path.join(dir, filename);
      try {
        await fsp.access(p);
        filePath = p;
        break;
      } catch (err) {
        // File not found in this directory, continue searching
      }
    }

    if (!filePath) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Get file stats
    const stats = await fsp.stat(filePath);
    const fileSize = stats.size;
    
    // Read the file as a buffer
    const fileBuffer = await fsp.readFile(filePath);
    
    // Determine content type based on file extension
    const getContentType = (filename: string) => {
      const ext = path.extname(filename).toLowerCase();
      const contentTypes: { [key: string]: string } = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.txt': 'text/plain',
      };
      return contentTypes[ext] || 'application/octet-stream';
    };

    // Convert Buffer to ReadableStream for proper response handling
    const readableStream = new ReadableStream({
      start(controller) {
        controller.enqueue(fileBuffer);
        controller.close();
      }
    });

    return new Response(readableStream, {
      status: 200,
      headers: {
        'Content-Type': getContentType(filename),
        'Content-Disposition': `attachment; filename="${encodeURIComponent(originalName)}"`,
        'Content-Length': fileSize.toString(),
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}