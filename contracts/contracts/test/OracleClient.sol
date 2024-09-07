// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IOracle} from "../interfaces/IOracle.sol";
import {IOracleClient} from "../interfaces/IOracleClient.sol";

contract OracleClient is IOracleClient {
    IOracle public oracle;
    uint256 public latestResult;

    constructor(IOracle _oracle) {
        oracle = IOracle(_oracle);
    }

    function makeOracleRequest(bytes32 _jobId, uint256 _arg) external {
        oracle.makeOracleRequest(_jobId, abi.encode(_arg));
    }

    function fulfillOracleRequest(
        bytes32,
        bytes calldata data
    ) external override {
        latestResult = abi.decode(data, (uint256));
    }
}
