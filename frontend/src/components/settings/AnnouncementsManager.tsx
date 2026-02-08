'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  Checkbox,
  Spinner,
  useToast,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { api } from '@/lib/api';
import { RichTextEditor } from '../common/RichTextEditor';
import { RichTextDisplay } from '../common/RichTextDisplay';
import type { CommissionerMessage } from '@/types/api';

interface AnnouncementsManagerProps {
  leagueId: string;
}

export function AnnouncementsManager({ leagueId }: AnnouncementsManagerProps) {
  const toast = useToast();
  const [messages, setMessages] = useState<CommissionerMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New message form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<any>(null);
  const [contentPlain, setContentPlain] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState<any>(null);
  const [editContentPlain, setEditContentPlain] = useState('');
  const [editIsPinned, setEditIsPinned] = useState(false);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getCommissionerMessages(leagueId);
      setMessages(response.messages);
    } catch (err: any) {
      toast({
        title: 'Failed to load announcements',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [leagueId, toast]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleCreateMessage = async () => {
    if (!title.trim() || !contentPlain.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Title and message content are required',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      setSaving(true);
      await api.createCommissionerMessage(leagueId, {
        title: title.trim(),
        content: content || { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: contentPlain }] }] },
        contentPlain: contentPlain.trim(),
        isPinned,
        sendEmail,
      });

      toast({
        title: 'Announcement created',
        description: sendEmail ? 'Message posted and emails sent to members' : 'Message posted successfully',
        status: 'success',
        duration: 3000,
      });

      // Reset form
      setTitle('');
      setContent(null);
      setContentPlain('');
      setIsPinned(false);
      setSendEmail(false);
      setShowForm(false);

      // Reload messages
      await loadMessages();
    } catch (err: any) {
      toast({
        title: 'Failed to create announcement',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (message: CommissionerMessage) => {
    setEditingId(message.id);
    setEditTitle(message.title);
    setEditContent(message.content);
    setEditContentPlain(message.contentPlain);
    setEditIsPinned(message.isPinned);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent(null);
    setEditContentPlain('');
    setEditIsPinned(false);
  };

  const handleUpdateMessage = async (messageId: string) => {
    if (!editTitle.trim() || !editContentPlain.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Title and message content are required',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      setSaving(true);
      await api.updateCommissionerMessage(leagueId, messageId, {
        title: editTitle.trim(),
        content: editContent,
        contentPlain: editContentPlain.trim(),
        isPinned: editIsPinned,
      });

      toast({
        title: 'Announcement updated',
        status: 'success',
        duration: 2000,
      });

      handleCancelEdit();
      await loadMessages();
    } catch (err: any) {
      toast({
        title: 'Failed to update announcement',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePin = async (message: CommissionerMessage) => {
    try {
      await api.updateCommissionerMessage(leagueId, message.id, {
        isPinned: !message.isPinned,
      });
      await loadMessages();
      toast({
        title: message.isPinned ? 'Unpinned' : 'Pinned',
        status: 'success',
        duration: 2000,
      });
    } catch (err: any) {
      toast({
        title: 'Failed to update',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await api.deleteCommissionerMessage(leagueId, messageId);
      toast({
        title: 'Announcement deleted',
        status: 'success',
        duration: 2000,
      });
      await loadMessages();
    } catch (err: any) {
      toast({
        title: 'Failed to delete announcement',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <VStack py={10}>
        <Spinner size="lg" color="brand.primary" />
        <Text color="text.secondary">Loading announcements...</Text>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      <HStack justify="space-between">
        <VStack align="flex-start" gap={1}>
          <Heading size="md">Announcements</Heading>
          <Text color="text.secondary" fontSize="sm">
            Post messages to your league members. Pinned messages appear first on the dashboard.
          </Text>
        </VStack>
        {!showForm && (
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
          >
            New Announcement
          </Button>
        )}
      </HStack>

      {/* New Message Form */}
      {showForm && (
        <Box
          bg="bg.secondary"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="lg"
          p={6}
        >
          <VStack align="stretch" gap={4}>
            <Heading size="sm">New Announcement</Heading>

            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Message</FormLabel>
              <RichTextEditor
                content={content}
                onChange={(json, plain) => {
                  setContent(json);
                  setContentPlain(plain);
                }}
                placeholder="Write your announcement..."
              />
            </FormControl>

            <HStack gap={6}>
              <Checkbox
                isChecked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                colorScheme="orange"
              >
                <Text fontSize="sm">Pin to top of dashboard</Text>
              </Checkbox>
              <Checkbox
                isChecked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                colorScheme="orange"
              >
                <Text fontSize="sm">Email to members</Text>
              </Checkbox>
            </HStack>

            {sendEmail && (
              <Box bg="bg.tertiary" p={3} borderRadius="md">
                <Text fontSize="sm" color="text.secondary">
                  Members with commissioner message notifications enabled will receive an email.
                </Text>
              </Box>
            )}

            <HStack justify="flex-end" gap={3}>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setTitle('');
                  setContent(null);
                  setContentPlain('');
                  setIsPinned(false);
                  setSendEmail(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateMessage}
                isLoading={saving}
                isDisabled={!title.trim() || !contentPlain.trim()}
              >
                Post Announcement
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}

      <Divider />

      {/* Messages List */}
      {messages.length === 0 ? (
        <Box
          bg="bg.secondary"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="lg"
          p={8}
          textAlign="center"
        >
          <Text color="text.secondary">
            No announcements yet. Create your first announcement to communicate with your league!
          </Text>
        </Box>
      ) : (
        <VStack align="stretch" gap={4}>
          {messages.map((message) => (
            <Box
              key={message.id}
              bg="bg.secondary"
              border="1px solid"
              borderColor={message.isPinned ? 'rgba(240, 101, 66, 0.3)' : 'border.subtle'}
              borderRadius="lg"
              p={5}
            >
              {editingId === message.id ? (
                <VStack align="stretch" gap={4}>
                  <FormControl isRequired>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Message</FormLabel>
                    <RichTextEditor
                      content={editContent}
                      onChange={(json, plain) => {
                        setEditContent(json);
                        setEditContentPlain(plain);
                      }}
                    />
                  </FormControl>

                  <Checkbox
                    isChecked={editIsPinned}
                    onChange={(e) => setEditIsPinned(e.target.checked)}
                    colorScheme="orange"
                  >
                    <Text fontSize="sm">Pin to top of dashboard</Text>
                  </Checkbox>

                  <HStack justify="flex-end" gap={3}>
                    <Button variant="ghost" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleUpdateMessage(message.id)}
                      isLoading={saving}
                    >
                      Save Changes
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                <>
                  <HStack justify="space-between" align="flex-start" mb={3}>
                    <VStack align="flex-start" gap={1}>
                      <HStack gap={2}>
                        <Heading size="sm" color="text.primary">
                          {message.title}
                        </Heading>
                        {message.isPinned && (
                          <Badge
                            bg="rgba(240, 101, 66, 0.15)"
                            color="brand.primary"
                            fontSize="xs"
                          >
                            Pinned
                          </Badge>
                        )}
                        {message.emailSent && (
                          <Badge
                            bg="rgba(107, 126, 203, 0.15)"
                            color="accent.blue"
                            fontSize="xs"
                          >
                            Emailed
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="text.tertiary">
                        By {message.author.name || message.author.email} &middot;{' '}
                        {new Date(message.createdAt).toLocaleDateString()}
                      </Text>
                    </VStack>

                    <Menu>
                      <MenuButton
                        as={IconButton}
                        aria-label="Actions"
                        icon={<MoreIcon />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList bg="bg.secondary" borderColor="border.subtle">
                        <MenuItem
                          bg="bg.secondary"
                          _hover={{ bg: 'bg.tertiary' }}
                          onClick={() => handleStartEdit(message)}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          bg="bg.secondary"
                          _hover={{ bg: 'bg.tertiary' }}
                          onClick={() => handleTogglePin(message)}
                        >
                          {message.isPinned ? 'Unpin' : 'Pin'}
                        </MenuItem>
                        <MenuItem
                          bg="bg.secondary"
                          _hover={{ bg: 'bg.tertiary' }}
                          color="red.400"
                          onClick={() => handleDeleteMessage(message.id)}
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>

                  <Box color="text.secondary">
                    <RichTextDisplay content={message.content} />
                  </Box>
                </>
              )}
            </Box>
          ))}
        </VStack>
      )}
    </VStack>
  );
}

function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}
