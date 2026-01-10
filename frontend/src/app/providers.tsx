'use client';

import { ChakraProvider } from "@chakra-ui/react";
import { ApiProvider } from "@/components/ApiProvider";
import { theme } from "@/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider theme={theme}>
      <ApiProvider>
        {children}
      </ApiProvider>
    </ChakraProvider>
  );
}
