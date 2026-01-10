// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AdminControl {
    address public admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin allowed");
        _;
    }

    constructor() {
        admin = msg.sender;
    }
}