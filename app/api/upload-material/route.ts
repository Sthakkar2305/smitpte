import { NextRequest, NextResponse } from "next/server";
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";
import { verifyToken } from "@/utils/auth";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Helper function to determine Cloudinary resource type from MIME type
const getResourceType = (mimetype: string): "image" | "video" | "raw" => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  // ✅ FIX: Classify audio as 'video' to satisfy the older type definition.
  // Cloudinary will still process it correctly as an audio file.
  if (mimetype.startsWith("audio/")) return "video"; 
  return "raw"; // Default for PDFs, DOCs, etc.
};


export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine the correct resource_type before uploading
    const resourceType = getResourceType(file.type);

   // In your route.ts file, update the upload configuration:
const uploaded: UploadApiResponse = await new Promise(
  (resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: "pte-materials",
        // Preserve the original filename with extension
        use_filename: true,
        unique_filename: false, // Set to false to keep original name
        overwrite: false, // Don't overwrite existing files
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined
      ) => {
        if (error || !result) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  }
);
    
    const result = {
      originalName: file.name,
      filename: uploaded.public_id,
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      size: uploaded.bytes,
      mimetype: file.type || uploaded.resource_type,
    };

    return NextResponse.json([result]);

  } catch (error) {
    console.error("Material upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}