'use client';

import { useState, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Avatar,
  Text,
  useToast,
} from '@chakra-ui/react';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  isUploading?: boolean;
  maxSizeInMB?: number;
}

export function ImageUpload({
  currentImageUrl,
  onUpload,
  onDelete,
  isUploading = false,
  maxSizeInMB = 5,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Only JPG, PNG, and WebP images are allowed',
        status: 'error',
      });
      return;
    }

    // Validate file size
    if (file.size > maxSizeInMB * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: `Maximum file size is ${maxSizeInMB}MB`,
        status: 'error',
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    try {
      await onUpload(file);
      toast({ title: 'Image uploaded successfully', status: 'success' });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Please try again',
        status: 'error',
      });
      setPreview(currentImageUrl || null);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      await onDelete();
      setPreview(null);
      toast({ title: 'Image deleted', status: 'success' });
    } catch (error) {
      toast({ title: 'Delete failed', status: 'error' });
    }
  };

  return (
    <VStack spacing={4} align="start">
      <HStack spacing={4}>
        <Avatar size="xl" src={preview || undefined} />
        <VStack align="start" spacing={2}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            isLoading={isUploading}
          >
            {currentImageUrl ? 'Change Image' : 'Upload Image'}
          </Button>
          {currentImageUrl && onDelete && (
            <Button
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={handleDelete}
              isLoading={isUploading}
            >
              Delete Image
            </Button>
          )}
        </VStack>
      </HStack>
      <Text fontSize="sm" color="text.secondary">
        JPG, PNG, or WebP. Max {maxSizeInMB}MB.
      </Text>
    </VStack>
  );
}
