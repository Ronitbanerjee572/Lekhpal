// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AdminControl.sol";

contract LandRegistry is AdminControl {

    struct Land {
        uint256 id;
        address currentOwner;
        string khatian;          // Parcha number
        string state;
        string city;
        string ward;
        uint256 area;            // sq units
        uint256 governmentValue; // valuation
        uint256 registeredAt;
        string deedType;
    }

    uint256 public landCount;

    mapping(uint256 => Land) public lands;
    mapping(uint256 => address[]) private ownershipHistory;
    mapping(string => uint256[]) private landsByKhatian;

    event LandRegistered(uint256 indexed landId, address indexed owner);
    event OwnershipTransferred(
        uint256 indexed landId,
        address indexed from,
        address indexed to,
        string deedType
    );
    event ValuationUpdated(uint256 indexed landId, uint256 value);

    // ---------------- ADMIN FUNCTIONS ----------------

    function registerLand(
        address owner,
        string memory khatian,
        string memory state,
        string memory city,
        string memory ward,
        uint256 area,
        uint256 valuation
    ) external onlyAdmin {
        landCount++;

        lands[landCount] = Land({
            id: landCount,
            currentOwner: owner,
            khatian: khatian,
            state: state,
            city: city,
            ward: ward,
            area: area,
            governmentValue: valuation,
            registeredAt: block.timestamp,
            deedType: "Registry"
        });

        ownershipHistory[landCount].push(owner);
        landsByKhatian[khatian].push(landCount);

        emit LandRegistered(landCount, owner);
    }

    function setValuation(uint256 landId, uint256 value)
        external
        onlyAdmin
    {
        lands[landId].governmentValue = value;
        emit ValuationUpdated(landId, value);
    }

    function transferOwnership(
        uint256 landId,
        address newOwner,
        string memory deedType
    ) external onlyAdmin {
        address oldOwner = lands[landId].currentOwner;

        lands[landId].currentOwner = newOwner;
        lands[landId].deedType = deedType;
        ownershipHistory[landId].push(newOwner);

        emit OwnershipTransferred(
            landId,
            oldOwner,
            newOwner,
            deedType
        );
    }

    // ---------------- READ-ONLY (PUBLIC) ----------------

    function getOwnershipHistory(uint256 landId)
        external
        view
        returns (address[] memory)
    {
        return ownershipHistory[landId];
    }

    function searchByKhatian(string memory khatian)
        external
        view
        returns (uint256[] memory)
    {
        return landsByKhatian[khatian];
    }

    function calculateTax(uint256 landId)
        external
        view
        returns (uint256)
    {
        // Example: 5% stamp duty
        return (lands[landId].governmentValue * 5) / 100;
    }

    // NEW GETTER FUNCTIONS for external contract access
    function getLandGovernmentValue(uint256 landId) 
        external 
        view 
        returns (uint256) 
    {
        return lands[landId].governmentValue;
    }

    function getLandOwner(uint256 landId) 
        external 
        view 
        returns (address) 
    {
        return lands[landId].currentOwner;
    }
}