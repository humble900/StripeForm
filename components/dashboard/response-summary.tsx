import { ArrowDown, ArrowUp, BarChart, Clock, CheckCircle } from "lucide-react";

interface ResponseSummaryProps {
  totalResponses: number;
  completionRate: number;
  avgCompletionTime: string;
}

const ResponseSummary = ({ 
  totalResponses, 
  completionRate, 
  avgCompletionTime 
}: ResponseSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <BarChart className="h-4 w-4 text-primary" />
          <div className="text-neutral-700 text-sm font-medium">Total Responses</div>
        </div>
        <div className="text-2xl font-semibold text-neutral-900">{totalResponses}</div>
      </div>
      
      <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-primary" />
          <div className="text-neutral-700 text-sm font-medium">Completion Rate</div>
        </div>
        <div className="text-2xl font-semibold text-neutral-900">{completionRate}%</div>
      </div>
      
      <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-primary" />
          <div className="text-neutral-700 text-sm font-medium">Avg. Completion Time</div>
        </div>
        <div className="text-2xl font-semibold text-neutral-900">{avgCompletionTime}</div>
      </div>
    </div>
  );
};

export default ResponseSummary; 