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

    // Get files from formData
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const results: {
      originalName: string;
      filename: string;
      url: string;
      publicId: string;
      size: number;
      mimetype: string;
    }[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploaded: UploadApiResponse = await new Promise(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "auto",
                folder: "pte-materials",
                use_filename: true,
                unique_filename: true,
              },
              (
                error: UploadApiErrorResponse | undefined,
                result: UploadApiResponse | undefined
              ) => {
                if (error || !result) reject(error);
                else resolve(result);
              }
            )
            .end(buffer);
        }
      );

      results.push({
        originalName: file.name,
        filename: uploaded.public_id,
        url: uploaded.secure_url, // ✅ This is the Cloudinary link
        publicId: uploaded.public_id,
        size: uploaded.bytes,
        mimetype:
          uploaded.resource_type === "image"
            ? `image/${uploaded.format}`
            : uploaded.resource_type,
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Material upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
