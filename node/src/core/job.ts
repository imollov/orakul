import { ethers } from 'ethers'

import { Job, JobRegistry } from '../types'

type JobParams = {
  name: string
  fn: (args: string) => Promise<string>
}

export const asJob = ({ name, fn }: JobParams): Job => {
  return {
    name,
    run: fn,
    id: ethers.encodeBytes32String(name),
  }
}

export const registerJobs = (jobModules: Record<string, Job>): JobRegistry =>
  Object.values(jobModules).reduce((acc, job) => ({ ...acc, [job.id]: job }), {})
