'use client';

import { HStack, Input, Select, Text } from '@chakra-ui/react';

interface DateRangeSelectorProps {
  from: string;
  to: string;
  granularity: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onGranularityChange: (value: string) => void;
}

export function DateRangeSelector({
  from,
  to,
  granularity,
  onFromChange,
  onToChange,
  onGranularityChange,
}: DateRangeSelectorProps) {
  return (
    <HStack spacing={3} flexWrap="wrap">
      <HStack spacing={2}>
        <Text fontSize="sm" color="text.secondary" whiteSpace="nowrap">
          From:
        </Text>
        <Input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          size="sm"
          maxW="160px"
        />
      </HStack>
      <HStack spacing={2}>
        <Text fontSize="sm" color="text.secondary" whiteSpace="nowrap">
          To:
        </Text>
        <Input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          size="sm"
          maxW="160px"
        />
      </HStack>
      <Select
        value={granularity}
        onChange={(e) => onGranularityChange(e.target.value)}
        size="sm"
        maxW="120px"
      >
        <option value="day">Daily</option>
        <option value="week">Weekly</option>
        <option value="month">Monthly</option>
      </Select>
    </HStack>
  );
}
