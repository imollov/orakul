import { ethers } from 'ethers'

/**
 * Parameters to create a Job instance.
 */
export type JobParams = {
  name: string // Unique name for the job
  inputTypes: string[] // Solidity types for input args
  outputTypes: string[] // Solidity types for output
  fn: (decodedArgs: unknown[]) => Promise<unknown> // Function to execute
}

/**
 * Factory function to create a Job instance.
 */
export const asJob = ({ name, inputTypes, outputTypes, fn }: JobParams): Job => {
  const id = ethers.encodeBytes32String(name)
  return new Job(id, name, inputTypes, outputTypes, fn)
}

/**
 * Registers a set of jobs and returns a JobRegistry.
 */
export const registerJobs = (jobModules: Record<string, Job>) => {
  return new JobRegistry(jobModules)
}

/**
 * Represents a job with input/output Solidity types and a function to execute.
 */
export class Job {
  id: string
  name: string
  inputTypes: string[] // Solidity types for decoding input args
  outputTypes: string[] // Solidity types for encoding result
  fn: (decodedArgs: unknown[]) => Promise<unknown>

  constructor(
    id: string,
    name: string,
    inputTypes: string[],
    outputTypes: string[],
    fn: (decodedArgs: unknown[]) => Promise<unknown>,
  ) {
    this.id = id
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
    const decodedArgs = new ethers.AbiCoder().decode(this.inputTypes, encodedArgs)
    const result = await this.fn(decodedArgs)
    return new ethers.AbiCoder().encode(this.outputTypes, [result])
  }
}

/**
 * Manages a registry of jobs.
 */
export class JobRegistry {
  private registry: Record<string, Job> = {}

  constructor(jobModules: Record<string, Job>) {
    this.registerJobs(jobModules)
  }

  /**
   * Registers multiple jobs into the registry.
   */
  private registerJobs(jobModules: Record<string, Job>) {
    Object.values(jobModules).forEach((job) => {
      this.registry[job.id] = job
    })
  }

  /**
   * Retrieves a job by its ID.
   */
  getJob(jobId: string): Job | undefined {
    return this.registry[jobId]
  }

  /**
   * Lists the details of all registered jobs.
   */
  listJobDetails() {
    return Object.values(this.registry).map((job) => ({
      id: job.id,
      name: job.name,
    }))
  }
}
