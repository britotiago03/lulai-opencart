import { NextRequest, NextResponse } from 'next/server';

// Define event data types
export interface OrderEventData {
    id: string;
    status: string;
    customer: {
        name: string;
        email: string;
    };
    total: number;
    date?: string;
    updatedAt?: string;
    previousStatus?: string | null;
}

export interface UserEventData {
    id: string;
    name: string;
    email: string;
    role: string;
    date: string;
}

export interface ProductEventData {
    id: string;
    name: string;
    price: number;
    stock: number;
    updatedAt: string;
}

export interface ConnectionEventData {
    status: string;
}

export interface PingEventData {
    time: string;
}

// Union type for all possible event data types
export type EventData =
    | OrderEventData
    | UserEventData
    | ProductEventData
    | ConnectionEventData
    | PingEventData;

// Store for connected clients - at module level to persist between requests
const clients = new Set<ReadableStreamController<Uint8Array>>();

// Send ping events to all clients every 30 seconds to keep connections alive
let pingInterval: NodeJS.Timeout | null = null;

const startPingInterval = () => {
    if (pingInterval) clearInterval(pingInterval);

    pingInterval = setInterval(() => {
        if (clients.size > 0) {
            const pingData: PingEventData = { time: new Date().toISOString() };
            sendEventToAll('ping', pingData);
        }
    }, 30000); // 30 seconds
};

// Start the ping interval when the module is loaded
startPingInterval();

// Helper to send events to all connected clients with better error handling
export const sendEventToAll = <T extends EventData>(event: string, data: T): void => {
    // Log more details about the event
    console.log(`[SSE] Preparing to send ${event} event to ${clients.size} clients`);

    if (clients.size === 0) {
        console.warn(`[SSE] No clients connected to receive ${event} event`);
        return;
    }

    const eventString = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    const encoder = new TextEncoder();
    const encodedEvent = encoder.encode(eventString);

    let successCount = 0;
    const failedClients = new Set<ReadableStreamController<Uint8Array>>();

    clients.forEach(client => {
        try {
            client.enqueue(encodedEvent);
            successCount++;
        } catch (err) {
            console.error('[SSE] Failed to send event to client:', err);
            failedClients.add(client);
        }
    });

    // Remove failed clients
    failedClients.forEach(client => {
        clients.delete(client);
    });

    console.log(`[SSE] Event delivery results: ${successCount} successful, ${failedClients.size} failed, ${clients.size} remaining`);

    // If no successful sends but clients exist, log a warning
    if (successCount === 0 && clients.size > 0) {
        console.warn('[SSE] Failed to send event to any clients despite having connections');
    }
};

export async function GET(request: NextRequest) {
    const origin = request.headers.get('origin') || '';

    // Log more details about the connection
    console.log(`[SSE] New client connecting from ${origin}, current clients: ${clients.size}`);

    // Create a new stream with robust error handling
    const stream = new ReadableStream({
        start(controller) {
            try {
                clients.add(controller);
                console.log(`[SSE] Client connected successfully, total connections: ${clients.size}`);

                // Immediately send a ping to test the connection
                const pingEvent = `event: ping\ndata: {"time":"${new Date().toISOString()}"}\n\n`;
                controller.enqueue(new TextEncoder().encode(pingEvent));

                // Then send the connection event
                const connectEvent = `event: connected\ndata: {"status":"connected"}\n\n`;
                controller.enqueue(new TextEncoder().encode(connectEvent));

                // Set up cleanup with error handling
                request.signal.addEventListener('abort', () => {
                    try {
                        clients.delete(controller);
                        console.log(`[SSE] Client disconnected, remaining connections: ${clients.size}`);
                    } catch (err) {
                        console.error('[SSE] Error during client cleanup:', err);
                    }
                });
            } catch (err) {
                console.error('[SSE] Error during SSE controller setup:', err);
            }
        }
    });

    // Return the stream with proper headers
    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}