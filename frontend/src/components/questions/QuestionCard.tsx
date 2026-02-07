'use client';

import { Box, VStack, HStack, Text, Button, Icon, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { OptionButton } from './OptionButton';
import { WagerSlider } from './WagerSlider';
import type { QuestionScope } from '@/types/api';

// Season bonus icon (gift/present icon)
const SeasonBonusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <Icon viewBox="0 0 12 12" boxSize="12px" {...props}>
    <path
      fill="currentColor"
      d="M10.5 4.5h-1.086c.377-.377.586-.88.586-1.414 0-.534-.209-1.037-.586-1.414a2.002 2.002 0 0 0-2.828 0L6 2.258 5.414 1.672a2.002 2.002 0 0 0-2.828 0A1.994 1.994 0 0 0 2 3.086c0 .534.209 1.037.586 1.414H1.5c-.275 0-.5.225-.5.5v2c0 .275.225.5.5.5h.5v3.5c0 .275.225.5.5.5h7c.275 0 .5-.225.5-.5V7.5h.5c.275 0 .5-.225.5-.5v-2c0-.275-.225-.5-.5-.5zm-6.914-1c-.155-.155-.241-.361-.241-.586s.086-.431.241-.586a.827.827 0 0 1 1.172 0L6 3.57 4.758 4.812a1.994 1.994 0 0 1-1.172-1.312zm4.242.586c.155.155.241.361.241.586s-.086.431-.241.586L6.586 3.914 7.828 2.672a.827.827 0 0 1 1.172 0c.155.155.241.361.241.586s-.086.431-.241.586zm-1.328.914h2.5v1.5h-2.5V5zm-5 0h2.5v1.5H1.5V5zm1 2.5h2V10H3V7.5zm3 2.5V7.5h2V10H6z"
    />
  </Icon>
);

interface QuestionCardProps {
  questionNumber: number;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK';
  options?: string[];
  pointValue: number;
  questionScope: QuestionScope;
  isWager: boolean;
  minWager?: number | null;
  maxWager?: number | null;
  selectedAnswer: string | null;
  wagerAmount: number;
  isDisabled?: boolean;
  isScored?: boolean;
  correctAnswer?: string | null;
  pointsEarned?: number | null;
  isSaving?: boolean;
  saveError?: string;
  onSelectAnswer: (answer: string) => void;
  onClearSelection: () => void;
  onWagerChange: (amount: number) => void;
}

export type { QuestionCardProps };

// Get badge color based on scope and type
function getBadgeColors(scope: QuestionScope, isWager: boolean) {
  if (isWager) {
    return {
      bg: 'rgba(249, 195, 31, 0.15)',
      borderColor: 'rgba(249, 195, 31, 0.3)',
      textColor: '#F9C31F',
    };
  }
  // Both episode and season use purple
  return {
    bg: 'rgba(107, 126, 203, 0.15)',
    borderColor: 'rgba(107, 126, 203, 0.3)',
    textColor: '#6B7ECB',
  };
}

function getScopeLabel(_scope: QuestionScope, isWager: boolean) {
  if (isWager) return 'Point Wager';
  if (_scope === 'season') return 'Season Bonus';
  return 'Episode';
}

