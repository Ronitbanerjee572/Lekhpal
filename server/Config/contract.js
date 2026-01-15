const { ethers } = require('ethers');

// Contract addresses
const LAND_REGISTRY_ADDRESS = "0x3C4A068c391D242Cd9821539113395657D36741e";
const ESCROW_ADDRESS = "0xC38333feEc975a052628385705b9213eecED305C";

// Land Registry ABI
const LAND_REGISTRY_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "landId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "LandRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "landId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "deedType",
        "type": "string"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "landId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "ValuationUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "landId",
        "type": "uint256"
      }
    ],
    "name": "calculateTax",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "landId",
        "type": "uint256"
      }
    ],
    "name": "getLandGovernmentValue",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "landId",
        "type": "uint256"
      }
    ],
    "name": "getLandOwner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "landId",
        "type": "uint256"
      }
    ],
    "name": "getOwnershipHistory",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "landCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "lands",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "currentOwner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "khatian",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "state",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "city",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "ward",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "area",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "governmentValue",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "registeredAt",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "deedType",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "khatian",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "state",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "city",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "ward",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "area",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "valuation",
        "type": "uint256"
      }
    ],
    "name": "registerLand",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "khatian",
        "type": "string"
      }
    ],
    "name": "searchByKhatian",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "landId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "setValuation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "landId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "deedType",
        "type": "string"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Escrow ABI
const ESCROW_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "dealId",
        "type": "uint256"
      }
    ],
    "name": "approveDeal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "registryAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "dealId",
        "type": "uint256"
      }
    ],
    "name": "DealCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "dealId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "landId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      }
    ],
    "name": "DealInitiated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "landId",
        "type": "uint256"
      }
    ],
    "name": "initiateDeal",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "dealCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "deals",
    "outputs": [
      {
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "landId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "completed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "registry",
    "outputs": [
      {
        "internalType": "contract LandRegistry",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Initialize provider and wallet
const RPC_URL = process.env.RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/m5AHUvA6ATZVN1iZ8gZdw";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
    console.error("⚠️  WARNING: PRIVATE_KEY not set in .env file!");
}

let provider, wallet, landRegistryContract, escrowContract;

try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Verify network connection
    provider.getNetwork().then(network => {
        console.log("📡 Connected to network:", network.name, "Chain ID:", network.chainId);
        if (network.chainId !== 11155111n) {
            console.warn("⚠️  WARNING: Not connected to Sepolia testnet (expected chainId 11155111)");
        }
    }).catch(err => {
        console.error("❌ Failed to verify network:", err.message);
    });
    
    if (PRIVATE_KEY) {
        wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        
        // Initialize contracts with signer
        landRegistryContract = new ethers.Contract(
            LAND_REGISTRY_ADDRESS,
            LAND_REGISTRY_ABI,
            wallet
        );
        
        escrowContract = new ethers.Contract(
            ESCROW_ADDRESS,
            ESCROW_ABI,
            wallet
        );
        
        console.log("✅ Contracts initialized with wallet:", wallet.address);
    } else {
        // Initialize read-only contracts
        landRegistryContract = new ethers.Contract(
            LAND_REGISTRY_ADDRESS,
            LAND_REGISTRY_ABI,
            provider
        );
        
        escrowContract = new ethers.Contract(
            ESCROW_ADDRESS,
            ESCROW_ABI,
            provider
        );
        
        console.log("⚠️  Contracts initialized in READ-ONLY mode");
    }
} catch (error) {
    console.error("❌ Failed to initialize contracts:", error.message);
}

module.exports = {
    provider,
    wallet,
    landRegistryContract,
    escrowContract,
    LAND_REGISTRY_ADDRESS,
    ESCROW_ADDRESS
};
