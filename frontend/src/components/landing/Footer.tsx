'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  SimpleGrid,
  Image,
} from '@chakra-ui/react';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import Link from 'next/link';

const footerLinks = {
  Product: [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Create a League', href: '/leagues/create' },
    { label: 'Join a League', href: '/sign-up' },
  ],
  Account: [
    { label: 'Login', href: '/sign-in' },
    { label: 'Sign Up', href: '/sign-up' },
  ],
};

export const Footer = () => {
  return (
    <Box
      as="footer"
      bg="bg.secondary"
      borderTop="2px solid"
      borderColor="rgba(48, 53, 65, 0.5)"
      py={8}
      px={{ base: 4, lg: 5 }}
    >
      <Container maxW="1400px" px={4}>
        <VStack gap={6}>
          {/* Main Footer Content */}
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            gap={8}
            w="full"
            justify="space-between"
          >
            {/* Logo & Description */}
            <VStack align="start" gap={2} maxW="247px">
              <HStack gap={4}>
                <Image
                  src={getCloudinaryUrl('main-logo', { height: 144, crop: 'fit', format: 'png', trim: true })}
                  alt="Survivor Fantasy League"
                  h="48px"
                  w="auto"
                />
                <HStack gap={1}>
                  <Text
                    fontFamily="heading"
                    fontSize="16px"
                    fontWeight="bold"
                    color="brand.primary"
                    letterSpacing="1.5px"
                  >
                    OUTPICK
                  </Text>
                  <Text
                    fontFamily="heading"
                    fontSize="16px"
                    fontWeight="bold"
                    color="text.primary"
                    letterSpacing="1.5px"
                  >
                    OUTLAST
                  </Text>
                </HStack>
              </HStack>
              <Text
                fontFamily="body"
                fontSize="sm"
                fontWeight="medium"
                color="text.secondary"
                lineHeight="22.75px"
              >
                The ultimate fantasy league experience for Survivor fans.
              </Text>
            </VStack>

            {/* Link Columns */}
            <SimpleGrid columns={2} gap={12}>
              {Object.entries(footerLinks).map(([category, links]) => (
                <VStack key={category} align="start" gap={2}>
                  <Heading
                    as="h4"
                    fontFamily="display"
                    fontSize="md"
                    fontWeight="bold"
                    color="text.primary"
                    letterSpacing="-0.45px"
                  >
                    {category}
                  </Heading>
                  <VStack align="start" gap={1}>
                    {links.map((link) => (
                      <Link key={link.label} href={link.href}>
                        <Text
                          fontFamily="body"
                          fontSize="sm"
                          fontWeight="medium"
                          color="text.secondary"
                          _hover={{ color: 'text.primary' }}
                          transition="color 0.2s"
                        >
                          {link.label}
                        </Text>
                      </Link>
                    ))}
                  </VStack>
                </VStack>
              ))}
            </SimpleGrid>
          </Flex>

          {/* Bottom Bar */}
          <Box
            w="full"
            borderTop="2px solid"
            borderColor="rgba(48, 53, 65, 0.5)"
            pt={4}
          >
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align={{ base: 'start', md: 'center' }}
              gap={4}
            >
              <Text
                fontFamily="body"
                fontSize="sm"
                fontWeight="medium"
                color="text.secondary"
              >
                © 2025 Survivor Fantasy League. All rights reserved.
              </Text>
              <Box
                bg="rgba(43, 48, 59, 0.3)"
                borderRadius="full"
                px={4}
                py={2}
              >
                <Text
                  fontFamily="body"
                  fontSize="sm"
                  fontWeight="medium"
                  color="text.secondary"
                >
                  Not affiliated with CBS or Survivor.
                </Text>
              </Box>
            </Flex>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Footer;
