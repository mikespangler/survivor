import { Box, Avatar, Text, VStack, Badge } from '@chakra-ui/react';
import { CheckIcon } from '../dashboard/icons';
import type { Castaway } from '@/types/api';

interface CastawayCardProps {
  castaway: Castaway;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (id: string) => void;
  onDeselect: (id: string) => void;
}

export function CastawayCard({
  castaway,
  isSelected,
  isDisabled,
  onSelect,
  onDeselect,
}: CastawayCardProps) {
  const handleClick = () => {
    if (isDisabled) return;
    if (isSelected) {
      onDeselect(castaway.id);
    } else {
      onSelect(castaway.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'ELIMINATED':
        return 'red';
      case 'JURY':
        return 'purple';
      default:
        return 'gray';
    }
  };

  return (
    <Box
      p={4}
      borderRadius="16px"
      borderWidth="2px"
      borderColor={isSelected ? 'brand.primary' : 'border.default'}
      bg={isSelected ? 'bg.overlay' : 'bg.secondary'}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      opacity={isDisabled ? 0.5 : 1}
      transition="all 0.2s"
      _hover={{
        transform: isDisabled ? 'none' : 'scale(1.02)',
        borderColor: isSelected ? 'brand.primary' : 'rgba(240, 101, 66, 0.5)',
      }}
      onClick={handleClick}
      position="relative"
    >
      {isSelected && (
        <Box
          position="absolute"
          top={2}
          right={2}
          bg="brand.primary"
          borderRadius="full"
          p={1}
        >
          <CheckIcon color="white" boxSize={4} />
        </Box>
      )}

      <VStack gap={3}>
        <Avatar
          size="lg"
          name={castaway.name}
          borderWidth="2px"
          borderColor={isSelected ? 'brand.primary' : 'border.default'}
        />

        <VStack gap={1}>
          <Text
            fontWeight="bold"
            color="text.primary"
            textAlign="center"
            fontSize="14px"
          >
            {castaway.name}
          </Text>

          <Badge
            colorScheme={getStatusColor(castaway.status)}
            fontSize="xs"
            px={2}
            py={0.5}
            borderRadius="full"
          >
            {castaway.status}
          </Badge>
        </VStack>
      </VStack>
    </Box>
  );
}
