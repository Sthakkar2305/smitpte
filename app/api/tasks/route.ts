import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import User from '@/models/User';
import { verifyToken, getTokenFromHeaders } from '@/utils/auth';
import mongoose from 'mongoose';

interface DecodedToken {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const token = getTokenFromHeaders(request);
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
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
        $or: [
          { assignedTo: (decoded as DecodedToken).userId },
          { assignedTo: { $size: 0 } }
        ],
        isActive: true
      })
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json(tasks);

  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
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
      finalAssignedTo = [];
    } else if (assignedTo && assignedTo.length > 0) {
      finalAssignedTo = assignedTo;
    } else {
      finalAssignedTo = [];
    }

    const task = new Task({
      title,
      type,
      description,
      quantity: quantity || 1,
      deadline: deadline ? new Date(deadline) : null,
      assignedTo: finalAssignedTo,
      createdBy: (decoded as DecodedToken).userId,
      isActive: true
    });

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name');

    return NextResponse.json(task, { status: 201 });

  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}