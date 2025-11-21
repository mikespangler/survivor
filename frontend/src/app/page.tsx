'use client';

import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useUser } from '@clerk/nextjs';

export default function Home() {
  const { isSignedIn, user } = useUser();

  return (
    <Box as="main" minH="100vh" bg="gray.50">
      <Container maxW="container.md" py={20}>
        <VStack gap={6} align="center" textAlign="center">
          <Heading as="h1" size="2xl">
            Welcome{isSignedIn && user ? `, ${user.firstName || user.emailAddresses[0]?.emailAddress}` : ''}!
          </Heading>
          
          {isSignedIn ? (
            <Text fontSize="lg" color="gray.600">
              You are signed in. Use the navigation to access features.
            </Text>
          ) : (
            <Text fontSize="lg" color="gray.600">
              Click "Sign In" or "Get Started" in the navigation to authenticate.
            </Text>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
