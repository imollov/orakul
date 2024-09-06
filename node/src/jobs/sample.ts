import { asJob } from '../core/job'

/**
 * A sample job that doubles an input number.
 */
export const sampleJob = asJob({
  name: 'Sample Job', // Unique name for the job
  inputTypes: ['uint256'], // Solidity type for input args
  outputTypes: ['uint256'], // Solidity type for the result
  fn: async (decodedArgs: unknown[]) => {
    const [num] = decodedArgs as [bigint]
    return num * 2n
  },
})
