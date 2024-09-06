// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

/// @title IOracleClient Interface
/// @notice Interface for any contract that interacts with the Oracle to handle fulfillment of Oracle requests.
/// @dev Contracts implementing this interface must define the logic for processing Oracle request fulfillments.
interface IOracleClient {
    /// @notice Fulfills an Oracle request.
    /// @dev This function is called by the Oracle contract when a request is fulfilled.
    /// The implementing contract should handle the fulfillment logic, typically involving the usage of the returned data.
    /// @param requestId The ID of the Oracle request being fulfilled.
    /// @param data The data returned from the Oracle in response to the request.
    function fulfillOracleRequest(
        bytes32 requestId,
        bytes calldata data
    ) external;
}