export function QuestionCard({
  questionNumber,
  text,
  type,
  options,
  pointValue,
  questionScope,
  isWager,
  minWager,
  maxWager,
  selectedAnswer,
  wagerAmount,
  isDisabled = false,
  isScored = false,
  correctAnswer,
  pointsEarned,
  isSaving = false,
  saveError,
  onSelectAnswer,
  onClearSelection,
  onWagerChange,
}: QuestionCardProps) {
  const badgeColors = getBadgeColors(questionScope, isWager);
  const scopeLabel = getScopeLabel(questionScope, isWager);

  return (
    <Box
      bg="linear-gradient(158deg, rgb(33, 38, 48) 2.5%, rgb(25, 29, 36) 97.5%)"
      border="2px solid"
      borderColor="rgba(43, 48, 59, 0.5)"
      borderRadius="24px"
      overflow="hidden"
    >
      {/* Header */}
      <Box
        borderBottom="2px solid"
        borderColor="rgba(48, 53, 65, 0.5)"
        px={6}
        py={6}
      >
        <HStack justify="space-between" align="flex-start">
          <VStack align="start" spacing={3} flex={1}>
            {/* Badge row */}
            <HStack spacing={3}>
              {/* Number badge */}
              <Box
                bg={badgeColors.bg}
                border="1px solid"
                borderColor={badgeColors.borderColor}
                borderRadius="12px"
                w="40px"
                h="40px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  fontFamily="display"
                  fontSize="18px"
                  fontWeight="bold"
                  color={badgeColors.textColor}
                >
                  {questionNumber}
                </Text>
              </Box>

              {/* Scope badge */}
              <Box
                bg={badgeColors.bg}
                border="1px solid"
                borderColor={badgeColors.borderColor}
                borderRadius="full"
                px={3}
                py={2}
              >
                <HStack spacing={1}>
                  {questionScope === 'season' && !isWager && (
                    <SeasonBonusIcon color={badgeColors.textColor} />
                  )}
                  <Text
                    fontFamily="body"
                    fontSize="11px"
                    fontWeight="bold"
                    color={badgeColors.textColor}
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                  >
                    {scopeLabel}
                  </Text>
                </HStack>
              </Box>
            </HStack>

            {/* Question text */}
            <Text
              fontFamily="display"
              fontSize="18px"
              fontWeight="bold"
              color="text.primary"
              lineHeight="28px"
            >
              {text}
            </Text>

            {/* Season bonus note */}
            {questionScope === 'season' && !isWager && (
              <Text
                fontFamily="body"
                fontSize="14px"
                fontWeight="medium"
                color="text.secondary"
              >
                This question will be scored at the end of the season.
              </Text>
            )}
          </VStack>

          {/* Points badge */}
          <HStack spacing={2} flexShrink={0}>
            {isSaving && (
              <HStack spacing={1}>
                <Spinner size="xs" color="brand.primary" />
                <Text
                  fontFamily="body"
                  fontSize="11px"
                  fontWeight="medium"
                  color="text.secondary"
                >
                  Saving...
                </Text>
              </HStack>
            )}
            <Box
              bg="rgba(240, 101, 66, 0.15)"
              border="1px solid"
              borderColor="rgba(240, 101, 66, 0.2)"
              borderRadius="full"
              px={3}
              py={2}
            >
              <Text
                fontFamily="display"
                fontSize="14px"
                fontWeight="bold"
                color="brand.primary"
              >
                {isWager ? 'High Wager' : `+${pointValue} pts`}
              </Text>
            </Box>
          </HStack>
        </HStack>
      </Box>

      {/* Body */}
      <Box px={6} py={6}>
        <VStack spacing={4} align="stretch">
          {/* Wager slider (for wager questions) */}
          {isWager && !isDisabled && (
            <Box
              borderBottom="2px solid"
              borderColor="rgba(48, 53, 65, 0.5)"
              pb={6}
              mb={2}
            >
              <WagerSlider
                value={wagerAmount}
                min={minWager ?? 0}
                max={maxWager ?? 10}
                isDisabled={isDisabled}
                onChange={onWagerChange}
              />
            </Box>
          )}

          {/* Options */}
          {type === 'MULTIPLE_CHOICE' && options && (
            <VStack spacing={3} align="stretch">
              {options.map((option) => (
                <OptionButton
                  key={option}
                  label={option}
                  isSelected={selectedAnswer === option}
                  isDisabled={isDisabled}
                  onClick={() => onSelectAnswer(option)}
                />
              ))}
            </VStack>
          )}

          {/* Clear selection button */}
          {selectedAnswer && !isDisabled && (
            <Button
              variant="link"
              color="brand.primary"
              fontFamily="body"
              fontSize="14px"
              fontWeight="bold"
              alignSelf="flex-start"
              onClick={onClearSelection}
              _hover={{ textDecoration: 'none', opacity: 0.8 }}
            >
              Clear Selection
            </Button>
          )}

          {/* Scored result */}
          {isScored && (
            <Box
              bg="rgba(48, 53, 65, 0.2)"
              borderRadius="12px"
              p={4}
              mt={2}
            >
              <HStack justify="space-between">
                <Box>
                  <Text
                    fontFamily="body"
                    fontSize="12px"
                    fontWeight="bold"
                    color="text.secondary"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                    mb={1}
                  >
                    Correct Answer
                  </Text>
                  <Text
                    fontFamily="body"
                    fontSize="16px"
                    fontWeight="medium"
                    color="text.primary"
                  >
                    {correctAnswer}
                  </Text>
                </Box>
                <Box textAlign="right">
                  <Text
                    fontFamily="body"
                    fontSize="12px"
                    fontWeight="bold"
                    color="text.secondary"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                    mb={1}
                  >
                    Points Earned
                  </Text>
                  <Text
                    fontFamily="display"
                    fontSize="24px"
                    fontWeight="bold"
                    color={
                      pointsEarned != null && pointsEarned > 0
                        ? 'green.400'
                        : pointsEarned != null && pointsEarned < 0
                          ? 'red.400'
                          : 'text.secondary'
                    }
                  >
                    {pointsEarned != null && pointsEarned > 0 ? '+' : ''}
                    {pointsEarned ?? 0}
                  </Text>
                </Box>
              </HStack>
            </Box>
          )}
          
          {/* Save error */}
          {saveError && (
            <Alert
              status="error"
              borderRadius="12px"
              bg="rgba(240, 101, 66, 0.1)"
              border="1px solid"
              borderColor="rgba(240, 101, 66, 0.3)"
              py={3}
            >
              <AlertIcon color="brand.primary" />
              <Text
                fontFamily="body"
                fontSize="13px"
                fontWeight="medium"
                color="text.primary"
              >
                {saveError}
              </Text>
            </Alert>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
