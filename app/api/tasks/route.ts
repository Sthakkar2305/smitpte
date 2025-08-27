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

    console.log('Creating task with data:', {
      title, type, description, quantity, deadline, assignedTo, assignToAll
    });

    if (!title || !type) {
      return NextResponse.json({ message: 'Title and type are required' }, { status: 400 });
    }

    let finalAssignedTo: string[] = [];
    if (!assignToAll && assignedTo && assignedTo.length > 0) {
      finalAssignedTo = assignedTo;
    }

    const newTask = new Task({
      title,
      type,
      description: description || '',
      quantity: quantity || 1,
      deadline: deadline ? new Date(deadline) : null,
      assignedTo: finalAssignedTo,
      createdBy: (decoded as DecodedToken).userId,
      assignToAll: assignToAll || false,
    });

    const savedTask = await newTask.save();
    
    // Corrected populate call
    const populatedTask = await savedTask.populate([
      { path: 'createdBy', select: 'name' },
      { path: 'assignedTo', select: 'name email' }
    ]);

    return NextResponse.json(populatedTask, { status: 201 });

  } catch (error: any) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message }, 
      { status: 500 }
    );
  }
}
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
      tasks = await Task.find({ isActive: true })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
    } else {
      tasks = await Task.find({
        isActive: true,
        $or: [
          { assignedTo: { $in: [(decoded as DecodedToken).userId] } },
          { assignedTo: { $size: 0 } }
        ]
      })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
    }

    const tasksWithStatus = tasks.map(task => ({
      ...task.toObject(),
      isOverdue: task.deadline ? new Date(task.deadline) < new Date() : false
    }));

    return NextResponse.json(tasksWithStatus);
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}