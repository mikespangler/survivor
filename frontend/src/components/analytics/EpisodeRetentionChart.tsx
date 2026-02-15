'use client';

import { Box, Text } from '@chakra-ui/react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { RetentionData } from '@/types/api';

interface EpisodeRetentionChartProps {
  data: RetentionData;
}

export function EpisodeRetentionChart({ data }: EpisodeRetentionChartProps) {
  const chartData = data.episodeRetention.map((d) => ({
    ...d,
    label: `Ep ${d.episodeNumber}`,
  }));

  if (chartData.length === 0) {
    return (
      <Box p={8} textAlign="center">
        <Text color="text.secondary">
          No episode retention data yet. Data appears after players answer questions across episodes.
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
            {entry.name}: {entry.dataKey === 'returnRate' ? `${entry.value}%` : entry.value.toLocaleString()}
          </Text>
        ))}
      </Box>
    );
  };

  return (
    <Box h="350px" w="100%">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#A0AEC0', fontSize: 12 }}
            tickLine={{ stroke: '#A0AEC0' }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: '#A0AEC0', fontSize: 12 }}
            tickLine={{ stroke: '#A0AEC0' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#A0AEC0', fontSize: 12 }}
            tickLine={{ stroke: '#A0AEC0' }}
            domain={[0, 100]}
            unit="%"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="activeUsers"
            name="Active Users"
            fill="#06B6D4"
            fillOpacity={0.8}
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="returnRate"
            name="Return Rate"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={{ r: 4, fill: '#F59E0B' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
}
