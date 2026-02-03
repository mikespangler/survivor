/**
 * Cloudinary utility functions for image optimization and delivery
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dm2gfa9t8';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}`;

export interface CloudinaryTransformation {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'limit';
  gravity?: 'auto' | 'center' | 'face' | 'faces';
  fetchFormat?: 'auto';
}

/**
 * Generates a Cloudinary URL with transformations
 */
export function getCloudinaryUrl(
  publicId: string,
  transformations: CloudinaryTransformation = {}
): string {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity,
    fetchFormat = 'auto',
  } = transformations;

  const parts: string[] = [];

  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (crop) parts.push(`c_${crop}`);
  if (gravity) parts.push(`g_${gravity}`);
  if (quality) parts.push(`q_${quality}`);
  if (format !== 'auto') parts.push(`f_${format}`);
  if (fetchFormat) parts.push(`f_${fetchFormat}`);

  const transformString = parts.length > 0 ? parts.join(',') : '';

  return transformString
    ? `${CLOUDINARY_BASE_URL}/image/upload/${transformString}/${publicId}`
    : `${CLOUDINARY_BASE_URL}/image/upload/${publicId}`;
}

/**
 * Generates responsive hero background URLs for different viewports
 */
export function getHeroBackgroundUrls() {
  const publicId = 'hero-background';

  return {
    mobile: getCloudinaryUrl(publicId, {
      width: 768,
      quality: 'auto',
      format: 'auto',
    }),
    tablet: getCloudinaryUrl(publicId, {
      width: 1280,
      quality: 'auto',
      format: 'auto',
    }),
    desktop: getCloudinaryUrl(publicId, {
      width: 2560,
      quality: 'auto',
      format: 'auto',
    }),
    ultraWide: getCloudinaryUrl(publicId, {
      width: 3840,
      quality: 'auto',
      format: 'auto',
    }),
  };
}

/**
 * Generates a srcSet string for responsive images
 */
export function generateSrcSet(urls: ReturnType<typeof getHeroBackgroundUrls>): string {
  return [
    `${urls.mobile} 768w`,
    `${urls.tablet} 1280w`,
    `${urls.desktop} 2560w`,
    `${urls.ultraWide} 3840w`,
  ].join(', ');
}
