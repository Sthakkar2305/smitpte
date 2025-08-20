import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Material from '@/models/Material';
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

    const materials = await Material.find({ isActive: true })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(materials);

  } catch (error) {
    console.error('Get materials error:', error);
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

    const { title, type, language, description, content, files } = await request.json();

    if (!title || !type) {
      return NextResponse.json(
        { message: 'Title and type are required' },
        { status: 400 }
      );
    }

    const material = new Material({
      title,
      type,
      language: language || 'english',
      description,
      content,
      files: files || [],
      uploadedBy: decoded.userId
    });

    await material.save();
    await material.populate('uploadedBy', 'name');

    return NextResponse.json(material, { status: 201 });

  } catch (error) {
    console.error('Create material error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}