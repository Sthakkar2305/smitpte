import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Submission from "@/models/Submission";
import Task from "@/models/Task";       // 👈 ensure schema registered
import User from "@/models/User";       // 👈 ensure schema registered
import { verifyToken, getTokenFromHeaders } from "@/utils/auth";

export async function GET(request: Request) {
  try {
    await connectDB();

    const token = getTokenFromHeaders(request);
    if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    let submissions;
    if (decoded.role === "admin") {
      submissions = await Submission.find({})
        .populate("task", "title type")
        .populate("student", "name email")
        .populate("feedback.reviewedBy", "name")
        .sort({ submittedAt: -1 });
    } else {
      submissions = await Submission.find({ student: decoded.userId })
        .populate("task", "title type")
        .populate("feedback.reviewedBy", "name")
        .sort({ submittedAt: -1 });
    }

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Get submissions error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const token = getTokenFromHeaders(request);
    if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    const { taskId, notes, files } = await request.json();
    if (!taskId) {
      return NextResponse.json({ message: "Task ID is required" }, { status: 400 });
    }

    const submission = new Submission({
      task: taskId,
      student: decoded.userId,
      notes,
      files: files || [],
    });

    await submission.save();
    await submission.populate("task", "title type");

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Create submission error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
