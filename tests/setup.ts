// Test setup file
process.env.NODE_ENV = 'test';
process.env.MAGIC_SECRET_KEY = 'test_magic_key';
process.env.RPC_URL = 'https://polygon-mumbai.g.alchemy.com/v2/test';
process.env.CHAIN_ID = '80001';
process.env.BICONOMY_BUNDLER_URL = 'https://bundler.biconomy.io/api/v2/80001/test';
process.env.BICONOMY_PAYMASTER_URL = 'https://paymaster.biconomy.io/api/v1/80001/test';
process.env.SAFE_SERVICE_URL = 'https://safe-transaction-mumbai.safe.global';

// Mock ethers globally
jest.mock('ethers', () => ({
  JsonRpcProvider: jest.fn().mockImplementation(() => ({})),
  getCreateAddress: jest.fn().mockReturnValue('0x1234567890abcdef1234567890abcdef12345678'),
  randomBytes: jest.fn().mockReturnValue(new Uint8Array(32).fill(1)),
}));

// Mock Magic SDK globally
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
