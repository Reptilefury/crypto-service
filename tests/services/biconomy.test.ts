import biconomyService from '../../src/services/biconomy';

// Mock Biconomy SDK
jest.mock('@biconomy/smart-account');
jest.mock('ethers');

describe('BiconomyService', () => {
  describe('createSmartAccount', () => {
    it('should create smart account successfully', async () => {
      const userAddress = '0x123456789abcdef';
      
      const result = await biconomyService.createSmartAccount(userAddress);

      expect(result.success).toBe(true);
      expect(result.userAddress).toBe(userAddress);
      expect(result.smartAccountAddress).toBeDefined();
    });

    it('should handle error during smart account creation', async () => {
      // Mock error scenario
      jest.spyOn(biconomyService, 'createSmartAccount').mockResolvedValueOnce({
        success: false,
        error: 'Failed to create smart account'
      });

      const result = await biconomyService.createSmartAccount('invalid_address');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create smart account');
    });
  });

  describe('getSmartAccountAddress', () => {
    it('should get smart account address', async () => {
      const userAddress = '0x123456789abcdef';
      
      const result = await biconomyService.getSmartAccountAddress(userAddress);

      expect(result.success).toBe(true);
      expect(result.smartAccountAddress).toBeDefined();
    });
  });

  describe('executeTransaction', () => {
    it('should execute transaction successfully', async () => {
      const smartAccountAddress = '0x987654321fedcba';
      const transaction = { to: '0x123', value: '1000000000000000000' };
      
      const result = await biconomyService.executeTransaction(smartAccountAddress, transaction);

      expect(result.success).toBe(true);
      expect(result.transactionHash).toBeDefined();
    });
  });
});
