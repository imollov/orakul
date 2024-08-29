# Orakul: Blockchain Oracle Solution

> :warning: **This project is a work in progress and not ready for production use.**

Orakul is a complete oracle solution for Ethereum smart contracts. It solves the problem of connecting smart contracts with external data sources like APIs. Main goal is to provide a dead simple and flexible way to to achieve this with minimal effort and cost.

Third party services like Chainlink and Gelato are great, but they come with a cost and might not be ideal for simple or bootstrapped projects. Orakul is a self-hosted solution that can be deployed anywhere and used for free. It is designed to be simple and easy to use, but also flexible and extensible. It is built with TypeScript and Solidity and can be used with any Ethereum-compatible blockchain. In future it could be rewritten in Go or Rust for better performance and scalability.

## Table of Contents

- [Features](#features)
- [Components](#components)
- [Prerequisites](#prerequisites)
- [Usage](#usage)
  - [Deploy Oracle Contract](#deploy-oracle-contract)
  - [Use Oracle Contract](#use-oracle-contract)
  - [Develop Custom Jobs](#develop-custom-jobs)
  - [Deploy Oracle Node](#deploy-oracle-node)
- [Guides](#guides)
  - [Deploy to AWS](#deploy-to-aws)
- [Contributing](#contributing)
- [License](#license)

## Features

- [x] Request data from external APIs
- [x] Define custom jobs to process data
- [x] Deploy anywhere with Docker
- [ ] Dashboard for monitoring
- [ ] Muli-node support
- [ ] Scheduled jobs

## Components

- Oracle contracts
- Oracle node

## Prerequisites

- Node.js
- npm
- Docker
- Wallet
- RPC provider

## Usage

Clone the repository:

```bash
git clone git@github.com:imollov/blockchain-oracle.git
```

### Deploy Oracle Contract

1. In the `contracts` directory, install the dependencies:

```bash
npm install
```

2. Build the contracts:

```bash
npx hardhat compile
```

3. Create a `.env` file using the template and fill in the required values:

```bash
cp .env.example .env
```

4. Deploy the contracts:

```bash
npx hardhat run scripts/deploy_oracle.js --network <NETWORK>
```

### Use Oracle Contract

1. Import the Oracle client interface in your contract:

```solidity
import {IOracleClient} from "../interfaces/IOracleClient.sol";
```

2. Implement the `IOracleClient` interface in your contract:

```solidity
contract MyContract is IOracleClient {
    // Contract code
}
```

3. Set the Oracle contract address:

```solidity
constructor(address _oracle) {
    oracle = IOracle(_oracle);
}
```

4. Implement the `fulfillOracleRequest` function:

```solidity
function fulfillOracleRequest(bytes32 requestId, bytes32 data) external override {
    // Process the data
}
```

5. Request data from the Oracle contract:

```solidity
function requestData(bytes32 jobId, uint256 arg) public {
    bytes32 requestId = oracle.makeOracleRequest(jobId, abi.encode(arg));
    requests[requestId] = msg.sender;
}
```

6. After deploying the client contract, register it with the Oracle contract by calling the `authorizeRequester` from the Oracle contract owner account.

### Develop Custom Jobs

1. In the `node` directory, install the dependencies:

```bash
npm install
```

2. Create a new file in the `jobs` directory:

```bash
touch jobs/my-job.ts
```

3. Export a function that uses the `asJob` builder:

```typescript
import { asJob } from "../core/job";

export const myJob = asJob({
  name: 'Sample Job',
  fn: async (args: string) => {
    // Implement the job logic
  }
```

4. Add the job to the registry in the `jobs/index.ts` file:

```typescript
export * from "./my-job";
```

### Deploy Oracle Node

1. Create a `.env` file using the template and fill in the required values:

```bash
cp .env.example .env
```

2. Deploy the Oracle node:

```bash
docker compose up --build -d
```

## Guides

### Deploy to AWS

1. Create a new EC2 instance: Amazon Linux and t2.micro instance type.

2. In advance details, add the following user data:

```bash
#!/bin/bash

sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
```

3. Create a new key pair and allow SSH only.

4. Launch the instance.

5. Connect to the instance using SSH from the console or your terminal.

6. Switch to root user:

```bash
sudo su
```

7. Check docker version:

```bash
docker --version
```

8. Create `.env` file using the template from the repository. Use your preferred text editor, for example:

```bash
nano .env
```

9. Deploy the image from Docker Hub:

```bash
docker run --env-file .env imollov/blockchain-oracle
```

10. If everything is correct, you should see the following output:

```
🔗 Oracle contract...
👷🏼 Job registry...
🚀 Starting job client...
ℹ️ Listening for OracleRequest events...
```

## Contributing

Open an issue or submit a pull request.

## License

MIT
