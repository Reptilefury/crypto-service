import { BiconomySmartAccountV2, PaymasterMode } from '@biconomy/account';
import { ethers } from 'ethers';
import { config } from '../config';

class BiconomyService {
  private provider: any;
  private bundlerUrl: string;
  private paymasterUrl: string;
  private chainId: number;
  private entryPointAddress: string = '0x5FF137D4b0FDFD46c61DA09a9A0C3FE36aC4e2Cf'; // Default ERC-4337 EntryPoint

  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
    }
    this.bundlerUrl = config.biconomy.bundlerUrl;
    this.paymasterUrl = config.biconomy.paymasterUrl;
    this.chainId = config.blockchain.chainId;
  }

  /**
   * Create a Biconomy Smart Account for a user
   * @param userSigner - User's EOA signer (from Magic, Web3Auth, MetaMask, etc.)
   * @returns SmartAccount instance and address
   */
  async createUserWallet(userSigner: ethers.Signer) {
    try {
      // Create Smart Account using v4.x API - bundlerUrl is passed directly
      const smartAccount = await BiconomySmartAccountV2.create({
        signer: userSigner,
        chainId: this.chainId, // Polygon Mainnet: 137, Mumbai: 80001
        rpcUrl: config.blockchain.rpcUrl,
        bundlerUrl: this.bundlerUrl,
      });

      const smartAccountAddress = await smartAccount.getAccountAddress();

      return {
        success: true,
        smartAccount,
        smartAccountAddress,
        message: 'Smart account created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create smart account'
      };
    }
  }

  /**
   * Get user's smart account address (deterministic based on EOA)
   * @param userAddress - User's EOA address
   * @returns Smart account address
   */
  async getSmartAccountAddress(userAddress: string) {
    try {
      // For deterministic address computation without full initialization
      // In production, you'd compute this or store it in DB after first creation
      const smartAccountAddress = ethers.getCreateAddress({
        from: userAddress,
        nonce: 0
      });

      return {
        success: true,
        smartAccountAddress,
        bundlerUrl: this.bundlerUrl,
        note: 'Use createUserWallet() with actual signer for full Smart Account'
      };
    } catch (error) {
      console.error('Biconomy getSmartAccountAddress error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get smart account address'
      };
    }
  }

  /**
   * Transfer USDC from user's smart account to escrow wallet
   * @param smartAccount - User's SmartAccount instance
   * @param escrowAddress - Escrow wallet address
   * @param amount - Amount in USDC (with decimals, e.g., "10.5")
   * @returns Transaction receipt
   */
  async transferToEscrow(smartAccount: any, escrowAddress: string, amount: string) {
    try {
      const usdcAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // Polygon USDC
      const amountInWei = ethers.parseUnits(amount, 6); // USDC has 6 decimals

      // Encode transfer function call
      const txData = new ethers.Interface([
        'function transfer(address to, uint256 amount)'
      ]).encodeFunctionData('transfer', [escrowAddress, amountInWei]);

      const tx = {
        to: usdcAddress,
        value: 0,
        data: txData,
      };

      // Build UserOperation with sponsored gas
      const userOp = await smartAccount.buildUserOp([tx], {
        paymasterServiceData: { mode: 'SPONSORED' }
      });

      // Send UserOperation
      const receipt = await smartAccount.sendUserOp(userOp);

      return {
        success: true,
        userOpHash: receipt.userOpHash,
        amount,
        escrowAddress,
        message: 'Transfer to escrow successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transfer failed'
      };
    }
  }

  /**
   * Execute a generic transaction from smart account
   * @param smartAccount - User's SmartAccount instance
   * @param transaction - Transaction object {to, value, data}
   * @returns Transaction receipt
   */
  async executeTransaction(smartAccount: any, transaction: any) {
    try {
      const userOp = await smartAccount.buildUserOp([transaction], {
        paymasterServiceData: { mode: 'SPONSORED' }
      });

      const receipt = await smartAccount.sendUserOp(userOp);

      return {
        success: true,
        userOpHash: receipt.userOpHash,
        transaction,
        message: 'Transaction executed successfully via Biconomy bundler'
      };
    } catch (error) {
      console.error('Biconomy executeTransaction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed'
      };
    }
  }

  /**
   * Get Biconomy configuration
   */
  getBiconomyConfig() {
    return {
      bundlerUrl: this.bundlerUrl,
      paymasterUrl: this.paymasterUrl,
      chainId: this.chainId,
      rpcUrl: config.blockchain.rpcUrl,
      entryPointAddress: this.entryPointAddress
    };
  }
}

export default new BiconomyService();
