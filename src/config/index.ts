export const config = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Magic.link
  magic: {
    secretKey: process.env.MAGIC_SECRET_KEY!
  },
  
  // Blockchain
  blockchain: {
    rpcUrl: process.env.RPC_URL!,
    chainId: parseInt(process.env.CHAIN_ID || '137')
  },
  
  // Biconomy
  biconomy: {
    bundlerUrl: process.env.BICONOMY_BUNDLER_URL!,
    paymasterUrl: process.env.BICONOMY_PAYMASTER_URL!
  },
  
  // Gnosis Safe
  safe: {
    serviceUrl: process.env.SAFE_SERVICE_URL!
  },
  
  // Chainlink
  chainlink: {
    // Price feed addresses are defined in the service
    network: 'polygon'
  },
  
  // UMA
  uma: {
    oracleAddress: process.env.UMA_ORACLE_ADDRESS || '0x5953f2538F613E05bAED8A5AeFa8e6622467AD3D',
    currency: process.env.UMA_CURRENCY || '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
    defaultReward: process.env.UMA_DEFAULT_REWARD || '10' // 10 USDC
  }
};
