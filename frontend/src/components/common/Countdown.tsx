'use client';

import { useEffect, useState } from 'react';
import { HStack, Text } from '@chakra-ui/react';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

interface CountdownProps {
  targetDate: string | Date;
  onExpire?: () => void;
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const calculateTimeRemaining = (targetDate: Date): TimeRemaining => {
  const now = new Date().getTime();
  const target = targetDate.getTime();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isExpired: false,
  };
};

export function Countdown({
  targetDate,
  onExpire,
  showDays = true,
  showHours = true,
  showMinutes = true,
  showSeconds = false,
  size = 'md',
  color = 'text.primary',
}: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() => {
    try {
      const date = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
      if (isNaN(date.getTime())) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }
      return calculateTimeRemaining(date);
    } catch {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }
  });

  useEffect(() => {
    let date: Date;
    try {
      date = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
      if (isNaN(date.getTime())) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
    } catch {
      setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      return;
    }

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(date);
      setTimeRemaining(remaining);

      if (remaining.isExpired && onExpire) {
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  const { days, hours, minutes, seconds, isExpired } = timeRemaining;

  // Handle invalid date
  if (isExpired && days === 0 && hours === 0 && minutes === 0) {
    return (
      <Text fontSize={size === 'lg' ? '20px' : size === 'md' ? '16px' : '14px'} color={color}>
        Started
      </Text>
    );
  }

  const fontSize = size === 'lg' ? '20px' : size === 'md' ? '16px' : '14px';

  return (
    <HStack gap={1} fontFamily="body">
      {showDays && (
        <Text fontSize={fontSize} fontWeight="bold" color={color}>
          {days}d
        </Text>
      )}
      {showDays && showHours && (
        <Text fontSize={fontSize} fontWeight="bold" color={color}>
          :
        </Text>
      )}
      {showHours && (
        <Text fontSize={fontSize} fontWeight="bold" color={color}>
          {hours}h
        </Text>
      )}
      {showHours && showMinutes && (
        <Text fontSize={fontSize} fontWeight="bold" color={color}>
          :
        </Text>
      )}
      {showMinutes && (
        <Text fontSize={fontSize} fontWeight="bold" color={color}>
          {minutes}m
        </Text>
      )}
      {showMinutes && showSeconds && (
        <Text fontSize={fontSize} fontWeight="bold" color={color}>
          :
        </Text>
      )}
      {showSeconds && (
        <Text fontSize={fontSize} fontWeight="bold" color={color}>
          {seconds}s
        </Text>
      )}
    </HStack>
  );
}
