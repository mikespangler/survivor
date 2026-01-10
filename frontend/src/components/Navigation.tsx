'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Button, 
  IconButton,
  HStack,
  VStack,
  Container,
  Text,
} from '@chakra-ui/react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isSignedIn, isLoaded, user } = useUser();
  const pathname = usePathname();

  // Check if we're on the landing page (home page when not signed in)
  const isLandingPage = pathname === '/' && !isSignedIn;

  useEffect(() => {
    let isActive = true;

    const loadCurrentUser = async () => {
      if (!isLoaded) return;
      if (!isSignedIn) {
        setIsAdmin(false);
        return;
      }

      try {
        const currentUser = await api.getCurrentUser();
        if (isActive) {
          setIsAdmin(currentUser.systemRole === 'admin');
        }
      } catch (error) {
        if (isSignedIn) {
          console.error('Failed to fetch current user info', error);
        }
        if (isActive) {
          setIsAdmin(false);
        }
      }
    };

    void loadCurrentUser();

    return () => {
      isActive = false;
    };
  }, [isSignedIn, isLoaded]);

  // Handle scroll for transparent nav effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    if (isLandingPage) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isLandingPage]);
  
  const onToggle = () => setIsOpen(!isOpen);

  // Dynamic styles based on landing page and scroll state
  const navBg = isLandingPage && !isScrolled 
    ? 'transparent' 
    : 'bg.secondary';
  
  const navBorder = isLandingPage && !isScrolled
    ? 'transparent'
    : 'border.default';

  const backdropFilter = isLandingPage ? 'blur(12px)' : 'none';

  return (
    <Box 
      as="nav" 
      bg={navBg}
      backdropFilter={backdropFilter}
      borderBottom={isLandingPage && !isScrolled ? 'none' : '2px solid'}
      borderColor={navBorder}
      position={isLandingPage ? 'fixed' : 'sticky'}
      top="0" 
      left="0"
      right="0"
      zIndex="50"
      transition="all 0.3s ease"
    >
      <Container maxW="1400px" px={{ base: 4, lg: 5 }}>
        <Flex h={{ base: '64px', lg: '80px' }} alignItems="center" justifyContent="space-between">
          {/* Logo */}
          <Link href="/">
            <HStack gap={2} cursor="pointer">
              <Text fontSize="2xl">🔥</Text>
              <VStack align="start" gap={0} display={{ base: 'none', sm: 'flex' }}>
                <Text 
                  fontFamily="heading" 
                  fontSize="lg" 
                  color="text.primary"
                  letterSpacing="-0.5px"
                  lineHeight="1.1"
                >
                  SURVIVOR
                </Text>
                <Text 
                  fontFamily="heading" 
                  fontSize="xs" 
                  color="brand.primary"
                  letterSpacing="0.3px"
                >
                  FANTASY LEAGUE
                </Text>
              </VStack>
            </HStack>
          </Link>

          {/* Desktop Navigation Links - Show on landing page */}
          {isLandingPage && (
            <HStack gap={1} display={{ base: 'none', md: 'flex' }}>
              <NavLink href="#how-it-works">How It Works</NavLink>
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#rules">Rules</NavLink>
            </HStack>
          )}

          {/* Desktop Navigation Links - Show when signed in */}
          {isSignedIn && (
            <HStack gap={8} display={{ base: 'none', md: 'flex' }}>
              <Link href="/leagues">
                <Text color="text.muted" _hover={{ color: 'text.primary' }} fontWeight="medium">
                  Leagues
                </Text>
              </Link>
              {isAdmin && (
                <Link href="/admin">
                  <Button size="sm" variant="secondary">
                    Admin
                  </Button>
                </Link>
              )}
            </HStack>
          )}

          {/* Auth Buttons */}
          <HStack gap={3} display={{ base: 'none', md: 'flex' }}>
            {!isLoaded ? (
              <Box w="200px" h="32px" />
            ) : isSignedIn ? (
              <>
                <Text fontSize="sm" color="text.muted">
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                </Text>
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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    color="text.primary"
                    fontFamily="display"
                    fontWeight="bold"
                  >
                    Login
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button 
                    bg="brand.primary"
                    color="text.button"
                    size="sm"
                    fontFamily="heading"
                    boxShadow="0px 4px 0px 0px #C34322"
                    borderRadius="12px"
                    _hover={{ bg: '#E85A3A' }}
                    _active={{ transform: 'translateY(2px)', boxShadow: 'none' }}
                  >
                    Join a League
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
            color="text.primary"
          >
            {isOpen ? '✕' : '☰'}
          </IconButton>
        </Flex>

        {/* Mobile Menu */}
        {isOpen && (
          <Box 
            pb={4} 
            display={{ md: 'none' }} 
            borderTop="1px solid"
            borderColor="border.default"
            bg="bg.secondary"
          >
            <VStack gap={4} align="stretch" mt={4}>
              {isLandingPage && (
                <>
                  <Link href="#how-it-works" onClick={onToggle}>
                    <Box fontWeight="medium" color="text.muted" px={4} py={2}>
                      How It Works
                    </Box>
                  </Link>
                  <Link href="#features" onClick={onToggle}>
                    <Box fontWeight="medium" color="text.muted" px={4} py={2}>
                      Features
                    </Box>
                  </Link>
                  <Link href="#rules" onClick={onToggle}>
                    <Box fontWeight="medium" color="text.muted" px={4} py={2}>
                      Rules
                    </Box>
                  </Link>
                </>
              )}
              {isSignedIn && (
                <>
                  <Link href="/leagues" onClick={onToggle}>
                    <Box fontWeight="medium" color="text.muted" px={4} py={2}>
                      Leagues
                    </Box>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={onToggle}>
                      <Box
                        fontWeight="medium"
                        color="brand.primary"
                        px={4}
                        py={2}
                        bg="rgba(240, 101, 66, 0.1)"
                        borderRadius="md"
                        mx={4}
                      >
                        Admin Dashboard
                      </Box>
                    </Link>
                  )}
                </>
              )}
              <VStack gap={2} px={4} pt={2}>
                {!isLoaded ? (
                  <Box w="full" h="80px" />
                ) : isSignedIn ? (
                  <HStack w="full" justifyContent="space-between">
                    <Text fontSize="sm" color="text.muted">
                      {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                    </Text>
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
                      <Button variant="ghost" w="full">
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button variant="primary" w="full">
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

// Navigation link component for landing page
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href}>
    <Box
      px={4}
      py={2}
      borderRadius="12px"
      color="text.muted"
      fontFamily="display"
      fontWeight="bold"
      fontSize="sm"
      _hover={{ color: 'text.primary' }}
      transition="color 0.2s"
    >
      {children}
    </Box>
  </Link>
);

export default Navigation;
