import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import fs from "fs";
import path from "path";
import mime from "mime-types";

interface DecodedToken {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token) as DecodedToken | null;
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { filename } = params;
    const url = new URL(request.url);
    const originalName = url.searchParams.get("originalName") || filename;

    if (!filename || filename.includes("..") || filename.includes("/")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = mime.lookup(originalName) || "application/octet-stream";

    // Convert Buffer to Uint8Array
    const uint8Array = new Uint8Array(fileBuffer);
    
    return new Response(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(originalName)}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}