interface OrderContext {
    orderId: string;
    customer: {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
    };
    shippingAddress: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    billingAddress?: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    items: Array<{
        id: string;
        title: string;
        quantity: number;
        priceValue: number;
    }>;
    totals: {
        subtotal: number;
        shipping: number;
        donation?: number;
        tax: number;
        total: number;
    };
    createdAt: number;
}

const contexts = new Map<string, OrderContext>();
const TTL_MS = 30 * 60 * 1000; // 30 minutes

export function storeOrderContext(orderId: string, context: Omit<OrderContext, 'createdAt'>): void {
    contexts.set(orderId, {
        ...context,
        createdAt: Date.now(),
    });

    // Cleanup expired entries periodically
    if (contexts.size % 50 === 0) {
        const now = Date.now();
        for (const [key, value] of contexts.entries()) {
            if (now - value.createdAt > TTL_MS) {
                contexts.delete(key);
            }
        }
    }
}

export function getOrderContext(orderId: string): OrderContext | null {
    const context = contexts.get(orderId);
    if (!context) return null;

    // Check expiration
    if (Date.now() - context.createdAt > TTL_MS) {
        contexts.delete(orderId);
        return null;
    }

    return context;
}

export function deleteOrderContext(orderId: string): void {
    contexts.delete(orderId);
}
