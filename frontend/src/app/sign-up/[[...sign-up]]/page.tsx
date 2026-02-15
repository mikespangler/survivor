import { SignUp } from '@clerk/nextjs';
import { Box } from '@chakra-ui/react';

export default function SignUpPage() {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="bg.primary"
    >
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-none',
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/?signup=1"
        fallbackRedirectUrl="/"
      />
    </Box>
  );
}
