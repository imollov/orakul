// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IOracle} from "../interfaces/IOracle.sol";
import {IOracleClient} from "../interfaces/IOracleClient.sol";

/// @title WeatherConsumer Contract
/// @author @imollov
/// @notice This contract interacts with an oracle to request and receive weather data (temperature) for specific locations.
/// @dev This contract makes requests to an external oracle and stores the fulfilled data in a mapping using request IDs.
contract WeatherConsumer is IOracleClient {
    /*//////////////////////////////////////////////////////////////
                                STATE
    //////////////////////////////////////////////////////////////*/

    /// @notice The constant Job ID used to request weather data from the oracle.
    bytes32 private constant JOB_ID = 0x476574205765617468657220446174612066726f6d2041504900000000000000;

    /// @notice The oracle contract responsible for fulfilling the weather data request.
    IOracle private oracle;

    /// @notice Mapping to store the weather data results based on request IDs.
    mapping(bytes32 => string) private weatherResults;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Emitted when a weather data request is made to the oracle.
    /// @param jobId The ID of the requested job.
    /// @param requestId The unique ID for the request.
    /// @param lat The latitude of the requested location.
    /// @param lon The longitude of the requested location.
    event WeatherDataRequested(
        bytes32 indexed jobId,
        bytes32 indexed requestId,
        string lat,
        string lon
    );

    /// @notice Emitted when the weather data is successfully fulfilled by the oracle.
    /// @param requestId The unique ID for the request.
    /// @param result The fulfilled weather data (temperature).
    event WeatherDataFulfilled(bytes32 indexed requestId, string result);

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @notice Initializes the WeatherConsumer contract with the oracle address.
    /// @param _oracle The address of the oracle contract.
    constructor(IOracle _oracle) {
        oracle = _oracle;
    }

    /*//////////////////////////////////////////////////////////////
                               ACTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Requests weather data (temperature) for a specific latitude and longitude.
    /// @dev This function sends a request to the oracle to fetch weather data. It also generates a unique request ID.
    /// Emits a {WeatherDataRequested} event.
    /// @param lat The latitude of the location (in string format).
    /// @param lon The longitude of the location (in string format).
    function requestWeatherData(
        string calldata lat,
        string calldata lon
    ) external {
        bytes32 requestId = oracle.makeOracleRequest(
            JOB_ID,
            abi.encode(lat, lon)
        );
        emit WeatherDataRequested(JOB_ID, requestId, lat, lon);
    }

    /// @notice Callback function invoked by the oracle to fulfill the weather data request.
    /// @dev This function decodes the returned data and stores the result in a mapping.
    /// Emits a {WeatherDataFulfilled} event.
    /// @param requestId The unique ID for the request.
    /// @param data The encoded data returned from the oracle, expected to be the temperature.
    function fulfillOracleRequest(
        bytes32 requestId,
        bytes calldata data
    ) external override {
        string memory result = abi.decode(data, (string)); // Decode the data as a string (e.g., temperature)
        weatherResults[requestId] = result; // Store the result in the mapping
        emit WeatherDataFulfilled(requestId, result);
    }

    /*//////////////////////////////////////////////////////////////
                              GETTERS
    //////////////////////////////////////////////////////////////*/

    /// @notice Retrieves the weather data for a specific request ID.
    /// @param requestId The unique ID of the oracle request.
    /// @return The weather data associated with the given request ID.
    function getWeatherResult(
        bytes32 requestId
    ) external view returns (string memory) {
        return weatherResults[requestId];
    }
}
