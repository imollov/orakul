# Orakul: Blockchain Oracle Solution

> 🚧 **This project is a work in progress and not ready for production use.**

Orakul is a complete oracle solution for Ethereum-compatible blockchains, addressing the challenge of connecting smart contracts with external data sources like APIs. Its main goal is to provide a simple and flexible way to achieve this with minimal effort and cost.

While third-party services like Chainlink and Gelato are powerful, they may not offer the level of control and customization you need. They can also be expensive or complex to use. Orakul is designed to be both simple and flexible, offering a free and open-source alternative that you can run on your own infrastructure and extend as needed.

## Table of Contents

- [Roadmap](#roadmap)
- [Usage](#usage)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Deploy Oracle Contract](#deploy-oracle-contract)
  - [Run Oracle Node](#run-oracle-node)
  - [Develop Client Contract](#develop-client-contract)
  - [Develop Custom Jobs](#develop-custom-jobs)
- [Examples](#examples)
  - [Weather Data Consumer](#weather-data-consumer)
- [Guides](#guides)
  - [Deploy to AWS](#deploy-to-aws)
- [Contributing](#contributing)
- [License](#license)

## Roadmap

- [x] Request external data from smart contracts
- [x] Develop custom jobs to process data
- [x] Run on your own infrastructure
- [ ] Dashboard for monitoring and managing jobs
- [ ] Multi-node support for high availability
- [ ] ZK proofs for data verification
- [ ] Job scheduling and automation
- [ ] Randomness generation
- [ ] Price feeds

## Usage

The solution consists of two main components:

- **Oracle contract**: Smart contract that acts as a bridge between the blockchain and the external world.
- **Oracle node**: Server application that listens for oracle request events and executes the corresponding jobs.

You first need to deploy the Oracle contract and develop a client contract that interacts with it. Afterward, you must run the node application, configured with the contract address and funded with enough tokens to cover gas fees. You can also create custom jobs that the node can execute. See the instructions below for more details.

### Prerequisites

- Node.js
- npm
- Docker
- Wallet
- RPC provider

### Installation

Clone the repository:

```bash
git clone git@github.com:imollov/orakul.git
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

### Run Oracle Node

1. Create a `.env` file using the template and fill in the required values:

```bash
cp .env.example .env
```

2. Deploy the Oracle node:

```bash
docker compose up --build -d
```

### Develop Client Contract

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

export const myJob = asJob<bigint, bigint>({
  name: 'My custom job',
  inputTypes: ['uint256'],
  outputTypes: ['uint256'],
  fn: async (arg) => {
    // Implement the job logic
  }
```

Notes:

- The `arg` parameter is the data passed from the client contract.
- The types of the arguments and return values can be customized by changing the generic types of the `asJob` function.
- Input and output types specify the Solidity types that will be used for encoding and decoding the data.

4. Add the job to the registry in the `jobs/index.ts` file:

```typescript
export * from "./my-job";
```

## Examples

### Weather Data Consumer

// TODO

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
```

## Contributing

Open an issue or submit a pull request.

## License

MIT
