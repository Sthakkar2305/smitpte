// app/api/download/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;
  console.log('Download request for filename:', filename);
  const localUploadsDir = path.join(process.cwd(), 'uploads');
  const tmpDir = "/tmp";

  const candidatePaths = [
    path.join(localUploadsDir, filename),
    path.join(tmpDir, filename),
  ];

  console.log('Looking for file in paths:', candidatePaths);
  const filePath = candidatePaths.find((p) => fs.existsSync(p));
  console.log('Found file at:', filePath);

  try {
    if (!filePath) {
      console.log('File not found in any location');
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileStream = fs.createReadStream(filePath);

    const url = new URL(req.url);
    const originalName = url.searchParams.get('originalName') || filename;

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
        'Content-Disposition': `inline; filename="${originalName}"`,
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
