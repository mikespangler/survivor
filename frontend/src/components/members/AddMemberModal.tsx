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
      <ModalContent>
        <ModalHeader>Add Member to League</ModalHeader>
        <ModalBody>
          <VStack gap={4} align="stretch">
            <FormControl>
              <FormLabel>Search for user by name or email</FormLabel>
              <HStack>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter name or email..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} isLoading={searching}>
                  Search
                </Button>
              </HStack>
            </FormControl>

            {searchResults.length > 0 && (
              <VStack align="stretch" gap={2}>
                <Text fontWeight="bold">Results:</Text>
                {searchResults.map((user) => (
                  <HStack
                    key={user.id}
                    p={3}
                    bg="bg.secondary"
                    borderRadius="md"
                    justify="space-between"
                  >
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">{user.name || 'No name'}</Text>
                      <Text fontSize="sm" color="text.secondary">
                        {user.email}
                      </Text>
                    </VStack>
                    <Button size="sm" onClick={() => handleAdd(user.id)}>
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
