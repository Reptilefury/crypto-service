import magicService from '../../src/services/magic';

// Mock Magic SDK
jest.mock('@magic-sdk/admin', () => ({
  Magic: jest.fn().mockImplementation(() => ({
    token: {
      validate: jest.fn(),
    },
    users: {
      getMetadataByToken: jest.fn(),
      getMetadataByIssuer: jest.fn(),
    },
  })),
}));

describe('MagicService', () => {
  describe('validateDIDToken', () => {
    it('should validate a valid DID token', async () => {
      const mockMetadata = {
        issuer: 'did:ethr:0x123',
        email: 'test@example.com',
        publicAddress: '0x123456789',
      };

      // Mock the Magic SDK methods
      const mockMagic = require('@magic-sdk/admin').Magic;
      const mockInstance = new mockMagic();
      mockInstance.token.validate.mockResolvedValue(true);
      mockInstance.users.getMetadataByToken.mockResolvedValue(mockMetadata);

      const result = await magicService.validateDIDToken('valid_token');

      expect(result.isValid).toBe(true);
      expect(result.userId).toBe(mockMetadata.issuer);
      expect(result.email).toBe(mockMetadata.email);
      expect(result.walletAddress).toBe(mockMetadata.publicAddress);
    });

    it('should handle invalid DID token', async () => {
      const mockMagic = require('@magic-sdk/admin').Magic;
      const mockInstance = new mockMagic();
      mockInstance.token.validate.mockRejectedValue(new Error('Invalid token'));

      const result = await magicService.validateDIDToken('invalid_token');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid token');
    });
  });

  describe('getUserMetadata', () => {
    it('should get user metadata successfully', async () => {
      const mockMetadata = {
        issuer: 'did:ethr:0x123',
        email: 'test@example.com',
        publicAddress: '0x123456789',
      };

      const mockMagic = require('@magic-sdk/admin').Magic;
      const mockInstance = new mockMagic();
      mockInstance.users.getMetadataByIssuer.mockResolvedValue(mockMetadata);

      const result = await magicService.getUserMetadata('did:ethr:0x123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMetadata);
    });

    it('should handle error when getting user metadata', async () => {
      const mockMagic = require('@magic-sdk/admin').Magic;
      const mockInstance = new mockMagic();
      mockInstance.users.getMetadataByIssuer.mockRejectedValue(new Error('User not found'));

      const result = await magicService.getUserMetadata('invalid_user');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });
  });
});
