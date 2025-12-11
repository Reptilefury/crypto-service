import { ethers, JsonRpcProvider, Contract, id, parseUnits, parseEther, formatUnits, formatEther } from 'ethers';
import { config } from '../config';
import { ExternalServiceException, BusinessException } from '../common/exception/AppException';
import { ResponseCode } from '../common/response/ResponseCode';

// UMA OptimisticOracle V3 ABI (simplified)
const UMA_ORACLE_ABI = [
  'function requestPrice(bytes32 identifier, uint256 time, bytes ancillaryData, address currency, uint256 reward) external returns (uint256)',
  'function proposePrice(address requester, bytes32 identifier, uint256 time, bytes ancillaryData, int256 proposedPrice) external returns (uint256 totalBond)',
  'function disputePrice(address requester, bytes32 identifier, uint256 time, bytes ancillaryData) external returns (uint256 totalBond)',
  'function settle(address requester, bytes32 identifier, uint256 time, bytes ancillaryData) external returns (int256)',
  'function getRequest(address requester, bytes32 identifier, uint256 time, bytes ancillaryData) external view returns (tuple(address proposer, address disputer, address currency, bool settled, bool refundOnDispute, int256 proposedPrice, int256 resolvedPrice, uint256 expirationTime, uint256 reward, uint256 finalFee))'
];

class UMAService {
  private provider: JsonRpcProvider | any;
  private oracleAddress: string;

  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      this.provider = new JsonRpcProvider(config.blockchain.rpcUrl);
    }
    // UMA OptimisticOracle V3 on Polygon
    this.oracleAddress = '0x5953f2538F613E05bAED8A5AeFa8e6622467AD3D';
  }

  async requestMarketResolution(marketId: string, question: string, resolutionTime: number) {
    try {
      const oracle = new Contract(this.oracleAddress, UMA_ORACLE_ABI, this.provider);

      // Create identifier for the market question
      const identifier = id(question);

      // USDC address on Polygon as currency
      const currency = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
      const reward = parseUnits('10', 6); // 10 USDC reward

      // This would require a signer with funds
      // const tx = await oracle.requestPrice(identifier, resolutionTime, ancillaryData, currency, reward);

      return {
        marketId,
        identifier: identifier,
        resolutionTime,
        reward: formatUnits(reward, 6),
        currency,
        message: 'Price request would be submitted to UMA Oracle',
        // transactionHash: tx.hash
      };
    } catch (error) {
      throw new ExternalServiceException(error instanceof Error ? error.message : 'Failed to request market resolution');
    }
  }

  async proposeMarketOutcome(marketId: string, outcome: string, evidence?: string) {
    try {
      // Convert outcome to price format (e.g., "YES" = 1e18, "NO" = 0)
      const proposedPrice = outcome.toLowerCase() === 'yes' ?
        parseEther('1') :
        parseEther('0');

      return {
        marketId,
        outcome,
        proposedPrice: formatEther(proposedPrice),
        evidence,
        message: 'Outcome proposal would be submitted to UMA Oracle'
      };
    } catch (error) {
      throw new ExternalServiceException(error instanceof Error ? error.message : 'Failed to propose outcome');
    }
  }

  async disputeMarketOutcome(marketId: string, reason: string) {
    try {
      return {
        marketId,
        reason,
        message: 'Dispute would be submitted to UMA Oracle',
        disputePeriod: '48 hours'
      };
    } catch (error) {
      throw new ExternalServiceException(error instanceof Error ? error.message : 'Failed to dispute outcome');
    }
  }

  async settleMarket(marketId: string) {
    try {
      return {
        marketId,
        finalOutcome: 'pending',
        message: 'Market settlement would be executed via UMA Oracle'
      };
    } catch (error) {
      throw new ExternalServiceException(error instanceof Error ? error.message : 'Failed to settle market');
    }
  }

  async getMarketRequest(marketId: string, identifier: string, timestamp: number) {
    try {
      const oracle = new Contract(this.oracleAddress, UMA_ORACLE_ABI, this.provider);

      // This would fetch the actual request data
      // const request = await oracle.getRequest(requester, identifier, timestamp, ancillaryData);

      return {
        marketId,
        status: 'pending',
        message: 'Request data would be fetched from UMA Oracle'
      };
    } catch (error) {
      throw new ExternalServiceException(error instanceof Error ? error.message : 'Failed to get market request');
    }
  }

  async getOptimisticOracleInfo() {
    return {
      oracleAddress: this.oracleAddress,
      network: 'Polygon',
      version: 'OptimisticOracle V3',
      features: [
        'Decentralized dispute resolution',
        'Economic guarantees via bonding',
        'Flexible question formats',
        'Escalation to DVM if disputed'
      ]
    };
  }
}

export default new UMAService();
