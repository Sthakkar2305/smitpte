import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Submission from "@/models/Submission";
import { verifyToken, getTokenFromHeaders } from "@/utils/auth";

export async function GET(request: Request) {
  try {
    await connectDB();

    const token = getTokenFromHeaders(request);
    if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // For history, we want only submissions with a status (approved, rejected, pending)
    const query = { 
      student: decoded.userId,
      status: { $in: ["approved", "rejected", "pending"] }
    };
    
    const submissions = await Submission.find(query)
      .populate("task", "title type deadline description")
      .populate("feedback.reviewedBy", "name")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Submission.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      submissions,
      currentPage: page,
      totalPages,
      totalSubmissions: total
    });
  } catch (error) {
    console.error("Get submission history error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}