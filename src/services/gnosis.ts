import { ethers, JsonRpcProvider, Wallet, Contract, parseUnits, Interface, formatUnits } from 'ethers';
const Safe = require('@safe-global/protocol-kit');
import { config } from '../config';
import { ExternalServiceException, BusinessException } from '../common/exception/AppException';
import { ResponseCode } from '../common/response/ResponseCode';

// USDC address on Polygon
const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

// ERC20 ABI for transfer
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)'
];

class GnosisService {
  private provider: JsonRpcProvider | any;
  private platformSigner: Wallet | null = null;

  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      this.provider = new JsonRpcProvider(config.blockchain.rpcUrl);
    }
  }

  /**
   * Get or create platform signer for Safe operations
   */
  private getPlatformSigner(): Wallet {
    if (!this.platformSigner) {
      const privateKey = process.env.PLATFORM_PRIVATE_KEY || Wallet.createRandom().privateKey;
      this.platformSigner = new Wallet(privateKey, this.provider);
    }
    return this.platformSigner;
  }

  /**
   * Create a market escrow Safe wallet using Safe SDK (isolated execution)
   */
  async createMarketEscrowSafe(owners?: string[], threshold: number = 1) {
    try {
      const signer = this.getPlatformSigner();
      const safeOwners = owners || [signer.address];

      // Debug: Check config values
      console.log('Debug - RPC URL:', config.blockchain.rpcUrl);
      console.log('Debug - Chain ID:', config.blockchain.chainId);

      // Use child process to avoid server context issues with Safe SDK
      const { spawn } = require('child_process');
      const rpcUrl = config.blockchain.rpcUrl || 'https://polygon-rpc.com';
      const privateKey = signer.privateKey;
      const signerAddress = signer.address;

      return new Promise((resolve, reject) => {
        const child = spawn('node', ['-e', `
          const Safe = require('@safe-global/protocol-kit');
          
          async function createSafe() {
            try {
              console.log('Child process - RPC URL:', '${rpcUrl}');
              
              const protocolKit = await Safe.default.init({
                provider: '${rpcUrl}',
                signer: '${privateKey}',
                predictedSafe: {
                  safeAccountConfig: {
                    owners: ${JSON.stringify(safeOwners)},
                    threshold: ${threshold}
                  }
                }
              });
              
              const safeAddress = await protocolKit.getAddress();
              const isDeployed = await protocolKit.isSafeDeployed();
              
              console.log(JSON.stringify({
                safeAddress,
                owners: ${JSON.stringify(safeOwners)},
                threshold: ${threshold},
                platformSigner: '${signerAddress}',
                isDeployed,
                message: 'Safe wallet created successfully using Safe SDK',
                note: isDeployed ? 'Safe is already deployed' : 'Safe will be deployed on first transaction'
              }));
            } catch (error) {
              console.error('ERROR:', error.message);
              process.exit(1);
            }
          }
          
          createSafe();
        `], { cwd: process.cwd() });

        let output = '';
        let errorOutput = '';

        child.stdout.on('data', (data: any) => {
          output += data.toString();
        });

        child.stderr.on('data', (data: any) => {
          errorOutput += data.toString();
        });

        child.on('close', (code: any) => {
          if (code === 0) {
            try {
              // Extract JSON from output (ignore debug logs)
              const lines = output.trim().split('\n');
              const jsonLine = lines.find(line => line.startsWith('{'));
              if (jsonLine) {
                const result = JSON.parse(jsonLine);
                resolve(result);
              } else {
                reject(new Error('No valid JSON output received from Safe SDK'));
              }
            } catch (parseError) {
              reject(new Error(`Failed to parse Safe SDK output: ${output}`));
            }
          } else {
            reject(new Error(`Safe SDK failed: ${errorOutput || output}`));
          }
        });

        child.on('error', (error: any) => {
          reject(new Error(`Failed to spawn Safe SDK process: ${error.message}`));
        });
      });
    } catch (error) {
      console.error('Safe SDK Error:', error);
      throw new ExternalServiceException(error instanceof Error ? error.message : 'Failed to create Safe wallet');
    }
  }

  /**
   * Deploy a Safe wallet immediately
   */
  async deploySafe(safeAddress: string) {
    try {
      const signer = this.getPlatformSigner();

      // Connect to existing Safe
      const protocolKit = await Safe.default.init({
        provider: config.blockchain.rpcUrl,
        signer: signer.privateKey,
        safeAddress: safeAddress
      });

      // Check if already deployed
      const isDeployed = await protocolKit.isSafeDeployed();
      if (isDeployed) {
        return {
          safeAddress,
          message: 'Safe is already deployed',
          transactionHash: null
        };
      }

      // Create deployment transaction
      const deploymentTransaction = await protocolKit.createSafeDeploymentTransaction();

      // Execute deployment transaction
      const txResponse = await signer.sendTransaction({
        to: deploymentTransaction.to,
        value: deploymentTransaction.value,
        data: deploymentTransaction.data
      });

      const receipt = await txResponse.wait();

      return {
        safeAddress,
        message: 'Safe deployed successfully',
        transactionHash: receipt?.hash || '',
        blockNumber: receipt?.blockNumber || 0
      };
    } catch (error) {
      console.error('Safe deployment error:', error);
      throw new ExternalServiceException(error instanceof Error ? error.message : 'Failed to deploy Safe');
    }
  }

  /**
   * Execute payout from escrow Safe to winner
   */
  async executeEscrowRelease(escrowSafeAddress: string, recipient: string, amountUSDC: string) {
    try {
      const signer = this.getPlatformSigner();
      const amount = parseUnits(amountUSDC, 6);

      // Connect to deployed Safe
      const safe = await Safe.default.init({
        provider: config.blockchain.rpcUrl,
        signer: signer.privateKey,
        safeAddress: escrowSafeAddress
      });

      // Encode USDC transfer
      const erc20 = new Interface(ERC20_ABI);
      const data = erc20.encodeFunctionData('transfer', [recipient, amount]);

      // Build Safe Tx
      const safeTx = await safe.createTransaction({
        transactions: [{
          to: USDC_ADDRESS,
          value: '0',
          data
        }]
      });

      // Execute Safe Tx
      const txResponse = await safe.executeTransaction(safeTx);

      return {
        transactionHash: txResponse.hash,
        safeAddress: escrowSafeAddress,
        recipient,
        amount: amountUSDC,
        message: 'Escrow released successfully'
      };
    } catch (error) {
      console.error('release error:', error);
      throw new ExternalServiceException(error instanceof Error ? error.message : 'Failed to release escrow');
    }
  }

  /**
   * Propose a transaction to the Safe (for multi-sig)
   */
  async proposeTransaction(safeAddress: string, transaction: any) {
    try {
      const signer = this.getPlatformSigner();

      const safe = await Safe.default.init({
        provider: config.blockchain.rpcUrl,
        signer: signer.privateKey,
        safeAddress
      });

      // Create transaction
      const safeTx = await safe.createTransaction({
        transactions: [transaction]
      });

      // Get transaction hash for tracking
      const txHash = await safe.getTransactionHash(safeTx);

      return {
        transactionHash: txHash,
        safeAddress,
        transaction,
        message: 'Transaction proposed successfully',
        note: 'Requires threshold signatures to execute'
      };
    } catch (error) {
      throw new ExternalServiceException(error instanceof Error ? error.message : 'Failed to propose transaction');
    }
  }

  /**
   * Get Safe information
   */
  async getSafeInfo(safeAddress: string) {
    try {
      const signer = this.getPlatformSigner();

      const safe = await Safe.default.init({
        provider: config.blockchain.rpcUrl,
        signer: signer.privateKey,
        safeAddress
      });

      const owners = await safe.getOwners();
      const threshold = await safe.getThreshold();
      const nonce = await safe.getNonce();

      // Get USDC balance
      const usdcContract = new Contract(USDC_ADDRESS, ERC20_ABI, this.provider);
      const balance = await usdcContract.balanceOf(safeAddress);
      const balanceFormatted = formatUnits(balance, 6);

      return {
        address: safeAddress,
        owners,
        threshold,
        nonce,
        usdcBalance: balanceFormatted,
        chainId: config.blockchain.chainId
      };
    } catch (error) {
      throw new BusinessException(ResponseCode.NOT_FOUND, error instanceof Error ? error.message : 'Failed to get safe info');
    }
  }

  /**
   * Check USDC balance in Safe
   */
  async getSafeBalance(safeAddress: string) {
    try {
      const usdcContract = new Contract(USDC_ADDRESS, ERC20_ABI, this.provider);
      const balance = await usdcContract.balanceOf(safeAddress);
      const balanceFormatted = formatUnits(balance, 6);

      return {
        safeAddress,
        usdcBalance: balanceFormatted,
        usdcAddress: USDC_ADDRESS
      };
    } catch (error) {
      throw new ExternalServiceException(error instanceof Error ? error.message : 'Failed to get balance');
    }
  }
}

export default new GnosisService();
