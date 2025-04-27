"use client";
import { Card, CardContent } from "@/components/ui/card";

export default function TopQueries({
                                       list
                                   }: { list: { message_content: string; count: number }[] | undefined }) {
    return (
        <Card className="bg-[#1b2539] border-0 mb-6">
            <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4">Top User Queries</h3>
                {list && list.length ? (
                    <div className="space-y-3">
                        {list.map((q,i)=>(
                            <div key={i} className="flex justify-between items-center p-2 bg-[#232b3c] rounded-md">
                                <span className="truncate max-w-[80%]">{q.message_content}</span>
                                <span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full text-xs">{q.count}</span>
                            </div>
                        ))}
                    </div>
                ) : <div className="text-gray-500 text-center py-8">No query data available</div>}
            </CardContent>
        </Card>
    );
}
