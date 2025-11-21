import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { clerkClient, verifyToken } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkService {
  constructor(private configService: ConfigService) {}

  async verifyToken(token: string) {
    try {
      const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
      
      if (!secretKey) {
        throw new UnauthorizedException('Clerk secret key not configured');
      }

      // Decode the JWT to extract the issuer without verification
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );
      const issuer = payload.iss;

      // Verify the JWT token with Clerk
      const decoded = await verifyToken(token, {
        secretKey,
        issuer,
      });

      return decoded;
    } catch (error) {
      console.error('Token verification error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUserFromClerk(userId: string) {
    try {
      const user = await clerkClient.users.getUser(userId);
      return {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || null,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to fetch user from Clerk');
    }
  }
}

