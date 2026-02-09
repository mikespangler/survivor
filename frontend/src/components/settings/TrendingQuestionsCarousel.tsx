'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  IconButton,
  Text,
  Badge,
  VStack,
  Spinner,
  Tooltip,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, AddIcon } from '@chakra-ui/icons';
import { api } from '@/lib/api';
import type { TrendingQuestion } from '@/types/api';

interface TrendingQuestionsCarouselProps {
  leagueId: string;
  seasonId: string;
  episodeNumber: number;
  onAddQuestion: (question: TrendingQuestion) => void;
}

export function TrendingQuestionsCarousel({
  leagueId,
  seasonId,
  episodeNumber,
  onAddQuestion,
}: TrendingQuestionsCarouselProps) {
  const [questions, setQuestions] = useState<TrendingQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  const loadTrending = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getTrendingQuestions(
        leagueId,
        seasonId,
        episodeNumber,
      );
      setQuestions(data);
      // Allow DOM to update, then recalculate scroll buttons
      requestAnimationFrame(() => updateScrollButtons());
    } catch (err) {
      console.error('Failed to load trending questions', err);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [leagueId, seasonId, episodeNumber, updateScrollButtons]);

  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollButtons);
  }, [updateScrollButtons]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 296; // 280px card + 16px gap
    el.scrollBy({
      left: direction === 'left' ? -cardWidth * 2 : cardWidth * 2,
      behavior: 'smooth',
    });
  };

  if (isLoading) {
    return (
      <Box
        p={5}
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="lg"
        bg="bg.secondary"
      >
        <HStack spacing={3} mb={4}>
          <Text fontSize="lg" fontWeight="bold" color="text.primary">
            Trending This Week
          </Text>
        </HStack>
        <HStack justify="center" py={6}>
          <Spinner size="sm" color="brand.primary" />
          <Text color="text.secondary" fontSize="sm">
            Loading trending questions...
          </Text>
        </HStack>
      </Box>
    );
  }

  if (questions.length === 0) {
    return (
      <Box
        p={5}
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="lg"
        bg="bg.secondary"
      >
        <HStack spacing={3} mb={2}>
          <Text fontSize="lg" fontWeight="bold" color="text.primary">
            Trending This Week
          </Text>
        </HStack>
        <Text color="text.secondary" fontSize="sm">
          No trending questions yet for Episode {episodeNumber} — be the first!
        </Text>
      </Box>
    );
  }

  return (
    <Box
      p={5}
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      bg="bg.secondary"
      position="relative"
    >
      {/* Header */}
      <HStack justify="space-between" mb={4}>
        <VStack align="start" spacing={0}>
          <HStack spacing={2}>
            <Text
              fontSize="lg"
              fontWeight="bold"
              bgGradient="linear(to-r, brand.primary, #F9C31F)"
              bgClip="text"
            >
              Trending This Week
            </Text>
            <Badge
              bg="rgba(240, 101, 66, 0.15)"
              color="brand.primary"
              fontSize="xs"
              px={2}
              borderRadius="full"
            >
              {questions.length} popular
            </Badge>
          </HStack>
          <Text color="text.secondary" fontSize="sm">
            Questions popular with other commissioners for Episode{' '}
            {episodeNumber}
          </Text>
        </VStack>

        {/* Scroll arrows */}
        <HStack spacing={1}>
          <IconButton
            aria-label="Scroll left"
            icon={<ChevronLeftIcon boxSize={5} />}
            size="sm"
            variant="ghost"
            color="text.secondary"
            isDisabled={!canScrollLeft}
            onClick={() => scroll('left')}
            _hover={{ color: 'text.primary', bg: 'bg.overlay' }}
          />
          <IconButton
            aria-label="Scroll right"
            icon={<ChevronRightIcon boxSize={5} />}
            size="sm"
            variant="ghost"
            color="text.secondary"
            isDisabled={!canScrollRight}
            onClick={() => scroll('right')}
            _hover={{ color: 'text.primary', bg: 'bg.overlay' }}
          />
        </HStack>
      </HStack>

      {/* Carousel */}
      <Box
        ref={scrollRef}
        overflowX="auto"
        mx={-1}
        px={1}
        pb={2}
        sx={{
          scrollSnapType: 'x mandatory',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(255,255,255,0.2)',
          },
        }}
      >
        <HStack spacing={4} align="stretch" w="max-content">
          {questions.map((question) => (
            <TrendingCard
              key={`${question.text}-${question.type}-${question.pointValue}`}
              question={question}
              onAdd={() => onAddQuestion(question)}
            />
          ))}
        </HStack>
      </Box>
    </Box>
  );
}

function TrendingCard({
  question,
  onAdd,
}: {
  question: TrendingQuestion;
  onAdd: () => void;
}) {
  return (
    <Box
      w="280px"
      minW="280px"
      p={4}
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="xl"
      bg="linear-gradient(138deg, #212630 0%, #191D24 100%)"
      scrollSnapAlign="start"
      transition="all 0.2s"
      _hover={{
        borderColor: 'brand.primary',
        boxShadow: '0 0 12px rgba(240, 101, 66, 0.15)',
        transform: 'translateY(-1px)',
      }}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      {/* Question text */}
      <Tooltip label={question.text} placement="top" hasArrow openDelay={500}>
        <Text
          color="text.primary"
          fontSize="sm"
          fontWeight="medium"
          noOfLines={2}
          lineHeight="1.5"
          mb={3}
          minH="42px"
        >
          {question.text}
        </Text>
      </Tooltip>

      {/* Badges */}
      <HStack spacing={2} mb={3} flexWrap="wrap">
        <Badge
          colorScheme={question.type === 'MULTIPLE_CHOICE' ? 'blue' : 'purple'}
          fontSize="xs"
          borderRadius="full"
          px={2}
        >
          {question.type === 'MULTIPLE_CHOICE' ? 'MC' : 'Fill'}
        </Badge>
        <Badge
          bg="rgba(240, 101, 66, 0.15)"
          color="brand.primary"
          fontSize="xs"
          borderRadius="full"
          px={2}
        >
          {question.isWager
            ? `Wager ${question.minWager}–${question.maxWager}`
            : `${question.pointValue} pts`}
        </Badge>
      </HStack>

      {/* Footer with league count and add button */}
      <HStack justify="space-between" align="center">
        <Text color="text.secondary" fontSize="xs">
          Used by{' '}
          <Text as="span" color="brand.primary" fontWeight="bold">
            {question.leagueCount}
          </Text>{' '}
          {question.leagueCount === 1 ? 'league' : 'leagues'}
        </Text>
        <Button
          size="xs"
          leftIcon={<AddIcon boxSize={2.5} />}
          variant="outline"
          borderColor="brand.primary"
          color="brand.primary"
          _hover={{
            bg: 'rgba(240, 101, 66, 0.15)',
          }}
          onClick={onAdd}
        >
          Add
        </Button>
      </HStack>
    </Box>
  );
}
