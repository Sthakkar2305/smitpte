// app/api/download/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { promises as fsp } from 'fs';

export const runtime = 'nodejs';

// Resolve candidate uploads directories in priority order
const CANDIDATE_UPLOAD_DIRS = [
  // When process.cwd() is the app project (e.g., pte/project)
  path.join(process.cwd(), 'uploads'),
  // When process.cwd() is the workspace root (e.g., pte)
  path.join(process.cwd(), 'project', 'uploads'),
  // Absolute path fallback
  path.join(__dirname, '..', '..', '..', 'uploads'),
  // Fallback tmp (used by some hosts)
  '/tmp',
];

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;
  
  // Debug endpoint: if filename is "debug", return list of available files
  if (filename === 'debug') {
    try {
      const debugDir = path.join(process.cwd(), 'project', 'uploads');
      const files = await fsp.readdir(debugDir);
      return NextResponse.json({ 
        message: 'Available files',
        files,
        cwd: process.cwd(),
        debugDir
      });
    } catch (error) {
      return NextResponse.json({ 
        error: 'Cannot read uploads directory',
        cwd: process.cwd()
      });
    }
  }
  
  try {
    console.log('Download request for filename:', filename);
    console.log('Current working directory:', process.cwd());
    
    let filePath: string | null = null;
    for (const dir of CANDIDATE_UPLOAD_DIRS) {
      const p = path.join(dir, filename);
      console.log('Checking path:', p);
      try {
        await fsp.access(p);
        filePath = p;
        console.log('File found at:', p);
        break;
      } catch (err) {
        console.log('File not found at:', p);
      }
    }

    if (!filePath) {
      console.log('File not found in any directory');
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