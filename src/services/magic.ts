import { Magic } from '@magic-sdk/admin';
import { config } from '../config';
import { UnauthorizedException, NotFoundException, ExternalServiceException } from '../common/exception/AppException';

class MagicService {
  private magic: Magic;

  constructor() {
    this.magic = new Magic(config.magic.secretKey);
  }

  async validateDIDToken(didToken: string) {
    try {
      console.log('Validating DID token...');
      
      // Validate token first
      this.magic.token.validate(didToken);
      console.log('Token validation passed');
      
      // Decode the token using Magic SDK
      const claim = this.magic.token.decode(didToken);
      console.log('Magic token claim:', JSON.stringify(claim, null, 2));
      
      // Extract user data from the decoded claim
      if (Array.isArray(claim) && claim.length >= 2) {
        const payload = claim[1] as any;
        const issuer = payload.claim?.iss || payload.iss || null;
        
        // Fetch additional user metadata including email
        let email = null;
        try {
          const metadata = await this.magic.users.getMetadataByIssuer(issuer);
          email = metadata.email;
        } catch (metadataError) {
          console.warn('Could not fetch user metadata:', metadataError);
        }
        
        return {
          userId: issuer,
          email: email,
          walletAddress: issuer ? issuer.replace('did:ethr:', '') : null,
          // Additional data from token
          subject: payload.claim?.sub || payload.sub || null,
          audience: payload.claim?.aud || payload.aud || null,
          issuedAt: payload.claim?.iat || payload.iat || null,
          expiresAt: payload.claim?.ext || payload.ext || null,
          notBefore: payload.nbf || null,
          tokenId: payload.tid || null,
          additionalData: payload.add || null
        };
      }
      
      throw new UnauthorizedException('Invalid token structure');
      
    } catch (error) {
      console.error('Magic validation error:', error);
      const rawMessage = error instanceof Error ? error.message : String(error);
      const normalized = rawMessage.toUpperCase();
      
      // Map Magic SDK errors to customer-friendly messages and appropriate codes
      if (normalized.includes('ERROR_SECRET_API_KEY_MISSING') || normalized.includes('API KEY MISSING')) {
        throw new ExternalServiceException('Authentication service is temporarily unavailable. Please try again later.');
      }
      if (normalized.includes('ERROR_MALFORMED_TOKEN') || normalized.includes('MALFORMED') || normalized.includes('INVALID TOKEN')) {
        throw new UnauthorizedException('The provided DID token is invalid.');
      }
      if (normalized.includes('ERROR_TOKEN_EXPIRED') || normalized.includes('EXPIRED')) {
        throw new UnauthorizedException('The DID token has expired. Please sign in again.');
      }
      // Default fallback
      throw new UnauthorizedException('Unable to verify DID token.');
    }
  }

  async getUserMetadata(userId: string) {
    try {
      const metadata = await this.magic.users.getMetadataByIssuer(userId);
      return metadata;
    } catch (error) {
      throw new NotFoundException(error instanceof Error ? error.message : 'User not found');
    }
  }
}

export default new MagicService();
