import { Wallet, Contract, JsonRpcProvider } from 'ethers'
import OracleArtifact from './abi/Oracle.json'

/**
 * Creates and returns an instance of the Oracle smart contract.
 *
 * @param rpcUrl - The URL of the Ethereum JSON-RPC provider.
 * @param privateKey - The private key of the wallet used to sign transactions.
 * @param oracleAddress - The address of the deployed Oracle contract.
 * @returns An instance of the Oracle contract connected to the specified provider and wallet.
 */
export const getOracleContract = (rpcUrl: string, privateKey: string, oracleAddress: string) => {
  // Initialize a JSON-RPC provider
  const provider = new JsonRpcProvider(rpcUrl)

  // Create a wallet instance using the provided private key and connect it to the provider
  const wallet = new Wallet(privateKey, provider)

  // Return a new contract instance for the Oracle contract using its ABI, address, and wallet
  return new Contract(oracleAddress, OracleArtifact.abi, wallet)
}
