'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Button, 
  IconButton,
  HStack,
  VStack,
  Container,
} from '@chakra-ui/react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isSignedIn, user } = useUser();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const onToggle = () => setIsOpen(!isOpen);

  return (
    <Box as="nav" bg="white" shadow="md" position="sticky" top="0" zIndex="50">
      <Container maxW="container.xl">
        <Flex h="16" alignItems="center" justifyContent="space-between">
          {/* Logo */}
          <Link href="/">
            <HStack gap={2} cursor="pointer">
              <Box fontSize="2xl" fontWeight="bold">🔥</Box>
              <Box fontSize="xl" fontWeight="bold" color="gray.900">
                Survivor League
              </Box>
            </HStack>
          </Link>

          {/* Desktop Navigation */}
          <HStack gap={8} display={{ base: 'none', md: 'flex' }}>
            <Link href="/leagues">
              <Box fontWeight="medium" color="gray.700" _hover={{ color: 'orange.600' }}>
                Leagues
              </Box>
            </Link>
            <Link href="/seasons">
              <Box fontWeight="medium" color="gray.700" _hover={{ color: 'orange.600' }}>
                Seasons
              </Box>
            </Link>
            <Link href="/about">
              <Box fontWeight="medium" color="gray.700" _hover={{ color: 'orange.600' }}>
                About
              </Box>
            </Link>
          </HStack>

          {/* Auth Buttons */}
          <HStack gap={4} display={{ base: 'none', md: 'flex' }}>
            {!mounted ? (
              // Render placeholder during SSR/initial mount to avoid hydration mismatch
              <Box w="200px" h="32px" />
            ) : isSignedIn ? (
              <>
                <Box fontSize="sm" color="gray.700">
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                </Box>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="outline" colorScheme="orange" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button colorScheme="orange" size="sm">
                    Get Started
                  </Button>
                </SignUpButton>
              </>
            )}
          </HStack>

          {/* Mobile Menu Button */}
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onToggle}
            variant="ghost"
            aria-label="Toggle Navigation"
          >
            {isOpen ? '✕' : '☰'}
          </IconButton>
        </Flex>

        {/* Mobile Menu */}
        {isOpen && (
          <Box pb={4} display={{ md: 'none' }} borderTopWidth="1px">
            <VStack gap={4} align="stretch" mt={4}>
              <Link href="/leagues" onClick={onToggle}>
                <Box fontWeight="medium" color="gray.700" px={4} py={2}>
                  Leagues
                </Box>
              </Link>
              <Link href="/seasons" onClick={onToggle}>
                <Box fontWeight="medium" color="gray.700" px={4} py={2}>
                  Seasons
                </Box>
              </Link>
              <Link href="/about" onClick={onToggle}>
                <Box fontWeight="medium" color="gray.700" px={4} py={2}>
                  About
                </Box>
              </Link>
              <VStack gap={2} px={4} pt={2}>
                {!mounted ? (
                  // Render placeholder during SSR/initial mount to avoid hydration mismatch
                  <Box w="full" h="80px" />
                ) : isSignedIn ? (
                  <HStack w="full" justifyContent="space-between">
                    <Box fontSize="sm" color="gray.700">
                      {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                    </Box>
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8"
                        }
                      }}
                    />
                  </HStack>
                ) : (
                  <>
                    <SignInButton mode="modal">
                      <Button variant="outline" colorScheme="orange" w="full">
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button colorScheme="orange" w="full">
                        Get Started
                      </Button>
                    </SignUpButton>
                  </>
                )}
              </VStack>
            </VStack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

