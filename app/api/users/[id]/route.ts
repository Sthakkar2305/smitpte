import { NextResponse } from 'next/server';
import { JwtPayload } from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyToken, getTokenFromHeaders } from '@/utils/auth';

interface Params {
  id: string;
}

interface RequestBody {
  isActive: boolean;
}

export async function PATCH(
  request: Request,
  { params }: { params: Params }
) {
  try {
    await connectDB();

    const token = getTokenFromHeaders(request);
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token) as JwtPayload | string;

    // Narrow type and check role
    if (typeof decoded === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    if (!decoded.role || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;

    const body = (await request.json()) as RequestBody;
    const { isActive } = body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
