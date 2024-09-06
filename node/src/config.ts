import * as dotenv from 'dotenv'
dotenv.config()

export const config = {
  RPC_URL: process.env.RPC_URL || 'http://localhost:8545',
  PRIVATE_KEY: process.env.PRIVATE_KEY || 'Unset Private Key',
  ORACLE_ADDRESS: process.env.ORACLE_ADDRESS || 'Unset Oracle Address',
}
