'use client';

import { Box, Text } from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { InviteFunnelDataPoint } from '@/types/api';

interface InviteFunnelChartProps {
  data: InviteFunnelDataPoint[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function InviteFunnelChart({ data }: InviteFunnelChartProps) {
  if (data.length === 0) {
    return (
      <Box p={8} textAlign="center">
        <Text color="text.secondary">No invite data available for this period.</Text>
      </Box>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: formatDate(d.period),
  }));

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
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
          <Bar
            dataKey="sent"
            name="Invites Sent"
            fill="#8B5CF6"
            fillOpacity={0.8}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="accepted"
            name="Invites Accepted"
            fill="#10B981"
            fillOpacity={0.8}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
