// app/api/download/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;
  const uploadsDir = "/tmp"; // Look in project uploads folder
  const filePath = path.join(uploadsDir, filename);

  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileStream = fs.createReadStream(filePath);

    // Convert Node.js ReadStream to Web ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => {
          controller.enqueue(chunk);
        });
        fileStream.on('end', () => {
          controller.close();
        });
        fileStream.on('error', (err) => {
          controller.error(err);
        });
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `inline; filename="${filename}"`,
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
