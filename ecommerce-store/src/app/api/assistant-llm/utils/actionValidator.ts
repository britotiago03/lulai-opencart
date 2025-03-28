import { Action, UnvalidatedAction } from '../types';

/**
 * Validate and normalize action object from LLM response
 * @param action - The unvalidated action from LLM
 * @returns A validated action object or null if invalid
 */
export function validateAndNormalizeAction(action: UnvalidatedAction): Action {
    if (!action || typeof action !== 'object') {
        return null;
    }

    if (action.type === 'navigate' && typeof action.path === 'string') {
        // Ensure path starts with /
        const path = action.path.startsWith('/') ? action.path : `/${action.path}`;
        return { type: 'navigate', path };
    }

    if (action.type === 'search' && typeof action.query === 'string') {
        return { type: 'search', query: action.query };
    }

    return null;
}