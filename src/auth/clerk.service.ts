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
        console.error('❌ CLERK_SECRET_KEY is not configured');
        throw new UnauthorizedException('Clerk secret key not configured');
      }

      console.log(
        '🔑 Clerk secret key found:',
        secretKey.substring(0, 10) + '...',
      );
      console.log('🔍 Verifying token (length:', token.length, ')');

      // Decode the JWT to extract the issuer without verification
      let payload;
      let issuer;
      try {
        payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString(),
        );
        issuer = payload.iss;
        console.log('📋 Token issuer:', issuer);
      } catch (decodeError) {
        console.error('❌ Failed to decode token:', decodeError);
        throw new UnauthorizedException('Invalid token format');
      }

      // Verify the JWT token with Clerk
      console.log('✅ Attempting to verify token with Clerk...');
      const decoded = await verifyToken(token, {
        secretKey,
        issuer,
      });

      console.log('✅ Token verified successfully. User ID:', decoded.sub);
      return decoded;
    } catch (error) {
      console.error('❌ Token verification error:', error);
      console.error('❌ Error name:', error?.name);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error stack:', error?.stack);
      throw new UnauthorizedException(error?.message || 'Invalid token');
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
      console.error('Failed to fetch user from Clerk:', error);
      throw new UnauthorizedException('Failed to fetch user from Clerk');
    }
  }
}
