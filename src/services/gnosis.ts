import { ethers } from 'ethers';
import Safe from '@safe-global/protocol-kit';
import { config } from '../config';

// USDC address on Polygon
const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

// ERC20 ABI for transfer
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)'
];

class GnosisService {
  private provider: ethers.JsonRpcProvider;
  private platformSigner: ethers.Wallet | null = null;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
  }

  /**
   * Get or create platform signer for Safe operations
   * In production, this would use a secure key management system
   */
  private getPlatformSigner(): ethers.Wallet {
    if (!this.platformSigner) {
      // For demo purposes - in production, use secure key management
      const privateKey = process.env.PLATFORM_PRIVATE_KEY || ethers.Wallet.createRandom().privateKey;
      this.platformSigner = new ethers.Wallet(privateKey, this.provider);
    }
    return this.platformSigner;
  }

  /**
   * Create a market escrow Safe wallet
   * @param owners - Array of owner addresses (default: platform signer)
   * @param threshold - Number of signatures required (default: 1)
   * @returns Safe address and deployment info
   */
  async createMarketEscrowSafe(owners?: string[], threshold: number = 1) {
    try {
      const signer = this.getPlatformSigner();
      const safeOwners = owners || [signer.address];

      // Initialize Safe with predicted configuration
      const safe = await Safe.init({
        provider: config.blockchain.rpcUrl, // Use RPC URL string
        signer: signer.privateKey, // Use private key string, not Wallet object
        predictedSafe: {
          safeAccountConfig: {
            owners: safeOwners,
            threshold: threshold
          }
        }
      });

      // Get the predicted Safe address
      const safeAddress = await safe.getAddress();

      return {
        success: true,
        safeAddress,
        owners: safeOwners,
        threshold,
        message: 'Market escrow Safe address predicted successfully',
        note: 'Safe will be deployed on first transaction. Use deploySafe() to deploy immediately.'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create escrow safe'
      };
    }
  }

  /**
   * Execute payout from escrow Safe to winner
   * @param escrowSafeAddress - Safe address holding the funds
   * @param recipient - Winner's address
   * @param amountUSDC - Amount in USDC (with decimals, e.g., "100.50")
   * @returns Transaction hash
   */
  async executeEscrowRelease(escrowSafeAddress: string, recipient: string, amountUSDC: string) {
    try {
      const signer = this.getPlatformSigner();
      const amount = ethers.parseUnits(amountUSDC, 6); // USDC has 6 decimals

      // Initialize Safe instance for existing Safe
      const safe = await Safe.init({
        provider: config.blockchain.rpcUrl,
        signer: signer.privateKey,
        safeAddress: escrowSafeAddress,
      });

      // Encode USDC transfer
      const erc20Interface = new ethers.Interface(ERC20_ABI);
      const data = erc20Interface.encodeFunctionData('transfer', [recipient, amount]);

      // Create Safe transaction
      const safeTx = await safe.createTransaction({
        transactions: [{
          to: USDC_ADDRESS,
          data: data,
          value: '0'
        }]
      });

      // Execute transaction
      const txResponse = await safe.executeTransaction(safeTx);
      const txHash = txResponse.hash;

      return {
        success: true,
        transactionHash: txHash,
        safeAddress: escrowSafeAddress,
        recipient,
        amount: amountUSDC,
        message: 'Escrow released successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to release escrow'
      };
    }
  }

  /**
   * Propose a transaction to the Safe (for multi-sig)
   * @param safeAddress - Safe address
   * @param transaction - Transaction details
   * @returns Proposed transaction info
   */
  async proposeTransaction(safeAddress: string, transaction: any) {
    try {
      const signer = this.getPlatformSigner();

      const safe = await Safe.init({
        provider: config.blockchain.rpcUrl,
        signer: signer.privateKey,
        safeAddress: safeAddress,
      });

      // Create transaction
      const safeTx = await safe.createTransaction({
        transactions: [transaction]
      });

      // Get transaction hash for tracking
      const txHash = await safe.getTransactionHash(safeTx);

      return {
        success: true,
        transactionHash: txHash,
        safeAddress,
        transaction,
        message: 'Transaction proposed successfully',
        note: 'Requires threshold signatures to execute'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to propose transaction'
      };
    }
  }

  /**
   * Get Safe information
   * @param safeAddress - Safe address
   * @returns Safe configuration and balance
   */
  async getSafeInfo(safeAddress: string) {
    try {
      const signer = this.getPlatformSigner();

      const safe = await Safe.init({
        provider: config.blockchain.rpcUrl,
        signer: signer.privateKey,
        safeAddress: safeAddress,
      });

      const owners = await safe.getOwners();
      const threshold = await safe.getThreshold();
      const nonce = await safe.getNonce();

      // Get USDC balance
      const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, this.provider);
      const balance = await usdcContract.balanceOf(safeAddress);
      const balanceFormatted = ethers.formatUnits(balance, 6);

      return {
        success: true,
        data: {
          address: safeAddress,
          owners,
          threshold,
          nonce,
          usdcBalance: balanceFormatted,
          chainId: config.blockchain.chainId
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get safe info'
      };
    }
  }

  /**
   * Check USDC balance in Safe
   * @param safeAddress - Safe address
   * @returns USDC balance
   */
  async getSafeBalance(safeAddress: string) {
    try {
      const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, this.provider);
      const balance = await usdcContract.balanceOf(safeAddress);
      const balanceFormatted = ethers.formatUnits(balance, 6);

      return {
        success: true,
        safeAddress,
        usdcBalance: balanceFormatted,
        usdcAddress: USDC_ADDRESS
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get balance'
      };
    }
  }
}

export default new GnosisService();
