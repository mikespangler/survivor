'use client';

import { Box, Text, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';

interface KpiCardProps {
  label: string;
  value: number | string;
  helpText?: string;
}

export function KpiCard({ label, value, helpText }: KpiCardProps) {
  return (
    <Box
      p={5}
      borderWidth="1px"
      borderRadius="lg"
      borderColor="border.default"
      bg="bg.secondary"
    >
      <Stat>
        <StatLabel color="text.secondary" fontSize="sm">
          {label}
        </StatLabel>
        <StatNumber fontSize="2xl" color="text.primary">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </StatNumber>
        {helpText && (
          <StatHelpText color="text.tertiary" fontSize="xs">
            {helpText}
          </StatHelpText>
        )}
      </Stat>
    </Box>
  );
}
