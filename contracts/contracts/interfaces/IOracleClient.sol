// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IOracleClient {
    function fulfillOracleRequest(
        bytes32 requestId,
        bytes calldata data
    ) external;
}
