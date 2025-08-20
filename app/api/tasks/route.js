import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import User from '@/models/User';
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

    let tasks;
    if (decoded.role === 'admin') {
      tasks = await Task.find({ isActive: true })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
    } else {
      // For students, find tasks where they are specifically assigned OR tasks assigned to all students
      tasks = await Task.find({ 
        $or: [
          { assignedTo: decoded.userId },
          { assignedTo: { $size: 0 } } // Tasks with empty assignedTo array are for all students
        ],
        isActive: true 
      })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    }

    return NextResponse.json(tasks);

  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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

    const { title, type, description, quantity, deadline, assignedTo, assignToAll } = await request.json();

    if (!title || !type || !description) {
      return NextResponse.json(
        { message: 'Title, type, and description are required' },
        { status: 400 }
      );
    }

    let finalAssignedTo = [];
    
    if (assignToAll) {
      // If assign to all, get all active students
      const allStudents = await User.find({ role: 'student', isActive: true }).select('_id');
      finalAssignedTo = allStudents.map(student => student._id);
    } else if (assignedTo && assignedTo.length > 0) {
      finalAssignedTo = assignedTo;
    }

    const task = new Task({
      title,
      type,
      description,
      quantity: quantity || 1,
      deadline: deadline ? new Date(deadline) : null,
      assignedTo: finalAssignedTo,
      createdBy: decoded.userId
    });

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name');

    return NextResponse.json(task, { status: 201 });

  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}