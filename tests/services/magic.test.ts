import magicService from '../../src/services/magic';

// Mock Magic SDK
jest.mock('@magic-sdk/admin', () => ({
  Magic: jest.fn().mockImplementation(() => ({
    token: {
      validate: jest.fn().mockResolvedValue(true),
    },
    users: {
      getMetadataByToken: jest.fn().mockResolvedValue({
        issuer: 'did:ethr:0x123',
        email: 'test@example.com',
        publicAddress: '0x123456789',
      }),
      getMetadataByIssuer: jest.fn().mockResolvedValue({
        issuer: 'did:ethr:0x123',
        email: 'test@example.com',
        publicAddress: '0x123456789',
      }),
    },
  })),
}));

describe('MagicService', () => {
  describe('validateDIDToken', () => {
    it('should validate a valid DID token', async () => {
      const result = await magicService.validateDIDToken('valid_token');

      expect(result.userId).toBe('did:ethr:0x123');
      expect(result.email).toBe('test@example.com');
      expect(result.walletAddress).toBe('0x123456789');
    });
  });

  describe('getUserMetadata', () => {
    it('should get user metadata successfully', async () => {
      const result = await magicService.getUserMetadata('did:ethr:0x123');

      expect(result.issuer).toBe('did:ethr:0x123');
      expect(result.email).toBe('test@example.com');
    });
  });
});
