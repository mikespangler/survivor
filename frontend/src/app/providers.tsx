'use client';

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ApiProvider } from "@/components/ApiProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ApiProvider>
        {children}
      </ApiProvider>
    </ChakraProvider>
  );
}

