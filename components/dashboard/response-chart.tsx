import { Card, CardContent } from "@/components/ui/card";

// Feature Chart Item
interface FeatureItem {
  name: string;
  value: number;
}

interface ResponseChartProps {
  type: 'rating' | 'feature';
  title: string;
  data: number[] | FeatureItem[];
  labels?: string[];
  average?: number;
}

const ResponseChart = ({ 
  type, 
  title, 
  data, 
  labels,
  average 
}: ResponseChartProps) => {
  
  if (type === 'rating') {
    const ratingData = data as number[];
    
    return (
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-neutral-900 mb-4">{title}</h4>
          <div className="flex items-end h-40 gap-2">
            {ratingData.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className={`${index === 3 || index === 4 ? 'bg-primary' : 'bg-neutral-100'} w-full rounded-t-sm`} 
                  style={{ height: `${value}%` }}
                ></div>
                <div className="mt-2 text-sm text-neutral-500">{labels && labels[index]}</div>
              </div>
            ))}
          </div>
          {average && (
            <div className="text-center mt-4 text-sm text-neutral-500">
              Average rating: {average}/5
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Feature improvement chart
  const featureData = data as FeatureItem[];
  
  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="font-medium text-neutral-900 mb-4">{title}</h4>
        <div className="space-y-4">
          {featureData.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-700">{item.name}</span>
                <span className="text-neutral-500">{item.value}%</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${item.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResponseChart; 