'use client';

import { Box, HStack, VStack, Text, Divider } from '@chakra-ui/react';
import { ClockIcon } from '../dashboard/icons';

interface HeaderBarProps {
  weekNumber: number;
  dueIn: string;
  locksAt: string;
}

export function HeaderBar({ weekNumber, dueIn, locksAt }: HeaderBarProps) {
  return (
    <Box
      bg="linear-gradient(175deg, rgb(33, 38, 48) 2.5%, rgb(25, 29, 36) 97.5%)"
      border="1px solid"
      borderColor="rgba(48, 53, 65, 0.5)"
      borderRadius="12px"
      boxShadow="0px 4px 20px -4px rgba(27, 50, 50, 0.12)"
      px={4}
      py={2}
      display="flex"
      alignItems="center"
      gap={{ base: 3, md: 6 }}
      flexWrap="wrap"
    >
      {/* Week badge */}
      <Box
        bg="rgba(240, 101, 66, 0.15)"
        border="1px solid"
        borderColor="rgba(240, 101, 66, 0.2)"
        borderRadius="full"
        px={4}
        py={3}
      >
        <Text
          fontFamily="body"
          fontSize="14px"
          fontWeight="bold"
          color="brand.primary"
          whiteSpace="nowrap"
        >
          Week {weekNumber}
        </Text>
      </Box>

      {/* Lock icon */}
      <ClockIcon boxSize="24px" color="text.secondary" display={{ base: 'none', md: 'block' }} />

      {/* Due in */}
      <VStack align="start" spacing={0}>
        <Text
          fontFamily="body"
          fontSize={{ base: '12px', md: '14px' }}
          fontWeight="bold"
          color="brand.primary"
        >
          DUE IN:
        </Text>
        <Text
          fontFamily="display"
          fontSize={{ base: '14px', md: '16px' }}
          fontWeight="bold"
          color="text.primary"
          whiteSpace="nowrap"
        >
          {dueIn}
        </Text>
      </VStack>

      {/* Divider */}
      <Box h="32px" w="1px" bg="rgba(48, 53, 65, 0.5)" display={{ base: 'none', md: 'block' }} />

      {/* Locks at */}
      <VStack align="start" spacing={0}>
        <Text
          fontFamily="body"
          fontSize={{ base: '12px', md: '14px' }}
          fontWeight="bold"
          color="text.secondary"
        >
          LOCKS AT:
        </Text>
        <Text
          fontFamily="body"
          fontSize={{ base: '14px', md: '16px' }}
          fontWeight="bold"
          color="text.primary"
          whiteSpace="nowrap"
        >
          {locksAt}
        </Text>
      </VStack>
    </Box>
  );
}
