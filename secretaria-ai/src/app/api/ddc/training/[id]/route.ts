import { NextRequest, NextResponse } from 'next/server';
import type { TrainingPrompt } from '@/types/ddc';
import { mockTrainingPrompts } from '@/lib/ddc/mock-data';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: trainingId } = await context.params;
    const body = await request.json();

    const trainingIndex = mockTrainingPrompts.findIndex(t => t.id === trainingId);

    if (trainingIndex === -1) {
      return NextResponse.json({
        success: false,
        error: {
          code: '404',
          message: 'Training not found'
        }
      }, { status: 404 });
    }

    // Update training
    const updatedTraining: TrainingPrompt = {
      ...mockTrainingPrompts[trainingIndex],
      ...body,
      updatedAt: new Date()
    };

    mockTrainingPrompts[trainingIndex] = updatedTraining;

    return NextResponse.json({
      success: true,
      data: updatedTraining
    });
  } catch (error) {
    console.error('Error updating training:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: '500',
        message: 'Failed to update training',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: trainingId } = await context.params;
    const trainingIndex = mockTrainingPrompts.findIndex(t => t.id === trainingId);

    if (trainingIndex === -1) {
      return NextResponse.json({
        success: false,
        error: {
          code: '404',
          message: 'Training not found'
        }
      }, { status: 404 });
    }

    mockTrainingPrompts.splice(trainingIndex, 1);

    return NextResponse.json({
      success: true,
      data: null
    });
  } catch (error) {
    console.error('Error deleting training:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: '500',
        message: 'Failed to delete training',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: trainingId } = await context.params;
    const training = mockTrainingPrompts.find(t => t.id === trainingId);

    if (!training) {
      return NextResponse.json({
        success: false,
        error: {
          code: '404',
          message: 'Training not found'
        }
      }, { status: 404 });
    }

    // Simulate test
    await new Promise(resolve => setTimeout(resolve, 1500));

    const score = Math.floor(Math.random() * 20) + 80;
    const passed = score >= 85;

    const testResult = {
      status: passed ? 'passed' : 'failed' as 'passed' | 'failed',
      score,
      feedback: passed
        ? 'A IA respondeu corretamente e com alta confiança. O prompt está bem estruturado.'
        : 'A IA não conseguiu responder adequadamente. Considere revisar o conteúdo do prompt.'
    };

    // Update training with test result
    training.testResult = testResult;
    training.updatedAt = new Date();

    return NextResponse.json({
      success: true,
      data: testResult
    });
  } catch (error) {
    console.error('Error testing training:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: '500',
        message: 'Failed to test training',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}