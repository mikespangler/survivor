import { SignIn } from '@clerk/nextjs';
import { Box } from '@chakra-ui/react';

export default function SignInPage() {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="bg.primary"
    >
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-none',
          },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/"
        fallbackRedirectUrl="/"
      />
    </Box>
  );
}
