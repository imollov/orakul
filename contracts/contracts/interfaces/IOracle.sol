// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

/// @title IOracle Interface
/// @notice Interface for Oracle contracts that allows OracleClient contracts to make requests.
/// @dev This interface defines the function needed by the OracleClient to interact with an Oracle contract.
interface IOracle {
    /// @notice Called by OracleClient to make a new Oracle request.
    /// @param _jobId The ID of the job being requested.
    /// @param _args The encoded arguments for the job.
    /// @return requestId The ID of the created Oracle request.
    function makeOracleRequest(
        bytes32 _jobId,
        bytes calldata _args
    ) external returns (bytes32 requestId);

    /// @notice Fulfills an Oracle request with the data provided by the Oracle.
    /// @param requestId The ID of the request being fulfilled.
    /// @param data The data returned from the Oracle for the request.
    function fulfillOracleRequest(
        bytes32 requestId,
        bytes calldata data
    ) external;
}
