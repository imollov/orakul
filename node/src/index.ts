import * as jobs from './jobs'
import { registerJobs } from './core/job'
import { getOracleContract } from './contracts'
import { startJobClient } from './client'

import * as dotenv from 'dotenv'
dotenv.config()

const RPC_URL = process.env.RPC_URL || 'http://localhost:8545'
const PRIVATE_KEY = process.env.PRIVATE_KEY || 'Unset Private Key'
const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS || 'Unset Oracle Address'

const oracleContract = getOracleContract(RPC_URL, PRIVATE_KEY, ORACLE_ADDRESS)
console.log('🔗 Oracle contract:', ORACLE_ADDRESS)

const jobRegistry = registerJobs(jobs)
console.log('👷🏼 Job registry:', jobRegistry)

console.log('🚀 Starting job client...')
startJobClient(oracleContract, jobRegistry)
  .then(() => {
    console.log('ℹ️ Listening for OracleRequest events...')
  })
  .catch((error: Error) => {
    console.error('❌ Error:', error)
  })
