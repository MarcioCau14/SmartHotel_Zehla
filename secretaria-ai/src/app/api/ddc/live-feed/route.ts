import { NextRequest } from 'next/server';
import { mockConversationLogs } from '@/lib/ddc/mock-data';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      let index = 0;

      // Send initial data
      const initialData = {
        type: 'initial',
        data: mockConversationLogs
      };
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`)
      );

      // Simulate live updates
      const interval = setInterval(() => {
        // Simulate a new conversation or message
        if (Math.random() > 0.7) {
          const randomConversation = mockConversationLogs[Math.floor(Math.random() * mockConversationLogs.length)];

          // Create a new message
          const newMessage = {
            id: `msg-${Date.now()}`,
            conversationId: randomConversation.id,
            role: Math.random() > 0.5 ? 'user' : 'assistant',
            content: Math.random() > 0.5
              ? 'Qual o horário do check-in?'
              : `O check-in é às 14:00 e o check-out às 12:00.`,
            confidence: Math.floor(Math.random() * 20) + 80,
            metadata: {},
            createdAt: new Date()
          };

          // Update the conversation
          const updatedConversation = {
            ...randomConversation,
            messages: [...randomConversation.messages, newMessage],
            updatedAt: new Date(),
            aiScore: Math.floor(Math.random() * 15) + 85
          };

          const data = {
            type: 'update',
            data: updatedConversation
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );

          // Dispatch custom event for client-side updates
          // Note: This won't work server-side, but shows the intent
          console.log('New message dispatched:', newMessage.content);
        }

        index++;

        // Stop after 5 minutes for demo purposes
        if (index > 300) {
          clearInterval(interval);
          controller.close();
        }
      }, 3000); // Check every 3 seconds

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}