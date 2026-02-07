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

      <Container maxW="900px" px={0} position="relative" zIndex={1}>
        <VStack gap={4} textAlign="center">
          {/* Headline */}
          <Heading
            as="h2"
            fontFamily="heading"
            fontSize={{ base: '28px', md: '36px' }}
            lineHeight="1.2"
            letterSpacing="-1.2px"
          >
            <Text as="span" color="text.primary">
              Ready to Outwit, Outplay,{' '}
            </Text>
            <Text as="span" className="text-gradient-orange-yellow">
              Outlast Your Friends?
            </Text>
          </Heading>

          {/* Subheadline */}
          <Text
            fontFamily="body"
            fontSize="md"
            lineHeight="24px"
            fontWeight="medium"
            color="text.secondary"
            maxW="500px"
          >
            Takes less than a minute to get started. Join thousands of Survivor fans competing in fantasy leagues!
          </Text>

          {/* CTA Buttons */}
          <Flex
            gap={4}
            direction={{ base: 'column', sm: 'row' }}
            align="center"
          >
            <Link href="/sign-up">
              <Button
                size="md"
                bg="brand.primary"
                color="text.button"
                boxShadow="0px 4px 0px 0px #C34322"
                h="48px"
                px={6}
                borderRadius="full"
                fontFamily="heading"
                gap={2}
                _hover={{ bg: '#E85A3A' }}
                _active={{ transform: 'translateY(4px)', boxShadow: 'none' }}
              >
                <Image src="/landing/icon-users.svg" alt="" w="14px" h="14px" filter="brightness(0)" />
                Join a League
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                size="md"
                bg="rgba(248, 246, 242, 0.05)"
                color="text.primary"
                boxShadow="0px 4px 0px 0px #0C0E12"
                h="48px"
                px={6}
                borderRadius="full"
                fontFamily="heading"
                gap={2}
                _hover={{ bg: 'rgba(248, 246, 242, 0.1)' }}
                _active={{ transform: 'translateY(4px)', boxShadow: 'none' }}
              >
                <Image src="/landing/icon-plus.svg" alt="" w="14px" h="14px" />
                Create a League
              </Button>
            </Link>
          </Flex>

          {/* Feature Pills */}
          <HStack gap={3} flexWrap="wrap" justify="center">
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
