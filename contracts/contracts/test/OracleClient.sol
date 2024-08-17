// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import {Oracle} from "../Oracle.sol"; // todo: replace with interface
import {IOracleClient} from "../interfaces/IOracleClient.sol";

contract OracleClient is IOracleClient {
    address public oracle;
    uint256 public latestResult;

    constructor(address _oracle) {
        oracle = _oracle;
    }

    // ACTIONS

    function makeOracleRequest(bytes32 _jobId, uint256 _arg) external {
        Oracle(oracle).makeOracleRequest(_jobId, abi.encode(_arg));
    }

    function fulfillOracleRequest(
        bytes32,
        bytes calldata data
    ) external override {
        require(msg.sender == oracle, "Only oracle can fulfill");
        latestResult = abi.decode(data, (uint256));
    }
}
