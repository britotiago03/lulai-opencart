// src/app/api/build-widget/route.js
import { NextResponse } from 'next/server';
import { buildCustomWidget } from '@/widget/build';

export async function POST(request) {
  try {
    const body = await request.json();
    const { widgetConfig } = body;
    
    // Validate required widget configuration
    if (!widgetConfig) {
      return NextResponse.json(
        { error: 'Widget configuration is required' },
        { status: 400 }
      );
    }
    
    // Build the customized widget
    const result = await buildCustomWidget(widgetConfig);
    
    return NextResponse.json({
      success: true,
      downloadUrl: result.path,
      message: 'Widget built successfully'
    });
  } catch (error) {
    console.error('Error building widget:', error);
    return NextResponse.json(
      { error: 'Failed to build widget', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}