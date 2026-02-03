export type PaymentStatus = 
    | 'success'
    | 'cancelled'
    | 'declined'
    | 'pending'
    | 'technical_error'
    | 'configuration_error'
    | 'unknown';

interface PaymentResult {
    status: PaymentStatus;
    title: string;
    message: string;
    canRetry: boolean;
    nextAction?: 'retry' | 'contact_bank' | 'contact_support' | 'wait' | 'use_another_card';
    responseCode?: string;
    acquirerResponseCode?: string;
    transactionReference?: string;
    customerId?: string;
    orderId?: string;
    createdAt: number;
}

const results = new Map<string, PaymentResult>();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export function storePaymentResult(token: string, result: Omit<PaymentResult, 'createdAt'>): void {
    results.set(token, {
        ...result,
        createdAt: Date.now(),
    });

    // Cleanup expired entries periodically
    if (results.size % 100 === 0) {
        const now = Date.now();
        for (const [key, value] of results.entries()) {
            if (now - value.createdAt > TTL_MS) {
                results.delete(key);
            }
        }
    }
}

export function getPaymentResult(token: string): PaymentResult | null {
    const result = results.get(token);
    if (!result) return null;

    // Check expiration
    if (Date.now() - result.createdAt > TTL_MS) {
        results.delete(token);
        return null;
    }

    return result;
}

export function deletePaymentResult(token: string): void {
    results.delete(token);
}
