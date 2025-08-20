import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Task from '@/models/Task';
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

    if (decoded.role === 'admin') {
      // Admin dashboard stats
      const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
      const activeTasks = await Task.countDocuments({ isActive: true });
      const pendingReviews = await Submission.countDocuments({ status: 'pending' });
      const totalSubmissions = await Submission.countDocuments();
      const approvedSubmissions = await Submission.countDocuments({ status: 'approved' });
      const rejectedSubmissions = await Submission.countDocuments({ status: 'rejected' });

      return NextResponse.json({
        totalStudents,
        activeTasks,
        pendingReviews,
        totalSubmissions,
        approvedSubmissions,
        rejectedSubmissions
      });
    } else {
      // Student dashboard stats
      const assignedTasks = await Task.countDocuments({
        $or: [
          { assignedTo: decoded.userId },
          { assignedTo: { $size: 0 } }
        ],
        isActive: true
      });
      
      const completedTasks = await Submission.countDocuments({ 
        student: decoded.userId,
        status: 'approved'
      });
      
      const pendingTasks = await Submission.countDocuments({ 
        student: decoded.userId,
        status: 'pending'
      });

      const rejectedTasks = await Submission.countDocuments({ 
        student: decoded.userId,
        status: 'rejected'
      });

      return NextResponse.json({
        assignedTasks,
        completedTasks,
        pendingTasks,
        rejectedTasks
      });
    }

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}