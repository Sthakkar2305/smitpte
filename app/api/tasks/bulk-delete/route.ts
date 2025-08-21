import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
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

    const { taskIds, deleteSubmissions = false } = await request.json();

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json({ message: 'Task IDs array is required' }, { status: 400 });
    }

    // Validate all task IDs
    const invalidIds = taskIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return NextResponse.json({ 
        message: 'Invalid Task ID format', 
        invalidIds 
      }, { status: 400 });
    }

    // Delete associated submissions if requested
    if (deleteSubmissions) {
      await Submission.deleteMany({ task: { $in: taskIds } });
    }

    // Hard delete tasks (remove from database completely)
    const result = await Task.deleteMany({ _id: { $in: taskIds } });

    return NextResponse.json({ 
      message: 'Tasks deleted successfully',
      deletedCount: result.deletedCount,
      deleteSubmissions
    });

  } catch (error) {
    console.error('Bulk delete tasks error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}