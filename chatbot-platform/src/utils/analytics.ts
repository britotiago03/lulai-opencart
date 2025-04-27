import { CartOpItem, NavAction, ChatbotStat } from "@/types/analytics";

/* ---------- aggregators (multi‑chatbot) ---------- */
export const aggregateCartOps = (stats: ChatbotStat[]): CartOpItem[] => {
    const map: Record<string, number> = {};
    stats.forEach(b => b.cartOperations?.forEach(o => { map[o.operation] = (map[o.operation] ?? 0) + o.count; }));
    return Object.entries(map).map(([operation, count]) => ({ operation, count }))
        .sort((a, b) => b.count - a.count);
};

export const aggregateNavActions = (stats: ChatbotStat[]): NavAction[] => {
    const map: Record<string, number> = {};
    stats.forEach(b => b.navigationActions?.forEach(a => { map[a.target] = (map[a.target] ?? 0) + a.count; }));
    return Object.entries(map).map(([target, count]) => ({ target, count }))
        .sort((a, b) => b.count - a.count);
};
