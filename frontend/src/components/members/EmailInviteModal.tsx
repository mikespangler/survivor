'use client';

import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Textarea,
  Button,
  HStack,
} from '@chakra-ui/react';
import type { EmailInviteModalProps } from './types';

export function EmailInviteModal({
  isOpen,
  onClose,
  onSendInvites,
  sending,
}: EmailInviteModalProps) {
  const [emails, setEmails] = useState('');

  const handleSend = async () => {
    const emailList = emails
      .split(/[\n,]/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    await onSendInvites(emailList);
    setEmails('');
    onClose();
  };

  const handleClose = () => {
    setEmails('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent bg="gray.800">
        <ModalHeader color="white">Send Email Invites</ModalHeader>
        <ModalBody>
          <FormControl>
            <FormLabel color="gray.300">
              Email addresses (one per line or comma-separated)
            </FormLabel>
            <Textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="email1@example.com&#10;email2@example.com"
              rows={6}
              bg="gray.700"
              color="white"
              borderColor="gray.600"
              _placeholder={{ color: 'gray.400' }}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              colorScheme="brand"
              onClick={handleSend}
              isLoading={sending}
            >
              Send Invites
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
