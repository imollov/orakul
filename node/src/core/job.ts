import { ethers } from 'ethers'

/**
 * A type alias for a function that processes job arguments and returns a result.
 */
export type JobFunction<TArgs, TResult> = (decodedArgs: TArgs) => Promise<TResult>

/**
 * Parameters to create a Job instance with type safety.
 */
export type JobParams<TArgs, TResult> = {
  name: string // Unique name for the job
  inputTypes: string[] // Solidity types for input args
  outputTypes: string[] // Solidity types for output
  fn: JobFunction<TArgs, TResult> // Function to execute with typed args and result
}

/**
 * Factory function to create a Job instance with type safety.
 */
export const asJob = <TArgs, TResult>(params: JobParams<TArgs, TResult>): Job<TArgs, TResult> => {
  return new Job(params)
}

/**
 * Registers a set of jobs and returns a JobRegistry.
 */
export const registerJobs = (jobModules: Record<string, Job<any, any>>) => {
  return new JobRegistry(jobModules)
}

/**
 * Represents a job with input/output Solidity types and a function to execute.
 */
export class Job<TArgs = unknown, TResult = unknown> {
  id: string
  name: string
  inputTypes: string[]
  outputTypes: string[]
  fn: JobFunction<TArgs, TResult>

  constructor({ name, inputTypes, outputTypes, fn }: JobParams<TArgs, TResult>) {
    this.id = ethers.encodeBytes32String(name)
    this.name = name
    this.inputTypes = inputTypes
    this.outputTypes = outputTypes
    this.fn = fn
  }

  /**
   * Decodes the input arguments, runs the job, and encodes the result.
   * @param encodedArgs - The encoded arguments to decode.
   * @returns The encoded result.
   */
  async run(encodedArgs: string): Promise<string> {
    const decodedArgs = new ethers.AbiCoder().decode(this.inputTypes, encodedArgs) as TArgs
    const result = await this.fn(decodedArgs)
    return new ethers.AbiCoder().encode(this.outputTypes, [result])
  }
}

/**
 * Manages a registry of jobs.
 */
export class JobRegistry {
  private registry: Map<string, Job> = new Map()

  constructor(jobModules: Record<string, Job>) {
    this.registerJobs(jobModules)
  }

  /**
   * Registers multiple jobs into the registry.
   */
  private registerJobs(jobModules: Record<string, Job>) {
    Object.values(jobModules).forEach((job) => {
      this.registry.set(job.id, job)
    })
  }

  /**
   * Retrieves a job by its ID.
   */
  getJob(jobId: string): Job | undefined {
    return this.registry.get(jobId)
  }

  /**
   * Deletes a job by its ID.
   */
  deleteJob(jobId: string): boolean {
    return this.registry.delete(jobId)
  }

  /**
   * Checks if a job exists by its ID.
   */
  hasJob(jobId: string): boolean {
    return this.registry.has(jobId)
  }

  /**
   * Lists the details of all registered jobs.
   */
  listJobDetails() {
    return Array.from(this.registry.values()).map((job) => ({
      id: job.id,
      name: job.name,
    }))
  }
}
