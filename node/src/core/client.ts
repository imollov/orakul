import { Contract } from 'ethers'
import { JobRegistry } from './job'
import { db } from '../db'
import { requests } from '../db/schema'
import { ORACLE_REQUEST_EVENT_NAME } from '../constants'

/**
 * Parameters for an Oracle request.
 */
export type OracleRequestParams = {
  requestId: string
  jobId: string
  jobArgs: string
  requesterAddress: string
}

/**
 * Factory function to create a JobClient instance.
 */
export const createJobClient = ({
  oracleContract,
  jobRegistry,
}: {
  oracleContract: Contract
  jobRegistry: JobRegistry
}) => {
  return new JobClient(oracleContract, jobRegistry)
}

/**
 * Handles interaction with the Oracle contract.
 */
export class OracleClient {
  oracleContract: Contract

  constructor(oracleContract: Contract) {
    this.oracleContract = oracleContract
  }

  /**
   * Fulfills an Oracle request with the provided result.
   * @param requestId - The ID of the Oracle request.
   * @param jobResult - The result to fulfill the request with.
   * @returns The transaction receipt after fulfilling the request.
   */
  async fulfillOracleRequest(requestId: string, jobResult: string) {
    const fulfillTx = await this.oracleContract.fulfillOracleRequest(requestId, jobResult)
    return await fulfillTx.wait()
  }

  /**
   * Subscribes to Oracle request events.
   * @param handler - The handler function to process each request event.
   */
  onOracleRequest(handler: (params: OracleRequestParams) => void) {
    this.oracleContract.on(ORACLE_REQUEST_EVENT_NAME, (requestId, jobId, jobArgs, requesterAddress) =>
      handler({ requestId, jobId, jobArgs, requesterAddress }),
    )
  }
}

/**
 * JobClient that extends OracleClient to manage jobs.
 */
export class JobClient extends OracleClient {
  jobRegistry: JobRegistry

  constructor(oracleContract: Contract, jobRegistry: JobRegistry) {
    super(oracleContract)
    this.jobRegistry = jobRegistry
  }

  /**
   * Runs a job by its ID with the provided arguments.
   * @param jobId - The ID of the job.
   * @param jobArgs - The encoded arguments for the job.
   * @returns The result of the job.
   */
  runJob(jobId: string, jobArgs: string) {
    const job = this.jobRegistry.getJob(jobId)
    if (!job) {
      throw new Error(`Job not found: ${jobId}`)
    }
    return job.run(jobArgs)
  }

  /**
   * Stores the request data in the database.
   */
  private async storeRequestData(params: OracleRequestParams) {
    console.log('ℹ️ Storing request...')
    try {
      await db.insert(requests).values(params).execute()
      console.log('ℹ️ Request stored')
    } catch (error) {
      throw new Error(`Error storing request: ${error}`)
    }
  }

  /**
   * Executes a job and returns the result.
   */
  private async executeJob(jobId: string, jobArgs: string): Promise<string> {
    console.log('ℹ️ Running job with id', jobId, 'and args', jobArgs)
    const jobResult = await this.runJob(jobId, jobArgs)
    console.log('ℹ️ Job result:', jobResult)
    return jobResult
  }

  /**
   * Fulfills the Oracle request with the job result.
   */
  private async fulfillRequest(requestId: string, jobResult: string) {
    console.log('ℹ️ Fulfilling OracleRequest...')
    const fulfillTx = await this.fulfillOracleRequest(requestId, jobResult)
    console.log('✅ OracleRequest fulfilled:', fulfillTx.hash)
  }

  /**
   * Handles incoming Oracle requests.
   */
  async handleOracleRequest(params: OracleRequestParams) {
    console.log('📋 New OracleRequest event with requestId', params.requestId, 'from', params.requesterAddress)
    try {
      await this.storeAndRunJob(params)
    } catch (error) {
      console.error('❌ Error handling OracleRequest:', error)
    }
  }

  /**
   * Stores the request, runs the job, and fulfills the Oracle request.
   */
  private async storeAndRunJob(params: OracleRequestParams) {
    await this.storeRequestData(params)
    const jobResult = await this.executeJob(params.jobId, params.jobArgs)
    await this.fulfillRequest(params.requestId, jobResult)
  }

  /**
   * Starts listening for OracleRequest events.
   */
  start() {
    this.onOracleRequest(this.handleOracleRequest.bind(this))
  }
}
