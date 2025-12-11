// Global test setup with comprehensive mocks

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.MAGIC_SECRET_KEY = 'test_magic_key';
process.env.BICONOMY_BUNDLER_URL = 'https://test-bundler.biconomy.io';
process.env.BICONOMY_PAYMASTER_URL = 'https://test-paymaster.biconomy.io';
process.env.RPC_URL = 'https://test-rpc.polygon.io';
process.env.CHAINLINK_PRIVATE_KEY = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12';
process.env.CHAINLINK_FUNCTIONS_ROUTER = '0x1234567890123456789012345678901234567890';
process.env.CHAINLINK_FUNCTIONS_DON_ID = 'fun-polygon-mumbai-1';

// Mock ethers globally
jest.mock('ethers', () => ({
  providers: {
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      getNetwork: jest.fn().mockResolvedValue({ chainId: 137 }),
      getBalance: jest.fn().mockResolvedValue('1000000000000000000')
    }))
  },
  Wallet: jest.fn().mockImplementation(() => ({
    address: '0x123456789abcdef',
    connect: jest.fn().mockReturnThis()
  })),
  Contract: jest.fn().mockImplementation(() => ({
    latestRoundData: jest.fn().mockResolvedValue([
      '1', '200000000000', '1640995200', '1640995200', '1'
    ]),
    decimals: jest.fn().mockResolvedValue(8),
    balanceOf: jest.fn().mockResolvedValue('1000000'),
    sendRequest: jest.fn().mockResolvedValue({
      hash: '0x123',
      wait: jest.fn().mockResolvedValue({ status: 1 })
    })
  })),
  utils: {
    formatUnits: jest.fn().mockReturnValue('2000.0'),
    hexlify: jest.fn().mockReturnValue('0x1234567890abcdef'),
    randomBytes: jest.fn().mockReturnValue(new Uint8Array(32)),
    getContractAddress: jest.fn().mockReturnValue('0xSmartAccountAddress'),
    parseUnits: jest.fn().mockReturnValue('1000000'),
    Interface: jest.fn().mockImplementation(() => ({
      encodeFunctionData: jest.fn().mockReturnValue('0xencoded')
    }))
  }
}));

// Mock Magic SDK globally
jest.mock('@magic-sdk/admin', () => ({
  Magic: jest.fn().mockImplementation(() => ({
    token: {
      validate: jest.fn().mockResolvedValue(true),
      decode: jest.fn().mockReturnValue([
        { claim: { iss: 'did:ethr:0x123456789' } },
        { claim: { iss: 'did:ethr:0x123456789', ext: 1234567890 } }
      ]),
    },
    users: {
      getMetadataByToken: jest.fn().mockResolvedValue({
        issuer: 'did:ethr:0x123456789',
        email: 'test@example.com',
        publicAddress: '0x123456789',
      }),
      getMetadataByIssuer: jest.fn().mockResolvedValue({
        issuer: 'did:ethr:0x123456789',
        email: 'test@example.com',
        publicAddress: '0x123456789',
      }),
    },
  })),
}));

// Mock Biconomy SDK globally
jest.mock('@biconomy/account', () => ({
  __esModule: true,
  BiconomySmartAccountV2: {
    create: jest.fn().mockResolvedValue({
      getAccountAddress: jest.fn().mockResolvedValue('0xSmartAccountAddress'),
      sendTransaction: jest.fn().mockResolvedValue({
        hash: '0x123',
        wait: jest.fn().mockResolvedValue({ status: 1 })
      })
    }),
  },
  PaymasterMode: {
    SPONSORED: 'SPONSORED',
  },
}));

// Mock Chainlink Functions Toolkit globally
jest.mock('@chainlink/functions-toolkit', () => ({
  simulateScript: jest.fn().mockResolvedValue({
    responseBytesHexstring: '0x123456',
    errorString: '',
    capturedTerminalOutput: 'Success'
  }),
  decodeResult: jest.fn().mockReturnValue('decoded result'),
  SubscriptionManager: jest.fn().mockImplementation(() => ({
    initialize: jest.fn(),
    createSubscription: jest.fn().mockResolvedValue('123')
  }))
}));

// Mock child_process globally
jest.mock('child_process', () => ({
  spawn: jest.fn().mockReturnValue({
    stdout: {
      on: jest.fn()
    },
    stderr: {
      on: jest.fn()
    },
    on: jest.fn()
  })
}));

export {};
