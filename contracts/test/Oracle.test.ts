import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

import { Oracle, OracleClient } from "../typechain-types";

describe("Oracle", () => {
  let oracle: Oracle;
  let oracleClient: OracleClient;
  let accounts: SignerWithAddress[];

  before(async () => {
    accounts = await ethers.getSigners();

    // Deploy Oracle with no authorized nodes or requesters initially
    oracle = await ethers.deployContract("Oracle", [[], []]);
    await oracle.waitForDeployment();
    const oracleAddress = await oracle.getAddress();

    // Deploy OracleClient with Oracle address
    oracleClient = await ethers.deployContract("OracleClient", [oracleAddress]);
    await oracleClient.waitForDeployment();
  });

  it("should deploy Oracle and OracleClient contracts", async () => {
    expect(await oracle.getAddress()).to.be.properAddress;
    expect(await oracleClient.getAddress()).to.be.properAddress;
  });

  it("should authorize OracleClient as a requester", async () => {
    await expect(oracle.authorizeRequester(oracleClient.getAddress()))
      .to.emit(oracle, "RequesterAuthorized")
      .withArgs(oracleClient.getAddress());
  });

  it("should authorize a node", async () => {
    await expect(oracle.authorizeNode(accounts[0].address))
      .to.emit(oracle, "NodeAuthorized")
      .withArgs(accounts[0].address);
  });

  it("should make an Oracle request", async () => {
    const jobId = ethers.encodeBytes32String("testJob");
    const arg = 42;

    // OracleClient makes a request to the Oracle
    const requestTx = await oracleClient.makeOracleRequest(jobId, arg);
    const tx = await requestTx.wait();

    // Decode the OracleRequest event emitted by Oracle
    const event = decodeEvent(tx, oracle.interface);
    const requestId = event.args[0] as string;

    expect(requestId).to.be.properHex;
  });

  it("should fulfill an Oracle request", async () => {
    const jobId = ethers.encodeBytes32String("testJob");
    const arg = 1;

    // OracleClient makes a request
    const requestTx = await oracleClient.makeOracleRequest(jobId, arg);
    const tx = await requestTx.wait();

    // Decode the OracleRequest event and extract the requestId
    const event = decodeEvent(tx, oracle.interface);
    const requestId = event.args[0] as string;

    // Simulate fulfillment by the Oracle with a fake result
    const fakeResult = 2n;
    const fakeResultEncoded = new ethers.AbiCoder().encode(
      ["uint256"],
      [fakeResult]
    );

    await expect(oracle.fulfillOracleRequest(requestId, fakeResultEncoded))
      .to.emit(oracle, "OracleFulfillment")
      .withArgs(requestId, requestId, fakeResultEncoded);

    const latestResult = await oracleClient.latestResult();
    expect(latestResult).to.equal(fakeResult);
  });

  it("should revert when fulfilling with an unauthorized node", async () => {
    const jobId = ethers.encodeBytes32String("testJob");
    const arg = 42;

    // OracleClient makes a request
    const requestTx = await oracleClient.makeOracleRequest(jobId, arg);
    const tx = await requestTx.wait();

    // Decode the OracleRequest event and extract the requestId
    const event = decodeEvent(tx, oracle.interface);
    const requestId = event.args[0] as string;

    const fakeResult = 42n;
    const fakeResultEncoded = new ethers.AbiCoder().encode(
      ["uint256"],
      [fakeResult]
    );

    // Try to fulfill from an unauthorized address
    await expect(
      oracle
        .connect(accounts[1])
        .fulfillOracleRequest(requestId, fakeResultEncoded)
    ).to.be.revertedWith("Not authorized to fulfill");
  });

  it("should revert when fulfilling a non-existent request", async () => {
    const fakeRequestId = ethers.encodeBytes32String("nonExistentRequest");
    const fakeResultEncoded = new ethers.AbiCoder().encode(["uint256"], [42n]);

    await expect(
      oracle.fulfillOracleRequest(fakeRequestId, fakeResultEncoded)
    ).to.be.revertedWith("Request not found");
  });

  it("should revert when the same request is fulfilled twice", async () => {
    const jobId = ethers.encodeBytes32String("testJob");
    const arg = 1;

    // OracleClient makes a request
    const requestTx = await oracleClient.makeOracleRequest(jobId, arg);
    const tx = await requestTx.wait();

    // Decode the OracleRequest event and extract the requestId
    const event = decodeEvent(tx, oracle.interface);
    const requestId = event.args[0] as string;

    const fakeResult = 42n;
    const fakeResultEncoded = new ethers.AbiCoder().encode(
      ["uint256"],
      [fakeResult]
    );

    // First fulfillment should succeed
    await oracle.fulfillOracleRequest(requestId, fakeResultEncoded);

    // Second fulfillment should revert
    await expect(
      oracle.fulfillOracleRequest(requestId, fakeResultEncoded)
    ).to.be.revertedWith("Request already fulfilled");
  });
});

// Helper function to decode an event from a transaction
function decodeEvent(tx: any, iface: any) {
  const event: Event = tx.logs?.find((e: Event) => {
    let result = true;
    try {
      iface.parseLog(e);
    } catch (ex) {
      result = false;
    }
    return result;
  })!;

  return iface.parseLog(event);
}
