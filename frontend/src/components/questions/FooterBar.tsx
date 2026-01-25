'use client';

import { Box, HStack, VStack, Text, Button, Icon } from '@chakra-ui/react';

interface FooterBarProps {
  answeredCount: number;
  totalCount: number;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

export function FooterBar({
  answeredCount,
  totalCount,
  canSubmit,
  isSubmitting,
  onSaveDraft,
  onSubmit,
}: FooterBarProps) {
  const allAnswered = answeredCount === totalCount;

  return (
    <Box
      bg="linear-gradient(173deg, rgb(33, 38, 48) 2.5%, rgb(25, 29, 36) 97.5%)"
      borderTop="2px solid"
      borderColor="rgba(48, 53, 65, 0.5)"
      borderRadius="24px"
      px={6}
      py={6}
    >
      <VStack spacing={4} align="stretch">
        {/* Progress info */}
        <HStack justify="space-between">
          <Text
            fontFamily="body"
            fontSize="14px"
            fontWeight="medium"
            color="text.secondary"
          >
            {answeredCount} of {totalCount} questions answered
          </Text>
          <Text
            fontFamily="body"
            fontSize="14px"
            fontWeight="medium"
            color="text.secondary"
          >
            {allAnswered
              ? 'All questions answered!'
              : 'Please answer all questions before submitting'}
          </Text>
        </HStack>

        {/* Buttons */}
        <HStack spacing={4}>
          {/* Save Draft button */}
          <Button
            flex={1}
            h="64px"
            bg="#2b2b31"
            color="text.primary"
            fontFamily="display"
            fontSize="18px"
            borderRadius="20px"
            border="1px solid"
            borderColor="black"
            boxShadow="0px 6px 0px 0px #0c0e12"
            _hover={{ bg: '#353540' }}
            _active={{
              transform: 'translateY(2px)',
              boxShadow: '0px 3px 0px 0px #0c0e12',
            }}
            onClick={onSaveDraft}
            isDisabled={!canSubmit || isSubmitting}
            leftIcon={
              <Icon viewBox="0 0 16 16" boxSize="16px">
                <path
                  fill="currentColor"
                  d="M13 1H3C1.9 1 1 1.9 1 3v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 12H3V3h10v10zM4 9h8v2H4V9z"
                />
              </Icon>
            }
          >
            Save Draft
          </Button>

          {/* Submit button */}
          <Button
            flex={1}
            h="64px"
            bg="brand.primary"
            color="text.button"
            fontFamily="display"
            fontSize="16px"
            borderRadius="20px"
            boxShadow="0px 6px 0px 0px #C34322"
            _hover={{ bg: '#E85A3A' }}
            _active={{
              transform: 'translateY(2px)',
              boxShadow: '0px 3px 0px 0px #C34322',
            }}
            onClick={onSubmit}
            isLoading={isSubmitting}
            isDisabled={!canSubmit || !allAnswered}
            rightIcon={
              <Icon viewBox="0 0 24 24" boxSize="16px">
                <path
                  fill="currentColor"
                  d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
                />
              </Icon>
            }
          >
            Submit Answers
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
