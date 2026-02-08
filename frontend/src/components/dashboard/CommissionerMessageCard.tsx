'use client';

import { Box, VStack, HStack, Heading, Text, Badge } from '@chakra-ui/react';
import { RichTextDisplay } from '../common/RichTextDisplay';
import type { CommissionerMessage } from '@/types/api';

interface CommissionerMessageCardProps {
  message: CommissionerMessage;
}

export function CommissionerMessageCard({ message }: CommissionerMessageCardProps) {
  const authorName = message.author.name || message.author.email || 'Commissioner';
  const formattedDate = new Date(message.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Box
      bg="linear-gradient(138deg, #212630 0%, #191D24 100%)"
      border="1px solid"
      borderColor="rgba(240, 101, 66, 0.3)"
      borderRadius="16px"
      p={6}
      position="relative"
      overflow="hidden"
    >
      {/* Accent line at top */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="3px"
        bg="brand.primary"
      />

      <VStack align="stretch" gap={3}>
        <HStack justify="space-between" align="flex-start">
          <VStack align="flex-start" gap={1}>
            <HStack gap={2}>
              <Heading size="md" color="text.primary">
                {message.title}
              </Heading>
              {message.isPinned && (
                <Badge
                  bg="rgba(240, 101, 66, 0.15)"
                  color="brand.primary"
                  fontSize="xs"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                >
                  Pinned
                </Badge>
              )}
            </HStack>
            <Text fontSize="sm" color="text.tertiary">
              Posted by {authorName} on {formattedDate}
            </Text>
          </VStack>
          <MegaphoneIcon />
        </HStack>

        <Box color="text.secondary">
          <RichTextDisplay content={message.content} />
        </Box>
      </VStack>
    </Box>
  );
}

function MegaphoneIcon() {
  return (
    <Box
      as="svg"
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--chakra-colors-brand-primary)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      flexShrink={0}
    >
      <path d="m3 11 18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </Box>
  );
}
