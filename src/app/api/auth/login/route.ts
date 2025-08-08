import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { username, password, rememberMe = false } = body;

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user and verify credentials
    const userModel = User as typeof User & { findByCredentials: (username: string, password: string) => Promise<{ _id: string; username: string; email: string; role: string; toSafeObject: () => object }> };
    const user = await userModel.findByCredentials(username, password);

    // Generate JWT token
    const accessToken = generateToken({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role
    });

    // Create response
    const response = NextResponse.json({
      message: 'Login successful',
      user: user.toSafeObject(),
      accessToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });

    // Set httpOnly cookie for refresh token (if needed later)
    if (rememberMe) {
      response.cookies.set('auth-token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }

    return response;

  } catch (error: unknown) {
    console.error('Login error:', error);

    if (error instanceof Error && error.message === 'Invalid credentials') {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}