import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Submission from '@/models/Submission';
import { verifyToken, getTokenFromHeaders } from '@/utils/auth';
import mongoose from 'mongoose';

interface DecodedToken {
  userId: string;
  role: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const token = getTokenFromHeaders(request);
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string' || (decoded as DecodedToken).role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { submissionIds } = await request.json();

    if (!submissionIds || !Array.isArray(submissionIds) || submissionIds.length === 0) {
      return NextResponse.json({ message: 'Submission IDs array is required' }, { status: 400 });
    }

    // Validate all submission IDs
    const invalidIds = submissionIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return NextResponse.json({ 
        message: 'Invalid Submission ID format', 
        invalidIds 
      }, { status: 400 });
    }

    // Hard delete submissions
    const result = await Submission.deleteMany({ _id: { $in: submissionIds } });

    return NextResponse.json({ 
      message: 'Submissions deleted successfully',
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Bulk delete submissions error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}