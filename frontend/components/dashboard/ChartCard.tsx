'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface ChartCardProps {
  title: string;
  data: ChartData[];
  type?: 'line' | 'bar';
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  height?: number;
}

export function ChartCard({
  title,
  data,
  type = 'line',
  dataKey = 'value',
  xAxisKey = 'name',
  color = '#f97316',
  height = 300,
}: ChartCardProps) {
  const Chart = type === 'line' ? LineChart : BarChart;
  const DataComponent = type === 'line' ? Line : Bar;

  const formattedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      [xAxisKey]: item[xAxisKey],
    }));
  }, [data, xAxisKey]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <Chart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey={xAxisKey}
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend />
            <DataComponent
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={color}
              strokeWidth={2}
            />
          </Chart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface MultiLineChartCardProps {
  title: string;
  data: ChartData[];
  lines: Array<{
    dataKey: string;
    color: string;
    name: string;
  }>;
  xAxisKey?: string;
  height?: number;
}

export function MultiLineChartCard({
  title,
  data,
  lines,
  xAxisKey = 'name',
  height = 300,
}: MultiLineChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey={xAxisKey}
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend />
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                strokeWidth={2}
                name={line.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
