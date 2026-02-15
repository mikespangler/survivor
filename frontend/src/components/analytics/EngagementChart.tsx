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
import type { EngagementDataPoint } from '@/types/api';

interface EngagementChartProps {
  data: EngagementDataPoint[];
}

export function EngagementChart({ data }: EngagementChartProps) {
  if (data.length === 0) {
    return (
      <Box p={8} textAlign="center">
        <Text color="text.secondary">No engagement data available yet.</Text>
      </Box>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: `Ep ${d.episodeNumber}`,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <Box bg="bg.primary" borderWidth="1px" p={3} borderRadius="8px" boxShadow="lg">
        <Text fontWeight="bold" mb={1}>{label}</Text>
        {payload.map((entry: any) => (
          <Text key={entry.dataKey} fontSize="sm" color={entry.color}>
            {entry.name}: {typeof entry.value === 'number' && entry.dataKey.includes('Rate')
              ? `${entry.value}%`
              : entry.value.toLocaleString()}
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
            dataKey="teamsWithAnswers"
            name="Active Teams"
            fill="#8B5CF6"
            fillOpacity={0.8}
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="submissionRate"
            name="Submission Rate"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={{ r: 4, fill: '#F59E0B' }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="participationRate"
            name="Participation Rate"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ r: 4, fill: '#10B981' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
}
