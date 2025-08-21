import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import { verifyToken, getTokenFromHeaders } from '@/utils/auth';

interface DecodedToken {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
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

    const { title, type, description, quantity, deadline, assignedTo, assignToAll } = await request.json();

    if (!title || !type || !description) {
      return NextResponse.json({ message: 'Title, type, and description are required' }, { status: 400 });
    }

    let finalAssignedTo: string[] = [];
    if (assignToAll) {
      // If assignToAll is true, assign to all students (empty array means all)
      finalAssignedTo = [];
    } else if (assignedTo && assignedTo.length > 0) {
      finalAssignedTo = assignedTo;
    } else {
      finalAssignedTo = [];
    }

    const newTask = new Task({
      title,
      type,
      description,
      quantity: quantity || 1,
      deadline: deadline ? new Date(deadline) : null,
      assignedTo: finalAssignedTo,
      createdBy: (decoded as DecodedToken).userId,
    });

    await newTask.save();
    await newTask.populate('createdBy', 'name');

    return NextResponse.json(newTask, { status: 201 });

  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// You can also add a GET route here to fetch all tasks
export async function GET(request: NextRequest): Promise<NextResponse> {
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

    let tasks;
    if ((decoded as DecodedToken).role === 'admin') {
      // Admins can see all active tasks
      tasks = await Task.find({ isActive: true })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
    } else {
      // Students can only see tasks assigned to them
      tasks = await Task.find({
        isActive: true,
        $or: [
          { assignedTo: { $in: [(decoded as DecodedToken).userId] } },
          { assignedTo: { $size: 0 } } // Tasks assigned to all students
        ]
      })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}