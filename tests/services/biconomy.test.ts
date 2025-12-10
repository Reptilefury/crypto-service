import { ethers } from 'ethers';

// Mock @biconomy/account locally to ensure it works
jest.mock('@biconomy/account', () => ({
  __esModule: true,
  BiconomySmartAccountV2: {
    create: jest.fn(),
  },
  PaymasterMode: {
    SPONSORED: 'SPONSORED',
  },
}));

import biconomyService from '../../src/services/biconomy';

describe('BiconomyService', () => {
  describe('getSmartAccountAddress', () => {
    it('should get smart account address', async () => {
      const userAddress = '0x123456789abcdef';

      const result = await biconomyService.getSmartAccountAddress(userAddress);

      expect(result.smartAccountAddress).toBeDefined();
    });
  });

  describe('executeTransaction', () => {
    it('should execute transaction successfully', async () => {
      const smartAccount = {
        address: '0x987654321fedcba',
        buildUserOp: jest.fn().mockResolvedValue({}),
        sendUserOp: jest.fn().mockResolvedValue({ userOpHash: '0xhash' })
      };
      const transaction = { to: '0x123', value: '1000000000000000000' };

      const result = await biconomyService.executeTransaction(smartAccount, transaction);

      expect(result.userOpHash).toBeDefined();
    });
  });

  describe('getBiconomyConfig', () => {
    it('should return biconomy configuration', () => {
      const config = biconomyService.getBiconomyConfig();

      expect(config.bundlerUrl).toBeDefined();
      expect(config.chainId).toBeDefined();
    });
  });
});
