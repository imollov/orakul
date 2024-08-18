import { ethers } from 'ethers'

import { Job } from '../types'

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
