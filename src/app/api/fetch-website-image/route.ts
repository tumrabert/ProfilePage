import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Website screenshot API called');
    const { url } = await request.json();
    console.log('Requested URL:', url);

    if (!url) {
      console.log('No URL provided');
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Get API key from environment
    const apiKey = process.env.THUMBNAIL_API;
    if (!apiKey) {
      console.log('No THUMBNAIL_API key found in environment');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Validate URL format
    let validUrl: string;
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      validUrl = urlObj.toString();
      console.log('Validated URL:', validUrl);
    } catch (error) {
      console.log('Invalid URL format:', error);
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Extract domain for fallback
    const domain = new URL(validUrl).hostname;
    const simplifiedDomain = domain.replace('www.', '');
    
    // Primary service: thumbnail.ws with API key
    const primaryService = `https://api.thumbnail.ws/api/${apiKey}/thumbnail/get?url=${encodeURIComponent(validUrl)}&width=1200&height=800`;
    
    // Fallback services (free alternatives)
    const fallbackServices = [
      // Service 1: PagePeeker (most reliable free service)
      `https://free.pagepeeker.com/v2/thumbs.php?size=l&url=${encodeURIComponent(validUrl)}`,
      
      // Service 2: Simple screenshot service
      `https://image.thum.io/get/width/1200/crop/800/${encodeURIComponent(validUrl)}`,
      
      // Service 3: Screenshotapi (free demo)
      `https://api.screenshotapi.net/screenshot?token=demo&url=${encodeURIComponent(validUrl)}&width=1200&height=800&file_type=png&fresh=true`
    ];

    // Try primary service first
    try {
      console.log('Trying primary service: thumbnail.ws');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for primary service
      
      const response = await fetch(primaryService, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      clearTimeout(timeoutId);

      if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
        console.log('Primary service (thumbnail.ws) successful!');
        return NextResponse.json({ 
          imageUrl: primaryService,
          websiteTitle: `Screenshot: ${simplifiedDomain}`,
          websiteDescription: `Live screenshot from ${validUrl}`,
          isScreenshot: true,
          service: 'thumbnail.ws',
          originalUrl: validUrl
        });
      }
      
      console.log('Primary service failed:', response.status, response.statusText);
    } catch (error) {
      console.log('Primary service error:', error);
    }

    // Try fallback services
    console.log('Trying fallback services...');
    for (const serviceUrl of fallbackServices) {
      try {
        console.log('Trying fallback service:', serviceUrl.split('?')[0]);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout per service
        
        const response = await fetch(serviceUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        clearTimeout(timeoutId);

        if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
          console.log('Fallback service successful!');
          return NextResponse.json({ 
            imageUrl: serviceUrl,
            websiteTitle: `Screenshot: ${simplifiedDomain}`,
            websiteDescription: `Live screenshot from ${validUrl}`,
            isScreenshot: true,
            service: 'fallback',
            originalUrl: validUrl
          });
        }
        
        console.log('Fallback service failed:', response.status);
      } catch (error) {
        console.log('Fallback service error:', error);
        continue; // Try next service
      }
    }

    // If all services fail, use fallback placeholder images
    console.log('All screenshot services failed, using fallback');
    
    const fallbackOptions = [
      // Option 1: Placeholder with website info
      `https://via.placeholder.com/1200x800/2d3748/ffffff.png?text=${encodeURIComponent(`${simplifiedDomain}\n\nWebsite Preview\n\n(Real screenshot not available)`)}`,
      
      // Option 2: Different placeholder service
      `https://dummyimage.com/1200x800/2d3748/ffffff&text=${encodeURIComponent(simplifiedDomain)}`,
      
      // Option 3: Shields badge
      `https://img.shields.io/badge/${encodeURIComponent(simplifiedDomain)}-Website_Preview-4a90e2?style=for-the-badge&labelColor=2d3748&logoColor=white&logo=internetexplorer`,
    ];
    
    return NextResponse.json({ 
      imageUrl: fallbackOptions[0],
      fallbackUrls: fallbackOptions.slice(1),
      websiteTitle: `Preview: ${simplifiedDomain}`,
      websiteDescription: `Placeholder for ${validUrl} (screenshot services unavailable)`,
      isScreenshot: false,
      isPreview: true,
      originalUrl: validUrl
    });

  } catch (error) {
    console.error('Error generating website preview:', error);
    
    let errorMessage = 'Failed to generate website preview';
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}