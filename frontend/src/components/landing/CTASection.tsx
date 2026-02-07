'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Image,
  Flex,
} from '@chakra-ui/react';
import Link from 'next/link';

export const CTASection = () => {
  return (
    <Box
      as="section"
      bg="bg.primary"
      py={{ base: 12, md: 20 }}
      px={{ base: 4, lg: '100px' }}
      position="relative"
      overflow="hidden"
    >
      {/* Background blur */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="600px"
        h="600px"
        borderRadius="full"
        filter="blur(32px)"
        pointerEvents="none"
      />

      <Container maxW="768px" px={0} position="relative" zIndex={1}>
        <VStack gap={0} textAlign="center">
          {/* Subheadline */}
          <Text
            fontFamily="body"
            fontSize="lg"
            lineHeight="28px"
            fontWeight="medium"
            color="text.secondary"
            maxW="576px"
            mb={10}
          >
            Takes less than a minute to get started. Join the thousands of Survivor fans already competing in fantasy leagues!
          </Text>

          {/* CTA Buttons */}
          <Flex
            gap={4}
            direction={{ base: 'column', sm: 'row' }}
            align="center"
            mb={10}
          >
            <Link href="/sign-up">
              <Button
                size="lg"
                bg="brand.primary"
                color="text.button"
                boxShadow="0px 6px 0px 0px #C34322"
                h="64px"
                px={10}
                borderRadius="full"
                fontFamily="heading"
                gap={2}
                _hover={{ bg: '#E85A3A' }}
                _active={{ transform: 'translateY(4px)', boxShadow: 'none' }}
              >
                <Image src="/landing/icon-users.svg" alt="" w="16px" h="16px" filter="brightness(0)" />
                Join a League
                <Image src="/landing/icon-arrow-right.svg" alt="" w="16px" h="16px" filter="brightness(0)" />
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                size="lg"
                bg="rgba(248, 246, 242, 0.05)"
                color="text.primary"
                boxShadow="0px 6px 0px 0px #0C0E12"
                h="64px"
                px={10}
                borderRadius="full"
                fontFamily="heading"
                gap={2}
                _hover={{ bg: 'rgba(248, 246, 242, 0.1)' }}
                _active={{ transform: 'translateY(4px)', boxShadow: 'none' }}
              >
                <Image src="/landing/icon-plus.svg" alt="" w="16px" h="16px" />
                Create Your Own League
              </Button>
            </Link>
          </Flex>

          {/* Feature Pills */}
          <HStack gap={4} flexWrap="wrap" justify="center">
            <FeaturePill>✓ Free to play</FeaturePill>
            <FeaturePill>✓ Private leagues</FeaturePill>
            <FeaturePill>✓ No download</FeaturePill>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

const FeaturePill = ({ children }: { children: React.ReactNode }) => (
  <Box
    bg="rgba(43, 48, 59, 0.5)"
    border="1px solid"
    borderColor="rgba(48, 53, 65, 0.5)"
    borderRadius="full"
    px={4}
    py={2}
  >
    <Text
      fontFamily="body"
      fontSize="sm"
      fontWeight="semibold"
      color="text.primary"
    >
      {children}
    </Text>
  </Box>
);

export default CTASection;
