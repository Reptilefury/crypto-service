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
      this.magic.token.validate(didToken);
      const metadata = await this.magic.users.getMetadataByToken(didToken);

      return {
        userId: metadata.issuer,
        email: metadata.email,
        walletAddress: metadata.publicAddress
      };
    } catch (error) {
      throw new UnauthorizedException(error instanceof Error ? error.message : 'Invalid token');
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
