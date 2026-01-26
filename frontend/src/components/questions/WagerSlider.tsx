'use client';

import { Box, HStack, Text, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from '@chakra-ui/react';

interface WagerSliderProps {
  value: number;
  min: number;
  max: number;
  isDisabled?: boolean;
  onChange: (value: number) => void;
}

export function WagerSlider({
  value,
  min,
  max,
  isDisabled = false,
  onChange,
}: WagerSliderProps) {
  return (
    <Box w="full">
      <HStack justify="space-between" mb={3}>
        <Text
          fontFamily="body"
          fontSize="14px"
          fontWeight="bold"
          color="text.secondary"
        >
          Wager Amount
        </Text>
        <Box
          bg="rgba(240, 101, 66, 0.15)"
          border="1px solid"
          borderColor="rgba(240, 101, 66, 0.2)"
          borderRadius="full"
          px={4}
          py={2}
        >
          <HStack spacing={1}>
            <Text
              fontFamily="display"
              fontSize="20px"
              fontWeight="bold"
              color="brand.primary"
            >
              {value}
            </Text>
            <Text
              fontFamily="body"
              fontSize="14px"
              fontWeight="bold"
              color="brand.primary"
            >
              pts
            </Text>
          </HStack>
        </Box>
      </HStack>

      <Box pt={2} pb={4}>
        <Slider
          value={value}
          min={min}
          max={max}
          step={1}
          isDisabled={isDisabled}
          onChange={onChange}
        >
          <SliderTrack bg="rgba(48, 53, 65, 0.5)" h="8px" borderRadius="full">
            <SliderFilledTrack bg="brand.primary" />
          </SliderTrack>
          <SliderThumb
            boxSize="24px"
            bg="bg.secondary"
            border="2px solid"
            borderColor="brand.primary"
            _focus={{ boxShadow: 'none' }}
          />
        </Slider>

        <HStack justify="space-between" mt={2}>
          <Text fontFamily="body" fontSize="12px" fontWeight="medium" color="text.secondary">
            {min} pts
          </Text>
          <Text fontFamily="body" fontSize="12px" fontWeight="medium" color="text.secondary">
            {max} pts
          </Text>
        </HStack>
      </Box>
    </Box>
  );
}
