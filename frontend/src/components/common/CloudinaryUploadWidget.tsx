'use client';

import { useEffect } from 'react';
import { Button } from '@chakra-ui/react';

declare global {
  interface Window {
    cloudinary: any;
  }
}

interface CloudinaryUploadWidgetProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  onUploadError?: (error: any) => void;
  buttonText?: string;
  isLoading?: boolean;
}

export function CloudinaryUploadWidget({
  onUploadSuccess,
  onUploadError,
  buttonText = 'Upload Logo',
  isLoading = false,
}: CloudinaryUploadWidgetProps) {
  useEffect(() => {
    // Load Cloudinary script if not already loaded
    if (!document.getElementById('cloudinary-upload-widget')) {
      const script = document.createElement('script');
      script.id = 'cloudinary-upload-widget';
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const openWidget = () => {
    if (typeof window === 'undefined' || !window.cloudinary) {
      console.error('Cloudinary widget not loaded');
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'camera'],
        multiple: false,
        maxFileSize: 5000000, // 5MB
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        cropping: true, // Enable cropping
        croppingAspectRatio: 1, // Square crop (1:1)
        croppingShowDimensions: true,
        croppingCoordinatesMode: 'custom',
        showSkipCropButton: false, // Force cropping
        croppingDefaultSelectionRatio: 1,
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#FF6B35',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#FF6B35',
            action: '#FF6B35',
            inactiveTabIcon: '#999999',
            error: '#F44235',
            inProgress: '#0078FF',
            complete: '#20B832',
            sourceBg: '#FFFFFF',
          },
        },
      },
      (error: any, result: any) => {
        if (error && onUploadError) {
          onUploadError(error);
          return;
        }

        if (result.event === 'success') {
          onUploadSuccess(result.info.secure_url, result.info.public_id);
        }
      }
    );

    widget.open();
  };

  return (
    <Button onClick={openWidget} isLoading={isLoading} colorScheme="brand">
      {buttonText}
    </Button>
  );
}
