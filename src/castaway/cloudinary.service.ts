import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File, identifier: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const baseFolder = process.env.CLOUDINARY_FOLDER || 'survivor';

      // Determine if this is a team logo or castaway image
      const isTeamLogo = identifier.startsWith('teams/');

      // Set up transformations for team logos
      const transformation = isTeamLogo ? [
        { width: 400, height: 400, crop: 'fill', gravity: 'auto' }, // Square crop
        { radius: 24 }, // Rounded corners (24px for 400x400 image = 6% radius)
        { quality: 'auto', fetch_format: 'auto' }, // Optimization
      ] : undefined;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `${baseFolder}/${isTeamLogo ? '' : 'castaways'}`,
          public_id: isTeamLogo ? identifier.replace('teams/', 'team_') : `castaway_${identifier}`,
          overwrite: true,
          resource_type: 'image',
          transformation,
        },
        (error, result) => {
          if (error) return reject(new InternalServerErrorException('Upload failed'));
          resolve(result.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const publicId = this.extractPublicId(imageUrl);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  }

  private extractPublicId(url: string): string | null {
    const matches = url.match(/\/([^\/]+)\.[^\.]+$/);
    return matches ? `${process.env.CLOUDINARY_FOLDER}/${matches[1]}` : null;
  }
}
