import { CartOpItem, NavAction, ChatbotStat, ProductItem } from "@/types/analytics";

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

// New: Aggregator for top products across multiple chatbots
export const aggregateTopProducts = (stats: ChatbotStat[]): ProductItem[] => {
    const map: Record<string, {count: number, product_id?: string | number}> = {};
    
    stats.forEach(b => 
        b.topProducts?.forEach(p => { 
            const key = p.product_name;
            if (!map[key]) {
                map[key] = { count: 0, product_id: p.product_id };
            }
            map[key].count += p.count;
        })
    );
    
    return Object.entries(map)
        .map(([product_name, data]) => ({ 
            product_name, 
            product_id: data.product_id,
            count: data.count 
        }))
        .sort((a, b) => b.count - a.count);
};
