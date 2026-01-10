// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AdminControl.sol";
import "./LandRegistry.sol";

contract LandEscrow is AdminControl {

    LandRegistry public registry;

    struct Deal {
        address buyer;
        uint256 landId;
        uint256 amount;
        bool completed;
    }

    uint256 public dealCount;
    mapping(uint256 => Deal) public deals;

    event DealInitiated(uint256 indexed dealId, uint256 landId, address buyer);
    event DealCompleted(uint256 indexed dealId);

    constructor(address registryAddress) {
        registry = LandRegistry(registryAddress);
    }

    // Buyer sends money (ESCROW)
    function initiateDeal(uint256 landId) external payable {
        uint256 minValue = registry.getLandGovernmentValue(landId); // Using getter function
        require(msg.value >= minValue, "Below government valuation");

        dealCount++;
        deals[dealCount] = Deal({
            buyer: msg.sender,
            landId: landId,
            amount: msg.value,
            completed: false
        });

        emit DealInitiated(dealCount, landId, msg.sender);
    }

    // Admin approves deal (money + ownership together)
    function approveDeal(uint256 dealId) external onlyAdmin {
        Deal storage d = deals[dealId];
        require(!d.completed, "Already completed");

        address seller = registry.getLandOwner(d.landId); // Using getter function

        payable(seller).transfer(d.amount);

        registry.transferOwnership(
            d.landId,
            d.buyer,
            "Sale Deed"
        );

        d.completed = true;

        emit DealCompleted(dealId);
    }
}