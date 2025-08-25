import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Submission from "@/models/Submission";
import Task from "@/models/Task";
import User from "@/models/User";
import { verifyToken, getTokenFromHeaders } from "@/utils/auth";

// In your /api/submissions route.ts
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

    let submissions;
    let total;
    
    if (decoded.role === "admin") {
      submissions = await Submission.find({})
        .populate("task", "title type")
        .populate("student", "name email")
        .populate("feedback.reviewedBy", "name")
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit);
      
      total = await Submission.countDocuments({});
    } else {
      submissions = await Submission.find({ student: decoded.userId })
        .populate("task", "title type")
        .populate("feedback.reviewedBy", "name")
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit);
      
      total = await Submission.countDocuments({ student: decoded.userId });
    }

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      submissions,
      currentPage: page,
      totalPages,
      totalSubmissions: total
    });
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

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Check if deadline has passed
    if (task.deadline && new Date(task.deadline) < new Date()) {
      // Create a rejected submission automatically
      const rejectedSubmission = new Submission({
        task: taskId,
        student: decoded.userId,
        notes: "Automatic rejection: Deadline passed",
        files: files || [],
        status: "rejected",
        feedback: {
          text: "Your submission was automatically rejected because the deadline has passed.",
          reviewedBy: "system",
          reviewedAt: new Date(),
        }
      });

      await rejectedSubmission.save();
      await rejectedSubmission.populate("task", "title type");

      return NextResponse.json({ 
        message: "Submission deadline has passed",
        submission: rejectedSubmission,
        status: "rejected" 
      }, { status: 400 });
    }

    const submission = new Submission({
      task: taskId,
      student: decoded.userId,
      notes,
      files: files || [],
    });

    await submission.save();
    
    // Populate the task field before returning
    await submission.populate("task", "title type");

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Create submission error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}