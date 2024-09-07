import { asJob } from '../core/job'

/**
 * A sample job that doubles an input number.
 */
export const sampleJob = asJob<bigint, bigint>({
  name: 'Double Number',
  inputTypes: ['uint256'],
  outputTypes: ['uint256'],
  fn: async (num) => {
    return num * 2n
  },
})
