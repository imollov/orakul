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

    oracle = await ethers.deployContract("Oracle", [[], []]);
    await oracle.waitForDeployment();
    const oracleAddress = await oracle.getAddress();

    oracleClient = await ethers.deployContract("OracleClient", [oracleAddress]);
  });

  it("should deploy", async () => {
    expect(await oracle.getAddress()).to.be.properAddress;
  });

  it("should authorize requester", async () => {
    await expect(oracle.authorizeRequester(oracleClient.getAddress()))
      .to.emit(oracle, "RequesterAuthorized")
      .withArgs(oracleClient.getAddress());
  });

  it("should authorize node", async () => {
    await expect(oracle.authorizeNode(accounts[0].address))
      .to.emit(oracle, "NodeAuthorized")
      .withArgs(accounts[0].address);
  });

  // todo: split into two tests
  it("should make request and fulfill", async () => {
    const jobId = ethers.encodeBytes32String("test");
    const arg = 1;
    const request = await oracleClient.makeOracleRequest(jobId, arg);
    const tx = await request.wait();
    const event = decodeEvent(tx, oracle.interface);
    const requestId = event.args[0] as string;

    const fakeRes = 2n;
    const fakeResEncoded = new ethers.AbiCoder().encode(["uint256"], [fakeRes]);
    await oracle.fulfillOracleRequest(requestId, fakeResEncoded);
    const latestResult = await oracleClient.latestResult();

    expect(latestResult).to.equal(fakeRes);
  });
});

// todo: add specific types
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
