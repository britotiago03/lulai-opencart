import { Action, UnvalidatedAction } from '../types';

/**
 * Validate and normalize action object from LLM response
 * @param action - The unvalidated action from LLM
 * @returns A validated action object or undefined if invalid
 */
export function validateAndNormalizeAction(action: UnvalidatedAction): Action | undefined {
    if (!action || typeof action !== 'object') {
        return undefined;
    }

    if (action.type === 'navigate' && typeof action.path === 'string') {
        // Ensure path starts with /
        const path = action.path.startsWith('/') ? action.path : `/${action.path}`;
        return { type: 'navigate', path };
    }

    if (action.type === 'search' && typeof action.query === 'string') {
        return { type: 'search', query: action.query };
    }

    if (action.type === 'cart' &&
        typeof action.operation === 'string' &&
        ['add', 'remove', 'update'].includes(action.operation) &&
        typeof action.productId === 'number') {

        // For add and update operations, quantity is required
        if ((action.operation === 'add' || action.operation === 'update') &&
            (typeof action.quantity !== 'number' || action.quantity < 1)) {
            console.error('Cart action requires valid quantity');
            return undefined;
        }

        return {
            type: 'cart',
            operation: action.operation as 'add' | 'remove' | 'update',
            productId: action.productId,
            quantity: action.quantity
        };
    }

    return undefined;
}