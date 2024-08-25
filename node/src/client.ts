import { Contract } from 'ethers'
import { JobRegistry } from './types'
import { ORACLE_REQUEST_EVENT } from './constants'
import { db } from './db'
import { requests } from './db/schema'

export const startJobClient = async (oracleContract: Contract, jobRegistry: JobRegistry) => {
  const runJob = (jobId: string, jobArgs: string) => {
    const job = jobRegistry[jobId]
    if (!job) {
      throw new Error(`Job not found: ${jobId}`)
    }
    return job.run(jobArgs)
  }

  const fulfillOracleRequest = async (requestId: string, jobResult: string) => {
    const fulfillTx = await oracleContract.fulfillOracleRequest(requestId, jobResult)
    const txReceipt = await fulfillTx.wait()
    return txReceipt
  }

  const storeReqeust = async (requestId: string, jobId: string, jobArgs: string, requesterAddress: string) => {
    await db.insert(requests).values({ requestId, jobId, jobArgs, requesterAddress }).execute()
  }

  const handleOracleRequest = async (requestId: string, jobId: string, jobArgs: string, requesterAddress: string) => {
    console.log('📋 New OracleRequest event with requestId', requestId, 'from', requesterAddress)

    console.log('ℹ️ Storing request...')
    try {
      await storeReqeust(requestId, jobId, jobArgs, requesterAddress)
      console.log('ℹ️ Request stored')
    } catch (error) {
      console.error('❌ Error storing request:', error)
    }

    console.log('ℹ️ Running job with id', jobId, 'and args', jobArgs)
    let jobResult: string
    try {
      jobResult = await runJob(jobId, jobArgs)
    } catch (error) {
      console.error('❌ Job error:', error)
      return
    }
    console.log('ℹ️ Job result:', jobResult)

    console.log('ℹ️ Fulfilling OracleRequest...')
    const fulfillTx = await fulfillOracleRequest(requestId, jobResult)
    console.log('✅ OracleRequest fulfilled:', fulfillTx.hash)
  }

  oracleContract.on(ORACLE_REQUEST_EVENT, handleOracleRequest)
}
