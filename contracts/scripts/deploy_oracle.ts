// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // todo: get parameters from .env
  const authorizedNodes: string[] = [];
  const authorizedRequesters: string[] = [];

  const oracleFactory = await ethers.getContractFactory("Oracle");
  const oracle = await oracleFactory.deploy(
    authorizedNodes,
    authorizedRequesters
  );
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();

  console.log("Oracle deployed to:", oracleAddress);

  // For live testing purposes
  const oracleClientFactory = await ethers.getContractFactory("OracleClient");
  const oracleClient = await oracleClientFactory.deploy(oracleAddress);
  await oracleClient.waitForDeployment();
  const oracleClientAddress = await oracleClient.getAddress();

  console.log("OracleClient deployed to:", oracleClientAddress);

  oracle.authorizeRequester(oracleClientAddress);

  console.log("OracleClient authorized as requester");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
