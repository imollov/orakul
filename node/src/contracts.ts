import { ethers } from 'ethers'

import OracleArtifact from './abi/Oracle.json'

export const getOracleContract = (rpcUrl: string, privateKey: string, oracleAddress: string) => {
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const wallet = new ethers.Wallet(privateKey, provider)
  return new ethers.Contract(oracleAddress, OracleArtifact.abi, wallet)
}
