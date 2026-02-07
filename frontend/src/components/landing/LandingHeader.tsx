'use client';

import { Box, Container, HStack, Text, Button, Image } from '@chakra-ui/react';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import Link from 'next/link';

export const LandingHeader = () => {
  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={100}
      bg="rgba(20, 24, 31, 0.8)"
      backdropFilter="blur(8px)"
      borderBottom="1px solid"
      borderColor="rgba(48, 53, 65, 0.5)"
    >
      <Container maxW="1400px" px={4}>
        <HStack justify="space-between" h="64px">
          {/* Logo */}
          <HStack gap={4}>
            <Image
              src={getCloudinaryUrl('main-logo', { height: 96, crop: 'fit', format: 'png', trim: true })}
              alt="Survivor Fantasy League"
              h="32px"
              w="auto"
            />
            <HStack gap={1}>
              <Text
                fontFamily="heading"
                fontSize="14px"
                fontWeight="bold"
                color="brand.primary"
                letterSpacing="1.5px"
              >
                OUTPICK
              </Text>
              <Text
                fontFamily="heading"
                fontSize="14px"
                fontWeight="bold"
                color="text.primary"
                letterSpacing="1.5px"
              >
                OUTLAST
              </Text>
            </HStack>
          </HStack>

          {/* Login button */}
          <Link href="/sign-in">
            <Button
              variant="ghost"
              size="sm"
              color="brand.primary"
              _hover={{ bg: 'rgba(240, 101, 66, 0.1)' }}
            >
              Log in
            </Button>
          </Link>
        </HStack>
      </Container>
    </Box>
  );
};

export default LandingHeader;
