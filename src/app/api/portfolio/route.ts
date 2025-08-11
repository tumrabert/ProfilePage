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
    console.log('Received update data:', JSON.stringify(updateData, null, 2));
    
    // Get existing portfolio
    const portfolioModel = Portfolio as typeof Portfolio & { getPortfolio: () => Promise<{ getPublicData: () => object }> };
    const portfolio = await portfolioModel.getPortfolio();
    console.log('Current portfolio found:', !!portfolio);
    
    // Update only provided fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        console.log(`Updating field ${key}:`, updateData[key]);
        (portfolio as Record<string, unknown>)[key] = updateData[key];
      }
    });

    console.log('About to save portfolio with technologies:', (portfolio as any).technologies);
    
    (portfolio as unknown as Record<string, unknown> & { version: number; save: () => Promise<unknown> }).version += 1;
    await (portfolio as unknown as Record<string, unknown> & { save: () => Promise<unknown> }).save();
    
    console.log('Portfolio saved successfully');

    return NextResponse.json({
      success: true,
      message: 'Portfolio updated successfully',
      data: portfolio.getPublicData()
    });

  } catch (error) {
    console.error('Error updating portfolio:', error);
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check for MongoDB validation errors
    if (error && typeof error === 'object' && 'name' in error) {
      if ((error as any).name === 'ValidationError') {
        console.error('MongoDB Validation Error Details:');
        const validationErrors = (error as any).errors;
        
        // Log each validation error in detail
        Object.keys(validationErrors).forEach(field => {
          const fieldError = validationErrors[field];
          console.error(`  Field: ${field}`);
          console.error(`  Error: ${fieldError.message}`);
          console.error(`  Value: ${JSON.stringify(fieldError.value)}`);
        });
        
        return NextResponse.json(
          { 
            error: 'Validation failed', 
            details: validationErrors,
            message: (error as any).message,
            fields: Object.keys(validationErrors)
          },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update portfolio',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}