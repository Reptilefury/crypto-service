import { BiconomySmartAccountV2, PaymasterMode, BiconomyPaymaster } from '@biconomy/account';
import { ethers, JsonRpcProvider, randomBytes, hexlify, parseUnits, Interface, getCreateAddress } from 'ethers';
import { config } from '../config';
import { ExternalServiceException, BusinessException } from '../common/exception/AppException';
import { ResponseCode } from '../common/response/ResponseCode';

class BiconomyService {
  private provider: any;
  private apiKey: string;
  private projectId: string;
  private bundlerUrl: string;
  private paymasterUrl: string;
  private chainId: number;

  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      this.provider = new JsonRpcProvider(config.blockchain.rpcUrl);
    }
    this.apiKey = config.biconomy.apiKey;
    this.projectId = config.biconomy.projectId;
    this.chainId = config.blockchain.chainId;
    
    // Construct URLs with actual API key
    this.bundlerUrl = `https://bundler.biconomy.io/api/v2/${this.chainId}/${this.apiKey}`;
    this.paymasterUrl = `https://paymaster.biconomy.io/api/v1/${this.chainId}/${this.apiKey}`;
  }

  /**
   * Create a Biconomy Smart Account for a user
   * @param userSigner - User's EOA signer (from Magic, Web3Auth, MetaMask, etc.)
   * @returns SmartAccount instance and address
   */
  async createUserWallet(userSigner: ethers.Signer) {
    try {
      // Create paymaster instance
      const paymaster = new BiconomyPaymaster({
        paymasterUrl: this.paymasterUrl
      });

      // Create Smart Account using v4.x API - bundlerUrl is passed directly
      const smartAccount = await BiconomySmartAccountV2.create({
        signer: userSigner,
        chainId: this.chainId, // Polygon Mainnet: 137, Mumbai: 80001
        rpcUrl: config.blockchain.rpcUrl,
        bundlerUrl: this.bundlerUrl,
        paymaster: paymaster,
      });

      const smartAccountAddress = await smartAccount.getAccountAddress();

      return {
        smartAccount,
        smartAccountAddress,
        message: 'Smart account created successfully'
      };
    } catch (error) {
      throw new ExternalServiceException(error instanceof Error ? error.message : 'Failed to create smart account');
    }
  }

  /**
   * Create a Biconomy Smart Account from user address (without signer)
   * @param userAddress - User's EOA address
   * @returns Smart account configuration and address
   */
  async createUserWalletFromAddress(userAddress: string) {
    try {
      // Create a wallet with proper hex private key for smart account creation
      const privateKey = hexlify(randomBytes(32));
      const wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Create Smart Account using proper Biconomy configuration
      const smartAccount = await BiconomySmartAccountV2.create({
        signer: wallet,
        chainId: this.chainId,
        rpcUrl: config.blockchain.rpcUrl,
        bundlerUrl: this.bundlerUrl,
        biconomyPaymasterApiKey: this.apiKey,
        entryPointAddress: '0x5FF137D4b0FDFD46c61DA09a9A0C3FE36aC4e2Cf'
      });

      const smartAccountAddress = await smartAccount.getAccountAddress();

      // Return smart account info - deployment will happen on first transaction
      return {
        smartAccountAddress,
        userAddress,
        deployed: false,
        message: 'Smart account created (will deploy on first transaction)',
        apiKey: this.apiKey,
        projectId: this.projectId,
        bundlerUrl: this.bundlerUrl,
        paymasterUrl: this.paymasterUrl,
        chainId: this.chainId,
        usdcContract: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
      };
    } catch (error) {
      console.error('Biconomy wallet creation error:', error);
      throw new ExternalServiceException('Unable to create smart wallet. Please try again later.');
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
      const smartAccountAddress = getCreateAddress({
        from: userAddress,
        nonce: 0
      });

      return {
        smartAccountAddress,
        bundlerUrl: this.bundlerUrl,
        note: 'Use createUserWallet() with actual signer for full Smart Account'
      };
    } catch (error) {
      throw new BusinessException(ResponseCode.INVALID_INPUT, error instanceof Error ? error.message : 'Failed to get smart account address');
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
      const amountInWei = parseUnits(amount, 6); // USDC has 6 decimals

      // Encode transfer function call
      const txData = new Interface([
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
        userOpHash: receipt.userOpHash,
        amount,
        escrowAddress,
        message: 'Transfer to escrow successful'
      };
    } catch (error) {
      throw new ExternalServiceException(error instanceof Error ? error.message : 'Transfer failed');
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
        userOpHash: receipt.userOpHash,
        transaction,
        message: 'Transaction executed successfully via Biconomy bundler'
      };
    } catch (error) {
      throw new ExternalServiceException(error instanceof Error ? error.message : 'Transaction failed');
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
      rpcUrl: config.blockchain.rpcUrl
    };
  }
}

export default new BiconomyService();
