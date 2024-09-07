// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IOracle} from "./interfaces/IOracle.sol";
import {IOracleClient} from "./interfaces/IOracleClient.sol";

/// @title Oracle Contract
/// @author @imollov
/// @notice This contract acts as an Oracle that listens to requests, allowing authorized nodes to fulfill those requests.
/// @dev Authorized nodes can fulfill requests created by authorized requesters, and the owner manages the authorizations.
contract Oracle is IOracle, Ownable {
    /*//////////////////////////////////////////////////////////////
                               STATE
    //////////////////////////////////////////////////////////////*/

    /// @notice Mapping to store details of Oracle requests by request ID
    mapping(bytes32 => Request) public requests;

    /// @notice Mapping to store authorized Oracle nodes
    mapping(address => bool) public authorizedNodes;

    /// @notice Mapping to store authorized requesters
    mapping(address => bool) public authorizedRequesters;

    /// @notice Struct to store information about an Oracle request
    struct Request {
        bytes32 jobId;
        address requester;
        bool pending;
    }

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Emitted when an Oracle request is made
    /// @param id The request ID
    /// @param jobId The ID of the job being requested
    /// @param args The arguments for the request
    /// @param requester The address of the requester
    event OracleRequest(
        bytes32 indexed id,
        bytes32 indexed jobId,
        bytes args,
        address requester
    );

    /// @notice Emitted when an Oracle request is fulfilled
    /// @param id The request ID
    /// @param requestId The request ID being fulfilled
    /// @param data The data returned from the Oracle
    event OracleFulfillment(
        bytes32 indexed id,
        bytes32 indexed requestId,
        bytes data
    );

    /// @notice Emitted when a node is authorized
    /// @param node The address of the authorized node
    event NodeAuthorized(address indexed node);

    /// @notice Emitted when a node is deauthorized
    /// @param node The address of the deauthorized node
    event NodeDeauthorized(address indexed node);

    /// @notice Emitted when a requester is authorized
    /// @param requester The address of the authorized requester
    event RequesterAuthorized(address indexed requester);

    /// @notice Emitted when a requester is deauthorized
    /// @param requester The address of the deauthorized requester
    event RequesterDeauthorized(address indexed requester);

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @notice Initializes the Oracle contract and sets the initial authorized nodes and requesters.
    /// @param _authorizedNodes The initial list of authorized node addresses
    /// @param _authorizedRequesters The initial list of authorized requester addresses
    constructor(
        address[] memory _authorizedNodes,
        address[] memory _authorizedRequesters
    ) Ownable(msg.sender) {
        for (uint256 i = 0; i < _authorizedNodes.length; i++) {
            authorizedNodes[_authorizedNodes[i]] = true;
        }
        for (uint256 i = 0; i < _authorizedRequesters.length; i++) {
            authorizedRequesters[_authorizedRequesters[i]] = true;
        }
    }

    /*//////////////////////////////////////////////////////////////
                               ACTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Allows an authorized requester to make an Oracle request
    /// @param _jobId The job ID being requested
    /// @param _args The arguments for the request
    /// @return The generated request ID
    function makeOracleRequest(
        bytes32 _jobId,
        bytes calldata _args
    ) public returns (bytes32) {
        require(authorizedRequesters[msg.sender], "Not authorized to request");

        bytes32 requestId = keccak256(abi.encodePacked(_jobId, _args));
        requests[requestId] = Request(_jobId, msg.sender, true);

        emit OracleRequest(requestId, _jobId, _args, msg.sender);

        return requestId;
    }

    /// @notice Allows an authorized node to fulfill an Oracle request
    /// @param _requestId The ID of the request to be fulfilled
    /// @param _data The data that fulfills the request
    function fulfillOracleRequest(
        bytes32 _requestId,
        bytes calldata _data
    ) external {
        require(authorizedNodes[msg.sender], "Not authorized to fulfill");
        require(requests[_requestId].jobId != 0, "Request not found");
        require(requests[_requestId].pending, "Request already fulfilled");

        requests[_requestId].pending = false;

        IOracleClient(requests[_requestId].requester).fulfillOracleRequest(
            _requestId,
            _data
        );
        emit OracleFulfillment(_requestId, _requestId, _data);
    }

    /*//////////////////////////////////////////////////////////////
                               OWNER ACTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Authorizes a new Oracle node to fulfill requests
    /// @param _address The address of the node to be authorized
    function authorizeNode(address _address) public onlyOwner {
        authorizedNodes[_address] = true;
        emit NodeAuthorized(_address);
    }

    /// @notice Deauthorizes an Oracle node
    /// @param _address The address of the node to be deauthorized
    function deauthorizeNode(address _address) public onlyOwner {
        authorizedNodes[_address] = false;
        emit NodeDeauthorized(_address);
    }

    /// @notice Authorizes a new requester to make Oracle requests
    /// @param _address The address of the requester to be authorized
    function authorizeRequester(address _address) public onlyOwner {
        authorizedRequesters[_address] = true;
        emit RequesterAuthorized(_address);
    }

    /// @notice Deauthorizes a requester
    /// @param _address The address of the requester to be deauthorized
    function deauthorizeRequester(address _address) public onlyOwner {
        authorizedRequesters[_address] = false;
        emit RequesterDeauthorized(_address);
    }
}
