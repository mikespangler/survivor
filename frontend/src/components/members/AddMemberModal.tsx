'use client';

import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
} from '@chakra-ui/react';
import type { AddMemberModalProps } from './types';

export function AddMemberModal({
  isOpen,
  onClose,
  onSearch,
  onAddMember,
  searchResults,
  searching,
}: AddMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleAdd = async (userId: string) => {
    await onAddMember(userId);
    setSearchQuery('');
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="gray.800">
        <ModalHeader color="white">Add Member to League</ModalHeader>
        <ModalBody>
          <VStack gap={4} align="stretch">
            <FormControl>
              <FormLabel color="gray.300">Search for user by name or email</FormLabel>
              <HStack>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter name or email..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                  _placeholder={{ color: 'gray.400' }}
                />
                <Button onClick={handleSearch} isLoading={searching}>
                  Search
                </Button>
              </HStack>
            </FormControl>

            {searchResults.length > 0 && (
              <VStack align="stretch" gap={2}>
                <Text fontWeight="bold" color="white">Results:</Text>
                {searchResults.map((user) => (
                  <HStack
                    key={user.id}
                    p={3}
                    bg="gray.700"
                    borderRadius="md"
                    justify="space-between"
                  >
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium" color="white">{user.name || 'No name'}</Text>
                      <Text fontSize="sm" color="gray.400">
                        {user.email}
                      </Text>
                    </VStack>
                    <Button size="sm" colorScheme="brand" onClick={() => handleAdd(user.id)}>
                      Add
                    </Button>
                  </HStack>
                ))}
              </VStack>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
