import { ethers } from 'ethers'
import * as dotenv from 'dotenv'
dotenv.config()

import OracleArtifact from './abi/Oracle.json'

const RPC_URL = process.env.RPC_URL || 'http://localhost:8545'
const PRIVATE_KEY = process.env.PRIVATE_KEY || 'Unset Private Key'
const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS || 'Unset Oracle Address'

const provider = new ethers.JsonRpcProvider(RPC_URL)
const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
const oracleContract = new ethers.Contract(ORACLE_ADDRESS, OracleArtifact.abi, wallet)

const oracleRequestListener = async () => {
  console.log('Listening for OracleRequest events on Oracle contract:', ORACLE_ADDRESS)

  oracleContract.on(
    'OracleRequest',
    async (requestId: string, jobId: string, jobArgs: string, requesterAddress: string) => {
      console.log('New OracleRequest event')
      console.log('requestId:', requestId)
      console.log('requesterAddress:', requesterAddress)

      console.log('Running job with id', jobId, 'and args', jobArgs)
      const jobResult = multiplyNumJob(jobArgs)
      console.log('Job result:', jobResult)

      console.log('Fulfilling OracleRequest...')
      const fulfillTx = await oracleContract.fulfillOracleRequest(requestId, jobResult)
      console.log('Fulfill tx:', fulfillTx.hash)
      await fulfillTx.wait()
      console.log('OracleRequest fulfilled')
    },
  )
}

const multiplyNumJob = (args: string) => {
  const argsDecoded = new ethers.AbiCoder().decode(['uint256'], args)
  const num = BigInt(argsDecoded[0])
  const result = num * 2n
  const resultBytes = new ethers.AbiCoder().encode(['uint256'], [result])
  return resultBytes
}

oracleRequestListener().catch((error) => {
  console.error('Error:', error)
})
