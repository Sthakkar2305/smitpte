import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Submission from '@/models/Submission';
import { verifyToken, getTokenFromHeaders } from '@/utils/auth';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    
    const token = getTokenFromHeaders(request);
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const { status, feedbackText } = await request.json();

    const submission = await Submission.findByIdAndUpdate(
      id,
      {
        status,
        feedback: {
          text: feedbackText,
          reviewedBy: decoded.userId,
          reviewedAt: new Date()
        }
      },
      { new: true }
    )
    .populate('task', 'title type')
    .populate('student', 'name email')
    .populate('feedback.reviewedBy', 'name');

    if (!submission) {
      return NextResponse.json(
        { message: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(submission);

  } catch (error) {
    console.error('Update submission error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}