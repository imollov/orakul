// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IOracleClient} from "./interfaces/IOracleClient.sol";

contract Oracle is Ownable {
    mapping(bytes32 => Request) public requests;
    mapping(address => bool) public authorizedNodes;
    mapping(address => bool) public authorizedRequesters;

    struct Request {
        bytes32 jobId;
        address requester;
        bool pending;
    }

    event OracleRequest(
        bytes32 indexed id,
        bytes32 indexed jobId,
        bytes args,
        address requester
    );
    event OracleFulfillment(
        bytes32 indexed id,
        bytes32 indexed requestId,
        bytes data
    );
    event NodeAuthorized(address indexed node);
    event NodeDeauthorized(address indexed node);
    event RequesterAuthorized(address indexed requester);
    event RequesterDeauthorized(address indexed requester);

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

    // ACTIONS

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

    // OWNER

    function authorizeNode(address _address) public onlyOwner {
        authorizedNodes[_address] = true;
        emit NodeAuthorized(_address);
    }

    function deauthorizeNode(address _address) public onlyOwner {
        authorizedNodes[_address] = false;
        emit NodeDeauthorized(_address);
    }

    function authorizeRequester(address _address) public onlyOwner {
        authorizedRequesters[_address] = true;
        emit RequesterAuthorized(_address);
    }

    function deauthorizeRequester(address _address) public onlyOwner {
        authorizedRequesters[_address] = false;
        emit RequesterDeauthorized(_address);
    }
}
