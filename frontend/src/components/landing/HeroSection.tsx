'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Flex,
  Image,
} from '@chakra-ui/react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getHeroBackgroundUrls, generateSrcSet } from '@/lib/cloudinary';

export const HeroSection = () => {
  const [activeSeasonNumber, setActiveSeasonNumber] = useState<number | null>(null);

  useEffect(() => {
    api
      .getActiveSeason()
      .then((season) => (season ? setActiveSeasonNumber(season.number) : null))
      .catch(() => {});
  }, []);

  return (
    <Box
      as="section"
      position="relative"
      minH="900px"
      bg="bg.primary"
      overflow="hidden"
      pt="80px"
    >
      {/* Background gradient (fallback) */}
      <Box
        position="absolute"
        inset={0}
        bgImage="radial-gradient(70.7% 141.4% at 50% 0%, rgba(38, 43, 54, 1) 0%, rgba(20, 24, 31, 1) 70%)"
        zIndex={0}
      />

      {/* Photo background layer */}
      <Box
        position="absolute"
        inset={0}
        zIndex={0}
        pointerEvents="none"
      >
        <Image
          src={getHeroBackgroundUrls().desktop}
          srcSet={generateSrcSet(getHeroBackgroundUrls())}
          sizes="100vw"
          alt=""
          position="absolute"
          inset={0}
          w="full"
          h="full"
          objectFit="cover"
          opacity={0.65}
          loading="eager"
          fetchPriority="high"
        />
        {/* Dark overlay to maintain brand darkness */}
        <Box
          position="absolute"
          inset={0}
          bg="rgba(20, 24, 31, 0.35)"
        />
      </Box>

      {/* Palm tree silhouette background */}
      <Box
        position="absolute"
        inset={0}
        zIndex={1}
        pointerEvents="none"
      >
        <Image
          src="/landing/hero-palms.svg"
          alt=""
          position="absolute"
          inset={0}
          w="full"
          h="full"
          objectFit="cover"
          opacity={0.3}
        />
      </Box>

      {/* Ambient glow effects */}
      <Box
        position="absolute"
        top="225px"
        left="40px"
        w="256px"
        h="256px"
        bg="rgba(240, 101, 66, 0.1)"
        borderRadius="full"
        filter="blur(100px)"
        pointerEvents="none"
        zIndex={1}
      />
      <Box
        position="absolute"
        bottom="225px"
        right="40px"
        w="320px"
        h="320px"
        bg="rgba(62, 88, 193, 0.2)"
        borderRadius="full"
        filter="blur(100px)"
        pointerEvents="none"
        zIndex={1}
      />
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="600px"
        h="600px"
        bg="rgba(240, 101, 66, 0.05)"
        borderRadius="full"
        filter="blur(100px)"
        pointerEvents="none"
        zIndex={1}
      />

      {/* Left Frond Decoration */}
      <Image
        src="/landing/frond-left.svg"
        alt=""
        position="absolute"
        left={{ base: '-5%', md: '-2%', lg: '4%' }}
        top={{ base: '5%', md: '6%', lg: '8%' }}
        w={{ base: '43px', md: '64px', lg: '86px' }}
        h={{ base: '129px', md: '193px', lg: '263px' }}
        transform="rotate(54.7deg)"
        pointerEvents="none"
        zIndex={2}
        opacity={{ base: 0.7, md: 0.85, lg: 1 }}
      />

      {/* Right Frond Decoration */}
      <Image
        src="/landing/frond-right.svg"
        alt=""
        position="absolute"
        right={{ base: '-8%', md: '-4%', lg: '3%' }}
        top={{ base: 'calc(50% - 64.5px)', md: 'calc(50% - 96.5px)', lg: 'calc(50% - 131.5px)' }}
        w={{ base: '43px', md: '64px', lg: '86px' }}
        h={{ base: '129px', md: '193px', lg: '263px' }}
        transform="translateY(-50%) rotate(-36.84deg)"
        pointerEvents="none"
        zIndex={2}
        opacity={{ base: 0.7, md: 0.85, lg: 1 }}
      />

      {/* Bottom gradient fade */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="128px"
        bgGradient="linear(to-t, #14181F 0%, rgba(20, 24, 31, 0.5) 34%, rgba(20, 24, 31, 0.25) 75%, transparent 100%)"
        zIndex={2}
      />

      {/* Content */}
      <Container
        maxW="1400px"
        px={{ base: 4, lg: '100px' }}
        position="relative"
        zIndex={3}
        h="full"
      >
        <VStack
          gap={0}
          align="center"
          justify="center"
          pt={{ base: '80px', md: '157px' }}
          pb={{ base: '100px', md: '157px' }}
        >
          {/* Season Badge */}
          <Badge
            bg="rgba(240, 101, 66, 0.05)"
            color="brand.primary"
            border="1px solid"
            borderColor="rgba(240, 101, 66, 0.2)"
            borderRadius="full"
            px={6}
            py={2.5}
            fontSize="sm"
            fontWeight="bold"
            fontFamily="body"
            display="flex"
            alignItems="center"
            gap={2}
            mb={8}
          >
            <Image src="/landing/icon-fire.svg" alt="" w="16px" h="16px" />
            {activeSeasonNumber != null
              ? `Season ${activeSeasonNumber} Now Live!`
              : 'Now Live!'}
          </Badge>

          {/* Main Headline */}
          <VStack gap={0} mb={4}>
            <Heading
              as="h1"
              fontFamily="heading"
              fontSize={{ base: '40px', md: '56px', lg: '72px' }}
              lineHeight={{ base: '48px', md: '64px', lg: '80px' }}
              letterSpacing="-2px"
              color="text.primary"
              textAlign="center"
              textTransform="uppercase"
            >
              A Survivor Fantasy League
            </Heading>
            <Text
              as="span"
              fontFamily="heading"
              fontSize={{ base: '40px', md: '56px', lg: '72px' }}
              lineHeight={{ base: '48px', md: '64px', lg: '80px' }}
              letterSpacing="-2px"
              textAlign="center"
              textTransform="uppercase"
              className="text-gradient-orange-purple"
            >
              You Play All Season
            </Text>
          </VStack>

          {/* Subheadline */}
          <Text
            fontFamily="body"
            fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}
            lineHeight="28px"
            fontWeight="medium"
            color="text.secondary"
            textAlign="center"
            maxW="672px"
            mb={8}
          >
            Draft castaways. Answer weekly questions. Compete for points. Join your
            friends in the ultimate Survivor experience!
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
                variant="primary"
                h="64px"
                px={10}
                borderRadius="20px"
                gap={2}
              >
                <Image src="/landing/icon-users.svg" alt="" w="16px" h="16px" filter="brightness(0)" />
                Join a League
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                size="lg"
                variant="secondary"
                h="64px"
                px={10}
                borderRadius="20px"
                gap={2}
              >
                <Image src="/landing/icon-plus.svg" alt="" w="16px" h="16px" />
                Create a League
              </Button>
            </Link>
          </Flex>

          {/* Feature Pills */}
          <HStack
            gap={6}
            flexWrap="wrap"
            justify="center"
          >
            <FeaturePill>Play with friends</FeaturePill>
            <FeaturePill>Custom leagues</FeaturePill>
            <FeaturePill>Free to play</FeaturePill>
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
      color="text.muted"
    >
      {children}
    </Text>
  </Box>
);

export default HeroSection;
