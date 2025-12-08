import { Magic } from '@magic-sdk/admin';
import { config } from '../config';

class MagicService {
  private magic: Magic;

  constructor() {
    this.magic = new Magic(config.magic.secretKey);
  }

  async validateDIDToken(didToken: string) {
    try {
      this.magic.token.validate(didToken);
      const metadata = await this.magic.users.getMetadataByToken(didToken);
      
      return {
        isValid: true,
        userId: metadata.issuer,
        email: metadata.email,
        walletAddress: metadata.publicAddress
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid token'
      };
    }
  }

  async getUserMetadata(userId: string) {
    try {
      const metadata = await this.magic.users.getMetadataByIssuer(userId);
      return {
        success: true,
        data: metadata
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user metadata'
      };
    }
  }
}

export default new MagicService();
