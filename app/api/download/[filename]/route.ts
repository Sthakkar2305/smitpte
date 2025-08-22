// app/api/download/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { promises as fsp } from 'fs';

// Define the uploads directory - use project uploads first, fallback to tmp
const PROJECT_UPLOADS_DIR = path.join(process.cwd(), 'project', 'uploads');
const FALLBACK_UPLOADS_DIR = '/tmp';

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;
  
  try {
    // Try project uploads dir first, else fallback
    const candidatePaths = [
      path.join(PROJECT_UPLOADS_DIR, filename),
      path.join(FALLBACK_UPLOADS_DIR, filename),
    ];

    let filePath: string | null = null;
    for (const p of candidatePaths) {
      try {
        await fsp.access(p);
        filePath = p;
        break;
      } catch {}
    }

    if (!filePath) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Get file stats
    const stats = await fsp.stat(filePath);
    const fileSize = stats.size;
    
    // Read the file as a buffer
    const fileBuffer = await fsp.readFile(filePath);
    
    // Get original filename from query params if available
    const url = new URL(req.url);
    const originalName = url.searchParams.get('originalName') || filename;
    
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