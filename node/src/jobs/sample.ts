import { ethers } from 'ethers'
import { asJob } from '../core/job'

export const sampleJob = asJob({
  name: 'Sample Job',
  fn: async (args: string) => {
    const argsDecoded = new ethers.AbiCoder().decode(['uint256'], args)
    const num = BigInt(argsDecoded[0])
    const result = num * 2n
    const resultBytes = new ethers.AbiCoder().encode(['uint256'], [result])
    return new Promise((resolve) => resolve(resultBytes))
  },
})
