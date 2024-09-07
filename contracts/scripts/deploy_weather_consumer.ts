// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // Retrieve oracle address from .env
  const oracleAddress = process.env.ORACLE_CONTRACT_ADDRESS || "";
  if (!oracleAddress) {
    throw new Error("ORACLE_CONTRACT_ADDRESS not found in .env");
  }

  // Deploy the Oracle contract
  const weatherConsumerFactory = await ethers.getContractFactory(
    "WeatherConsumer"
  );
  const weatherConsumer = await weatherConsumerFactory.deploy(oracleAddress);
  await weatherConsumer.waitForDeployment();
  const weatherConsumerAddress = await weatherConsumer.getAddress();

  console.log("WeatherConsumer deployed to:", weatherConsumerAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
