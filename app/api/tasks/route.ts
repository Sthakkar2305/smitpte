import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import User from '@/models/User';
import { verifyToken, getTokenFromHeaders } from '@/utils/auth';

// Define the interface for your decoded JWT token
interface DecodedToken {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function GET(request: Request) {
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

    // Type assertion to ensure decoded has the expected structure
    const decodedToken = decoded as DecodedToken;

    let tasks;
    if (decodedToken.role === 'admin') {
      tasks = await Task.find({ isActive: true })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
    } else {
      // For students, find tasks where they are specifically assigned OR tasks assigned to all students
      tasks = await Task.find({ 
        $or: [
          { assignedTo: decodedToken.userId },
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

export async function POST(request: Request) {
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

    const decodedToken = decoded as DecodedToken;
    const { title, type, description, quantity, deadline, assignedTo, assignToAll } = await request.json();

    if (!title || !type || !description) {
      return NextResponse.json(
        { message: 'Title, type, and description are required' },
        { status: 400 }
      );
    }

    let finalAssignedTo = [];
    
    if (assignToAll) {
      // If assign to all, leave assignedTo empty to indicate it's for all students
      finalAssignedTo = [];
    } else if (assignedTo && assignedTo.length > 0) {
      finalAssignedTo = assignedTo;
    } else {
      // If neither assignToAll is true nor specific students are selected, assign to all
      finalAssignedTo = [];
    }

    const task = new Task({
      title,
      type,
      description,
      quantity: quantity || 1,
      deadline: deadline ? new Date(deadline) : null,
      assignedTo: finalAssignedTo,
      createdBy: decodedToken.userId
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

export async function PUT(request: Request) {
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

    const url = new URL(request.url);
    const taskId = url.pathname.split('/').pop();
    
    if (!taskId) {
      return NextResponse.json({ message: 'Task ID is required' }, { status: 400 });
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
      // If assign to all, leave assignedTo empty to indicate it's for all students
      finalAssignedTo = [];
    } else if (assignedTo && assignedTo.length > 0) {
      finalAssignedTo = assignedTo;
    } else {
      // If neither assignToAll is true nor specific students are selected, assign to all
      finalAssignedTo = [];
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        title,
        type,
        description,
        quantity: quantity || 1,
        deadline: deadline ? new Date(deadline) : null,
        assignedTo: finalAssignedTo,
      },
      { new: true }
    ).populate('assignedTo', 'name email').populate('createdBy', 'name');

    if (!updatedTask) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTask);

  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    const url = new URL(request.url);
    const taskId = url.pathname.split('/').pop();
    
    if (!taskId) {
      return NextResponse.json({ message: 'Task ID is required' }, { status: 400 });
    }

    // Soft delete by setting isActive to false
    const deletedTask = await Task.findByIdAndUpdate(
      taskId,
      { isActive: false },
      { new: true }
    );

    if (!deletedTask) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' });

  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}