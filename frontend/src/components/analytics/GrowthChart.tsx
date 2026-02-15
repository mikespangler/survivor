'use client';

import { Box, Text } from '@chakra-ui/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { GrowthDataPoint } from '@/types/api';

interface GrowthChartProps {
  data: GrowthDataPoint[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function GrowthChart({ data }: GrowthChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatDate(d.period),
  }));

  if (chartData.length === 0) {
    return (
      <Box p={8} textAlign="center">
        <Text color="text.secondary">No growth data available for this period.</Text>
      </Box>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <Box bg="bg.primary" borderWidth="1px" p={3} borderRadius="8px" boxShadow="lg">
        <Text fontWeight="bold" mb={1}>{label}</Text>
        {payload.map((entry: any) => (
          <Text key={entry.dataKey} fontSize="sm" color={entry.color}>
            {entry.name}: {entry.value.toLocaleString()}
          </Text>
        ))}
      </Box>
    );
  };

  return (
    <Box h="350px" w="100%">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#A0AEC0', fontSize: 12 }}
            tickLine={{ stroke: '#A0AEC0' }}
          />
          <YAxis
            tick={{ fill: '#A0AEC0', fontSize: 12 }}
            tickLine={{ stroke: '#A0AEC0' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="cumulativeUsers"
            name="Total Users"
            stroke="#8B5CF6"
            fill="#8B5CF6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="cumulativeLeagues"
            name="Total Leagues"
            stroke="#06B6D4"
            fill="#06B6D4"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
