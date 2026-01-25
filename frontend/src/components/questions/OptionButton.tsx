'use client';

import { Box, Text, Icon } from '@chakra-ui/react';
import { CheckIcon } from '../dashboard/icons';

interface OptionButtonProps {
  label: string;
  isSelected: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

export function OptionButton({
  label,
  isSelected,
  isDisabled = false,
  onClick,
}: OptionButtonProps) {
  return (
    <Box
      bg={isSelected ? 'rgba(240, 101, 66, 0.1)' : 'rgba(48, 53, 65, 0.1)'}
      border="2px solid"
      borderColor={isSelected ? 'rgba(240, 101, 66, 0.3)' : 'rgba(48, 53, 65, 0.5)'}
      borderRadius="12px"
      h="60px"
      display="flex"
      alignItems="center"
      gap="12px"
      pl="18px"
      pr="2px"
      py="2px"
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      opacity={isDisabled ? 0.6 : 1}
      transition="all 0.2s"
      _hover={
        !isDisabled
          ? {
              borderColor: isSelected
                ? 'rgba(240, 101, 66, 0.5)'
                : 'rgba(48, 53, 65, 0.8)',
            }
          : undefined
      }
      onClick={() => !isDisabled && onClick()}
    >
      {/* Radio circle */}
      <Box
        w="20px"
        h="20px"
        borderRadius="full"
        border="2px solid"
        borderColor={isSelected ? 'brand.primary' : 'rgba(48, 53, 65, 0.5)'}
        bg={isSelected ? 'brand.primary' : 'transparent'}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        {isSelected && <Icon as={CheckIcon} color="white" boxSize="12px" />}
      </Box>

      {/* Label */}
      <Text
        fontFamily="body"
        fontSize="16px"
        fontWeight="medium"
        color={isSelected ? 'text.primary' : 'text.secondary'}
      >
        {label}
      </Text>
    </Box>
  );
}
