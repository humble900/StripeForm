'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const DashboardNoProviders = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold mb-4">Dashboard Without Providers</h1>
        <Card>
          <CardContent className="p-6">
            <p className="mb-4">This page uses the layout but not the complex providers.</p>
            <Button onClick={() => setCount(count + 1)}>
              Clicked {count} times
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardNoProviders; 