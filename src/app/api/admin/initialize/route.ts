import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST() {
  try {
    await dbConnect();

    // Check if any admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Admin user already exists', username: existingAdmin.username },
        { status: 200 }
      );
    }

    // Get admin credentials from environment variables
    const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    const adminEmail = `${adminUsername}@tumrabert.com`;

    // Create the admin user
    const adminUser = new User({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword, // Will be hashed automatically by pre-save hook
      role: 'admin',
      isActive: true
    });

    await adminUser.save();

    console.log('✅ Default admin user created successfully');

    return NextResponse.json({
      message: 'Admin user created successfully',
      username: adminUsername,
      email: adminEmail,
      role: 'admin'
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Admin initialization error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Admin user already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to initialize admin user', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();

    // Check admin user status
    const adminCount = await User.countDocuments({ role: 'admin' });
    const totalUsers = await User.countDocuments();

    return NextResponse.json({
      adminUsers: adminCount,
      totalUsers: totalUsers,
      needsInitialization: adminCount === 0
    });

  } catch (error: any) {
    console.error('Admin status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
}