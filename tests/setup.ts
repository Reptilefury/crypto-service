// Test setup file
process.env.NODE_ENV = 'test';
process.env.MAGIC_SECRET_KEY = 'test_magic_key';
process.env.RPC_URL = 'https://polygon-mumbai.g.alchemy.com/v2/test';
process.env.CHAIN_ID = '80001';
process.env.BICONOMY_BUNDLER_URL = 'https://bundler.biconomy.io/api/v2/80001/test';
process.env.BICONOMY_PAYMASTER_URL = 'https://paymaster.biconomy.io/api/v1/80001/test';
process.env.SAFE_SERVICE_URL = 'https://safe-transaction-mumbai.safe.global';

// Mock ethers globally - this gets hoisted by Jest
jest.mock('ethers', () => {
  const mockContract = {
    latestRoundData: jest.fn().mockResolvedValue([
      BigInt(1), // roundId
      BigInt(200000000000), // answer (price with 8 decimals)
      BigInt(1700000000), // startedAt
      BigInt(1700000000), // updatedAt
      BigInt(1), // answeredInRound
    ]),
    decimals: jest.fn().mockResolvedValue(8),
  };

  const mockEthers = {
    JsonRpcProvider: jest.fn().mockImplementation(() => ({})),
    Contract: jest.fn().mockImplementation(() => mockContract),
    getCreateAddress: jest.fn().mockReturnValue('0x1234567890abcdef1234567890abcdef12345678'),
    randomBytes: jest.fn().mockReturnValue(new Uint8Array(32).fill(1)),
    formatUnits: jest.fn().mockImplementation(() => '2000.00000000'),
    id: jest.fn().mockImplementation(() => '0x' + '1234567890abcdef'.repeat(4)),
    toUtf8Bytes: jest.fn().mockImplementation((text) => new Uint8Array(Buffer.from(text, 'utf8'))),
    parseUnits: jest.fn().mockImplementation((value, decimals) => BigInt(value) * BigInt(10 ** decimals)),
    parseEther: jest.fn().mockImplementation((value) => BigInt(value) * BigInt(10 ** 18)),
    formatEther: jest.fn().mockImplementation((value) => value.toString()),
    Interface: jest.fn().mockImplementation(() => ({
      encodeFunctionData: jest.fn().mockReturnValue('0xdata')
    }))
  };

  return {
    ...mockEthers,
    ethers: mockEthers,
    default: mockEthers
  };
});


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

// Mock @chainlink/functions-toolkit globally to prevent import errors
jest.mock('@chainlink/functions-toolkit', () => ({
  simulateScript: jest.fn(),
  decodeResult: jest.fn(),
  ReturnType: {
    uint256: 'uint256',
    string: 'string'
  }
}));

// Mock @biconomy/account globally
jest.mock('@biconomy/account', () => ({
  __esModule: true,
  BiconomySmartAccountV2: {
    create: jest.fn(),
  },
  PaymasterMode: {
    SPONSORED: 'SPONSORED',
  },
}));

