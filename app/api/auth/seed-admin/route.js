import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/utils/auth';

export async function POST(request) {
  try {
    await connectDB();
    
    // Check if default admin already exists
    const existingAdmin = await User.findOne({ email: 'smit@gmail.com' });
    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Default admin already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword('123456789');
    
    const defaultAdmin = new User({
      name: 'Smit (Default Admin)',
      email: 'smit@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });

    await defaultAdmin.save();

    return NextResponse.json({
      message: 'Default admin created successfully',
      admin: {
        name: defaultAdmin.name,
        email: defaultAdmin.email,
        role: defaultAdmin.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Seed admin error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}