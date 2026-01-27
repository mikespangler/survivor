import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Grid,
  IconButton,
  Avatar,
} from '@chakra-ui/react';
import { CloseIcon } from '../dashboard/icons';
import type { Castaway } from '@/types/api';

interface SelectedRosterPreviewProps {
  selectedCastaways: Castaway[];
  requiredCount: number;
  onRemove: (id: string) => void;
}

export function SelectedRosterPreview({
  selectedCastaways,
  requiredCount,
  onRemove,
}: SelectedRosterPreviewProps) {
  const emptySlots = requiredCount - selectedCastaways.length;

  return (
    <Box
      p={6}
      borderRadius="24px"
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.secondary"
    >
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold" color="text.primary">
            Your Roster
          </Text>
          <Badge
            colorScheme={
              selectedCastaways.length === requiredCount ? 'green' : 'orange'
            }
            fontSize="md"
            px={3}
            py={1}
            borderRadius="full"
          >
            {selectedCastaways.length}/{requiredCount}
          </Badge>
        </HStack>

        <Grid templateColumns="repeat(2, 1fr)" gap={3}>
          {selectedCastaways.map((castaway) => (
            <Box
              key={castaway.id}
              p={3}
              borderRadius="12px"
              bg="bg.primary"
              borderWidth="1px"
              borderColor="brand.primary"
              position="relative"
            >
              <IconButton
                aria-label="Remove castaway"
                icon={<CloseIcon />}
                size="xs"
                position="absolute"
                top={1}
                right={1}
                colorScheme="red"
                onClick={() => onRemove(castaway.id)}
              />

              <VStack gap={2}>
                <Avatar
                  size="sm"
                  name={castaway.name}
                  src={castaway.imageUrl || undefined}
                />
                <Text fontSize="xs" fontWeight="bold" textAlign="center">
                  {castaway.name}
                </Text>
              </VStack>
            </Box>
          ))}

          {Array.from({ length: emptySlots }).map((_, i) => (
            <Box
              key={`empty-${i}`}
              p={3}
              borderRadius="12px"
              borderWidth="2px"
              borderColor="border.default"
              borderStyle="dashed"
              display="flex"
              alignItems="center"
              justifyContent="center"
              minH="100px"
            >
              <Text fontSize="xs" color="text.muted">
                Empty
              </Text>
            </Box>
          ))}
        </Grid>
      </VStack>
    </Box>
  );
}
