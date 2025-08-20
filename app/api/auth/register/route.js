import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { hashPassword, generateToken, verifyToken, getTokenFromHeaders } from '@/utils/auth';

export async function POST(request) {
  try {
    await connectDB();
    
    const { name, email, password, role = 'student' } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // If trying to create an admin account, verify the requester is an admin
    if (role === 'admin') {
      const token = getTokenFromHeaders(request);
      if (!token) {
        return NextResponse.json(
          { message: 'Only existing admins can create teacher accounts' },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);
      if (!decoded || decoded.role !== 'admin') {
        return NextResponse.json(
          { message: 'Only existing admins can create teacher accounts' },
          { status: 403 }
        );
      }
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'student' // Ensure only student or admin
    });

    await user.save();

    // Only return token for student registration (public registration)
    // Admin creation doesn't return token as it's done by existing admin
    if (role === 'student') {
      const token = generateToken(user._id, user.role);
      return NextResponse.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }, { status: 201 });
    }

    // For admin creation, just return success message
    return NextResponse.json({
      message: 'Teacher account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}