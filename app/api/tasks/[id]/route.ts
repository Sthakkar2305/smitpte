import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import { verifyToken, getTokenFromHeaders } from '@/utils/auth';
import mongoose from 'mongoose';

interface DecodedToken {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(
  request: NextRequest, 
  context: RouteContext
): Promise<NextResponse> {
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

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ message: 'Task ID is required' }, { status: 400 });
    }

    const { title, type, description, quantity, deadline, assignedTo, assignToAll } = await request.json();

    if (!title || !type || !description) {
      return NextResponse.json({ message: 'Title, type, and description are required' }, { status: 400 });
    }

    let finalAssignedTo: string[] = [];
    if (assignToAll) {
      finalAssignedTo = [];
    } else if (assignedTo && assignedTo.length > 0) {
      finalAssignedTo = assignedTo;
    } else {
      finalAssignedTo = [];
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        title,
        type,
        description,
        quantity: quantity || 1,
        deadline: deadline ? new Date(deadline) : null,
        assignedTo: finalAssignedTo,
      },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');

    if (!updatedTask) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTask);

  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest, 
  context: RouteContext
): Promise<NextResponse> {
  try {
    await connectDB();

    const token = getTokenFromHeaders(request);
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string' || (decoded as DecodedToken).role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await context.params;
    if (!id) return NextResponse.json({ message: 'Task ID is required' }, { status: 400 });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid Task ID format' }, { status: 400 });
    }

    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    await Task.findByIdAndUpdate(id, { isActive: false });

    return NextResponse.json({ message: 'Task deleted successfully' });

  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}