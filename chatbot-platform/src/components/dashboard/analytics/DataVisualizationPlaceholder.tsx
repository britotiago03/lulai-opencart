"use client";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Inbox, Info } from "lucide-react";

interface DataVisualizationPlaceholderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'info';
}

export default function DataVisualizationPlaceholder({
  title,
  description,
  icon = <BarChart3 className="h-12 w-12 mb-3 text-gray-600" />,
  variant = 'default'
}: DataVisualizationPlaceholderProps) {
  return (
    <Card className="bg-[#1b2539] border-0">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          {icon}
          <h4 className="text-lg font-medium text-gray-300 mb-2">{variant === 'info' ? "Data Collection in Progress" : "No Data Available Yet"}</h4>
          <p className="text-gray-400 mb-3 max-w-md">{description}</p>
          
          {variant === 'info' && (
            <div className="mt-2 px-4 py-2 bg-blue-900/20 border border-blue-800/50 rounded-md flex items-center text-left">
              <Info className="h-5 w-5 mr-2 text-blue-400 flex-shrink-0" />
              <p className="text-sm text-gray-300">
                This section will automatically update as users interact with your chatbot. Check back soon for valuable insights!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}