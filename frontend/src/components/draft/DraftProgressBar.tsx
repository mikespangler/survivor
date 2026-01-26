import { Box, Progress, HStack, Text, Badge } from '@chakra-ui/react';

interface DraftProgressBarProps {
  teamsCompleted: number;
  totalTeams: number;
  draftStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export function DraftProgressBar({
  teamsCompleted,
  totalTeams,
  draftStatus,
}: DraftProgressBarProps) {
  const percentage = (teamsCompleted / totalTeams) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'gray';
      case 'IN_PROGRESS':
        return 'orange';
      case 'COMPLETED':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Box
      p={4}
      borderRadius="16px"
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.secondary"
    >
      <HStack justify="space-between" mb={2}>
        <Text fontSize="sm" fontWeight="medium" color="text.secondary">
          League Draft Progress
        </Text>
        <Badge colorScheme={getStatusColor(draftStatus)}>{draftStatus}</Badge>
      </HStack>

      <Progress
        value={percentage}
        colorScheme="orange"
        borderRadius="full"
        size="sm"
        mb={2}
      />

      <Text fontSize="xs" color="text.secondary">
        {teamsCompleted} of {totalTeams} teams completed
      </Text>
    </Box>
  );
}
