'use client';

import { Box, VStack, HStack, Heading, Text, Badge, IconButton, Tooltip } from '@chakra-ui/react';
import { RichTextDisplay } from '../common/RichTextDisplay';
import type { CommissionerMessage } from '@/types/api';

interface CommissionerMessageCardProps {
  message: CommissionerMessage;
  onDismiss?: (messageId: string) => void;
}

export function CommissionerMessageCard({ message, onDismiss }: CommissionerMessageCardProps) {
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
          <HStack gap={2} flexShrink={0}>
            <MegaphoneIcon />
            {onDismiss && (
              <Tooltip label="Dismiss">
                <IconButton
                  aria-label="Dismiss announcement"
                  size="xs"
                  variant="ghost"
                  color="text.tertiary"
                  _hover={{ color: 'text.primary', bg: 'rgba(255,255,255,0.08)' }}
                  onClick={() => onDismiss(message.id)}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            )}
          </HStack>
        </HStack>

        <Box color="text.secondary">
          <RichTextDisplay content={message.content} />
        </Box>
      </VStack>
    </Box>
  );
}

function CloseIcon() {
  return (
    <Box
      as="svg"
      width="14px"
      height="14px"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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
