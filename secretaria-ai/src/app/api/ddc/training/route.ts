import { NextRequest, NextResponse } from 'next/server';
import type { TrainingPrompt } from '@/types/ddc';
import { mockTrainingPrompts } from '@/lib/ddc/mock-data';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: mockTrainingPrompts
    });
  } catch (error) {
    console.error('Error fetching trainings:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: '500',
        message: 'Failed to fetch trainings',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.content || !body.category) {
      return NextResponse.json({
        success: false,
        error: {
          code: '400',
          message: 'Missing required fields: title, content, category'
        }
      }, { status: 400 });
    }

    // Create new training
    const newTraining: TrainingPrompt = {
      id: `training-${Date.now()}`,
      title: body.title,
      content: body.content,
      category: body.category,
      version: body.version || 1,
      isActive: body.isActive !== undefined ? body.isActive : true,
      testResult: body.testResult,
      propertyId: body.propertyId || 'prop-001',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // In a real implementation, this would save to database
    mockTrainingPrompts.unshift(newTraining);

    return NextResponse.json({
      success: true,
      data: newTraining
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating training:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: '500',
        message: 'Failed to create training',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}