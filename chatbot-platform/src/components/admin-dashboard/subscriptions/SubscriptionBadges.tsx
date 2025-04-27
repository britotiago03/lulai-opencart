// src/components/subscriptions/SubscriptionBadges.tsx
import { Badge } from "@/components/ui/badge";
import { AdminSubscription } from "@/types/subscription";

export function StatusBadge({ status }: { status: AdminSubscription['status'] }) {
    switch (status) {
        case 'active':
            return <Badge className="bg-green-500/20 text-green-500">Active</Badge>;
        case 'cancelled':
            return <Badge className="bg-amber-500/20 text-amber-500">Cancelled</Badge>;
        case 'expired':
            return <Badge className="bg-gray-500/20 text-gray-400">Expired</Badge>;
        default:
            return <Badge>{status}</Badge>;
    }
}

export function PlanBadge({ plan }: { plan: AdminSubscription['plan_type'] }) {
    switch (plan) {
        case 'free':
            return <Badge className="bg-gray-500/20 text-gray-400">Free</Badge>;
        case 'basic':
            return <Badge className="bg-blue-500/20 text-blue-500">Basic</Badge>;
        case 'pro':
            return <Badge className="bg-purple-500/20 text-purple-500">Pro</Badge>;
        default:
            return <Badge>{plan}</Badge>;
    }
}