import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Submission from '@/models/Submission';
import { verifyToken, getTokenFromHeaders } from '@/utils/auth';

export async function GET(request) {
  try {
    await connectDB();
    
    const token = getTokenFromHeaders(request);
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const submissions = await Submission.find({})
      .populate('task', 'title type')
      .populate('student', 'name email')
      .populate('feedback.reviewedBy', 'name')
      .sort({ submittedAt: -1 });

    // Extract file information for debugging
    const fileInfo = submissions.map(submission => ({
      submissionId: submission._id,
      studentName: submission.student?.name,
      taskTitle: submission.task?.title,
      files: submission.files?.map(file => ({
        filename: file.filename,
        originalName: file.originalName,
        path: file.path,
        url: file.url,
        fileType: file.fileType,
        size: file.size
      })) || []
    }));

    return NextResponse.json({
      totalSubmissions: submissions.length,
      fileInfo
    });

  } catch (error) {
    console.error('Debug submissions error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
