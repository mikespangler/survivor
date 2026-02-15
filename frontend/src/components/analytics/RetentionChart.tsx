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
} from 'recharts';
import type { RetentionData } from '@/types/api';

interface RetentionChartProps {
  data: RetentionData;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function RetentionChart({ data }: RetentionChartProps) {
  const chartData = data.dailyActiveUsers.map((d) => ({
    label: formatDate(d.period),
    dau: d.count,
  }));

  if (chartData.length === 0) {
    return (
      <Box p={8} textAlign="center">
        <Text color="text.secondary">
          No activity data yet. DAU tracking begins when users visit the app.
        </Text>
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
          <Area
            type="monotone"
            dataKey="dau"
            name="Daily Active Users"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
