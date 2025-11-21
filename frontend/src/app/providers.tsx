'use client';

import { ChakraProvider } from "@chakra-ui/react";
import { ApiProvider } from "@/components/ApiProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider>
      <ApiProvider>
        {children}
      </ApiProvider>
    </ChakraProvider>
  );
}

