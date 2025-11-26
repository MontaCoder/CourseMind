import React from 'react';
import { cn } from '@/lib/utils';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  innerRadius?: number;
  outerRadius?: number;
  className?: string;
  centerLabel?: string;
  centerValue?: number;
}

function createPiePath(cx: number, cy: number, radius: number, innerRadius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  const d = [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "L", innerEnd.x, innerEnd.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
    "Z"
  ].join(" ");

  return d;
}

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: cx + (radius * Math.cos(angleInRadians)),
    y: cy + (radius * Math.sin(angleInRadians))
  };
}

function calculateTotalValue(data: PieChartData[]): number {
  return data.reduce((sum, item) => sum + item.value, 0);
}

function calculatePercentage(data: PieChartData[], value: number): number {
  const total = calculateTotalValue(data);
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

const CustomPieChart: React.FC<PieChartProps> = ({
  data,
  innerRadius = 60,
  outerRadius = 100,
  className,
  centerLabel,
  centerValue
}) => {
  const total = calculateTotalValue(data);
  if (total === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center text-muted-foreground">
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm">No data</div>
        </div>
      </div>
    );
  }

  let currentAngle = 0;
  const cx = 120;
  const cy = 120;
  const centerX = 120;
  const centerY = 120;

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <svg
        width="240"
        height="240"
        viewBox="0 0 240 240"
        className="overflow-visible"
      >
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angleSize = (item.value / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angleSize;
          
          const path = createPiePath(cx, cy, outerRadius, innerRadius, startAngle, endAngle);
          
          currentAngle += angleSize;

          return (
            <path
              key={index}
              d={path}
              fill={item.color}
              stroke="var(--border)"
              strokeWidth="1"
              className="transition-all duration-200 hover:opacity-80 cursor-pointer"
            >
              <title>{`${item.name}: ${item.value} (${percentage.toFixed(1)}%)`}</title>
            </path>
          );
        })}
        
        {/* Center text */}
        {centerLabel && (
          <text
            x={centerX}
            y={centerY - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-medium fill-foreground"
          >
            {centerLabel}
          </text>
        )}
        {centerValue !== undefined && (
          <text
            x={centerX}
            y={centerY + 12}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-2xl font-bold fill-foreground"
          >
            {centerValue}
          </text>
        )}
      </svg>
    </div>
  );
};

export { CustomPieChart, type PieChartData, calculatePercentage };