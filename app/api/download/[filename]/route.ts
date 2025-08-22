import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fsp } from "fs";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  try {
    const url = new URL(req.url);
    const originalName = url.searchParams.get("originalName") || filename;
    const cloudinaryUrl = url.searchParams.get("url");

    // ✅ Auto-detect Cloudinary files
    if (
      (cloudinaryUrl && cloudinaryUrl.includes("cloudinary.com")) ||
      filename.includes("cloudinary")
    ) {
      // Add download flag to force attachment
      let downloadUrl = cloudinaryUrl || filename;
      if (downloadUrl.includes("cloudinary.com") && !downloadUrl.includes("fl_attachment")) {
        downloadUrl = downloadUrl.includes("?")
          ? `${downloadUrl}&fl_attachment=${encodeURIComponent(originalName)}`
          : `${downloadUrl}?fl_attachment=${encodeURIComponent(originalName)}`;
      }
      return NextResponse.redirect(downloadUrl);
    }

    // ✅ Otherwise, try to serve from local uploads
    const CANDIDATE_UPLOAD_DIRS = [
      path.join(process.cwd(), "uploads"),
      path.join(process.cwd(), "project", "uploads"),
      path.join(__dirname, "..", "..", "..", "uploads"),
      "/tmp",
    ];

    let filePath: string | null = null;
    for (const dir of CANDIDATE_UPLOAD_DIRS) {
      const p = path.join(dir, filename);
      try {
        await fsp.access(p);
        filePath = p;
        break;
      } catch {
        // continue searching
      }
    }

    if (!filePath) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read file
    const stats = await fsp.stat(filePath);
    const fileSize = stats.size;
    const fileBuffer = await fsp.readFile(filePath);

    // Detect type
    const getContentType = (filename: string) => {
      const ext = path.extname(filename).toLowerCase();
      const contentTypes: { [key: string]: string } = {
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".txt": "text/plain",
      };
      return contentTypes[ext] || "application/octet-stream";
    };

    // Stream response
    const readableStream = new ReadableStream({
      start(controller) {
        controller.enqueue(fileBuffer);
        controller.close();
      },
    });

    return new Response(readableStream, {
      status: 200,
      headers: {
        "Content-Type": getContentType(filename),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          originalName
        )}"`,
        "Content-Length": fileSize.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
