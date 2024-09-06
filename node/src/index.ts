import * as jobModules from './jobs'
import { registerJobs } from './core/job'
import { createJobClient } from './core/client'
import { getOracleContract } from './contracts'
import { config } from './config'

const { RPC_URL, PRIVATE_KEY, ORACLE_ADDRESS } = config

const oracleContract = getOracleContract(RPC_URL, PRIVATE_KEY, ORACLE_ADDRESS)
console.log('🔗 Using oracle contract:', ORACLE_ADDRESS)

const jobRegistry = registerJobs(jobModules)
console.log('👷🏼 Job registry', jobRegistry.listJobDetails())

createJobClient({ oracleContract, jobRegistry }).start()
console.log('🚀 Job client started...')
