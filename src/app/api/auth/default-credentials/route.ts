import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Only provide default credentials in development mode
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Default credentials not available in production' },
        { status: 403 }
      );
    }

    const defaultCredentials = {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123456',
      tokenExpiryHours: parseInt(process.env.JWT_EXPIRES_IN?.replace('h', '') || '1')
    };

    return NextResponse.json({
      credentials: defaultCredentials,
      warning: 'These are default credentials. Please change them in production!'
    });

  } catch (error) {
    console.error('Get default credentials error:', error);
    return NextResponse.json(
      { error: 'Failed to get default credentials' },
      { status: 500 }
    );
  }
}