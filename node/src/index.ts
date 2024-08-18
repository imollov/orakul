import { ethers } from 'ethers'
import * as dotenv from 'dotenv'
dotenv.config()

import * as jobs from './jobs'
import { JobRegistry } from './types'

const jobRegistry: JobRegistry = Object.values(jobs).reduce((acc, job) => ({ ...acc, [job.id]: job }), {})
console.log('Job registry:', jobRegistry)

import OracleArtifact from './abi/Oracle.json'

const RPC_URL = process.env.RPC_URL || 'http://localhost:8545'
const PRIVATE_KEY = process.env.PRIVATE_KEY || 'Unset Private Key'
const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS || 'Unset Oracle Address'

const provider = new ethers.JsonRpcProvider(RPC_URL)
const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
const oracleContract = new ethers.Contract(ORACLE_ADDRESS, OracleArtifact.abi, wallet)

const oracleRequestListener = async (jobRegistry: JobRegistry) => {
  console.log('Listening for OracleRequest events on Oracle contract:', ORACLE_ADDRESS)

  oracleContract.on(
    'OracleRequest',
    async (requestId: string, jobId: string, jobArgs: string, requesterAddress: string) => {
      console.log('New OracleRequest event')
      console.log('requestId:', requestId)
      console.log('requesterAddress:', requesterAddress)

      console.log('Running job with id', jobId, 'and args', jobArgs)
      const job = jobRegistry[jobId]
      if (!job) {
        console.error('Job not found:', jobId)
        return
      }
      const jobResult = await job.run(jobArgs)
      console.log('Job result:', jobResult)

      console.log('Fulfilling OracleRequest...')
      const fulfillTx = await oracleContract.fulfillOracleRequest(requestId, jobResult)
      console.log('Fulfill tx:', fulfillTx.hash)
      await fulfillTx.wait()
      console.log('OracleRequest fulfilled')
    },
  )
}

oracleRequestListener(jobRegistry).catch((error) => {
  console.error('Error:', error)
})
