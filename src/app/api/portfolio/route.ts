import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Portfolio from '@/models/Portfolio';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';

// GET - Fetch portfolio data
export async function GET() {
  try {
    await dbConnect();
    
    const portfolioModel = Portfolio as typeof Portfolio & { getPortfolio: () => Promise<{ getPublicData: () => object }> };
    const portfolio = await portfolioModel.getPortfolio();
    const publicData = portfolio.getPublicData();

    return NextResponse.json({
      success: true,
      data: publicData
    });

  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}

// PUT - Update portfolio data (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromRequest(authHeader || undefined);

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    const updateData = await request.json();
    
    // Get existing portfolio
    const portfolioModel = Portfolio as typeof Portfolio & { getPortfolio: () => Promise<{ getPublicData: () => object }> };
    const portfolio = await portfolioModel.getPortfolio();
    
    // Update only provided fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        (portfolio as Record<string, unknown>)[key] = updateData[key];
      }
    });

    (portfolio as unknown as Record<string, unknown> & { version: number; save: () => Promise<unknown> }).version += 1;
    await (portfolio as unknown as Record<string, unknown> & { save: () => Promise<unknown> }).save();

    return NextResponse.json({
      success: true,
      message: 'Portfolio updated successfully',
      data: portfolio.getPublicData()
    });

  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio' },
      { status: 500 }
    );
  }
}