import { useState, useEffect, useRef } from 'react';
import { OrderEventData, ProductEventData, UserEventData } from '@/app/api/events/route';

export type AdminEventType = 'new-order' | 'order-updated' | 'new-user' | 'product-updated';

export interface AdminEvent {
    type: AdminEventType;
    data: OrderEventData | UserEventData | ProductEventData;
}

export interface UseAdminEventsProps {
    onNewOrder?: (orderData: OrderEventData) => void;
    onOrderUpdated?: (orderData: OrderEventData) => void;
    onNewUser?: (userData: UserEventData) => void;
    onProductUpdated?: (productData: ProductEventData) => void;
}

export function useAdminEvents({
                                   onNewOrder,
                                   onOrderUpdated,
                                   onNewUser,
                                   onProductUpdated
                               }: UseAdminEventsProps = {}) {
    const [connected, setConnected] = useState(false);
    const [lastEvent, setLastEvent] = useState<AdminEvent | null>(null);
    const [error, setError] = useState<string | null>(null);
    const retryCountRef = useRef(0);

    useEffect(() => {
        // Flag to track if component is mounted
        let isMounted = true;
        let eventSource: EventSource | null = null;
        let retryTimeout: NodeJS.Timeout | null = null;

        const connectToEventSource = () => {
            if (!isMounted) return;

            if (eventSource) {
                try {
                    eventSource.close();
                } catch (err) {
                    console.error('Error closing event source:', err);
                }
            }

            try {
                console.log('[AdminEvents] Creating new SSE connection');
                eventSource = new EventSource('/api/events');

                eventSource.onopen = () => {
                    if (!isMounted) return;
                    console.log('[AdminEvents] SSE connection established');
                    setConnected(true);
                    setError(null);
                    retryCountRef.current = 0; // Reset retry counter on successful connection
                };

                eventSource.onerror = (err) => {
                    if (!isMounted) return;
                    console.error('[AdminEvents] SSE connection error:', err);
                    setConnected(false);
                    setError('Connection to server lost. Attempting to reconnect...');

                    // Close the current connection
                    if (eventSource) {
                        try {
                            eventSource.close();
                        } catch (closeErr) {
                            console.error('Error closing event source:', closeErr);
                        }
                        eventSource = null;
                    }

                    // Try to reconnect after a delay with incremental backoff
                    if (retryTimeout) clearTimeout(retryTimeout);
                    retryCountRef.current++;
                    const delay = Math.min(5000 * Math.pow(1.5, retryCountRef.current - 1), 30000); // Exponential backoff capped at 30s
                    console.log(`[AdminEvents] Attempting reconnection in ${delay/1000}s (attempt ${retryCountRef.current})`);
                    retryTimeout = setTimeout(connectToEventSource, delay);
                };

                // Connected event handler
                eventSource.addEventListener('connected', () => {
                    if (!isMounted) return;
                    console.log('[AdminEvents] SSE connected event received');
                    setConnected(true);
                });

                // Ping event handler to keep connection alive
                eventSource.addEventListener('ping', () => {
                    if (!isMounted) return;
                    console.log('[AdminEvents] Ping received from server');
                    // Don't need to do anything with this event, just keeping the connection alive
                });

                // New order event handler
                eventSource.addEventListener('new-order', (e: MessageEvent) => {
                    if (!isMounted) return;
                    console.log('[AdminEvents] New order event received:', e.data);
                    try {
                        const orderData = JSON.parse(e.data) as OrderEventData;
                        setLastEvent({ type: 'new-order', data: orderData });

                        if (onNewOrder) {
                            onNewOrder(orderData);
                        }
                    } catch (err) {
                        console.error('[AdminEvents] Error parsing new-order event:', err);
                    }
                });

                // Order updated event handler
                eventSource.addEventListener('order-updated', (e: MessageEvent) => {
                    if (!isMounted) return;
                    console.log('[AdminEvents] Order updated event received:', e.data);
                    try {
                        const orderData = JSON.parse(e.data) as OrderEventData;
                        setLastEvent({ type: 'order-updated', data: orderData });

                        if (onOrderUpdated) {
                            onOrderUpdated(orderData);
                        }
                    } catch (err) {
                        console.error('[AdminEvents] Error parsing order-updated event:', err);
                    }
                });

                // New user event handler
                eventSource.addEventListener('new-user', (e: MessageEvent) => {
                    if (!isMounted) return;
                    console.log('[AdminEvents] New user event received:', e.data);
                    try {
                        const userData = JSON.parse(e.data) as UserEventData;
                        setLastEvent({ type: 'new-user', data: userData });

                        if (onNewUser) {
                            onNewUser(userData);
                        }
                    } catch (err) {
                        console.error('[AdminEvents] Error parsing new-user event:', err);
                    }
                });

                // Product updated event handler
                eventSource.addEventListener('product-updated', (e: MessageEvent) => {
                    if (!isMounted) return;
                    console.log('[AdminEvents] Product updated event received:', e.data);
                    try {
                        const productData = JSON.parse(e.data) as ProductEventData;
                        setLastEvent({ type: 'product-updated', data: productData });

                        if (onProductUpdated) {
                            onProductUpdated(productData);
                        }
                    } catch (err) {
                        console.error('[AdminEvents] Error parsing product-updated event:', err);
                    }
                });
            } catch (err) {
                if (!isMounted) return;
                console.error('[AdminEvents] Failed to create EventSource:', err);
                setError('Failed to connect to server. Retrying...');

                // Try to reconnect after a delay
                if (retryTimeout) clearTimeout(retryTimeout);
                retryCountRef.current++;
                const delay = Math.min(5000 * Math.pow(1.5, retryCountRef.current - 1), 30000);
                retryTimeout = setTimeout(connectToEventSource, delay);
            }
        };

        // Connect to the event source
        connectToEventSource();

        // Cleanup function
        return () => {
            console.log('[AdminEvents] Cleaning up component...');
            isMounted = false;

            if (retryTimeout) {
                clearTimeout(retryTimeout);
            }

            if (eventSource) {
                console.log('[AdminEvents] Closing SSE connection');
                try {
                    eventSource.close();
                } catch (err) {
                    console.error('Error closing event source:', err);
                }
                eventSource = null;
            }
        };
    }, [onNewOrder, onOrderUpdated, onNewUser, onProductUpdated]);

    return {
        connected,
        lastEvent,
        error,
    };
}