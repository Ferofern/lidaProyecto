import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ChartCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ChartCard({ children, className = '', delay = 0 }: ChartCardProps) {
  return (
    <Card 
      className={`glass-card animate-slide-up ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
}
