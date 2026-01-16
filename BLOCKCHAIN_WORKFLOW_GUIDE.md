# Blockchain Transaction Workflow - Technical Deep Dive

## 🎯 Complete Transaction Flow Explained

Let's trace a real land purchase from clicking "Buy" to ownership transfer, explaining every technical concept.

---

## 📚 Core Concepts

### 1. **Signer** 
A **signer** is a wallet (account) that can **sign and send transactions** to the blockchain.

```javascript
// Frontend: User's MetaMask wallet
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner(); // User's wallet

// Backend: Server wallet (stored private key)
const wallet = new ethers.Wallet(privateKey, provider); // Admin wallet
```

**Key Points:**
- **Provider**: Read-only connection to blockchain (query data)
- **Signer**: Can WRITE to blockchain (send transactions)
- **User as Signer**: Signs with MetaMask (private key stays in browser)
- **Backend as Signer**: Signs with stored private key (for admin actions)

**Why Two Signers?**
```
User Wallet (MetaMask)    →  Pays for purchases, owns lands
Backend Wallet (Server)   →  Admin actions (register lands, approve deals)
```

---

### 2. **Gas & Gas Fees**

**Gas** = Computational units required to execute a transaction

```
Total Cost = Gas Units Used × Gas Price (in Gwei)
```

**Real Example from Your Code:**
```javascript
// UserDashboard.jsx - Buying land
const tx = await escrowWithSigner.initiateDeal(land.id, {
  value: landValue,        // ETH sent to escrow (e.g., 5 ETH)
  gasLimit: 300000        // Max gas willing to pay
});
```

**What Happens:**
```
Transaction Cost Breakdown:
├─ Land Price: 5 ETH (goes to seller)
├─ Gas Fee: ~0.002 ETH (goes to network validators)
└─ Total Deducted from Buyer: 5.002 ETH

Gas Calculation:
├─ Gas Used: ~200,000 units (actual computation)
├─ Gas Price: 10 Gwei (network congestion determines this)
└─ Gas Fee: 200,000 × 10 / 1,000,000,000 = 0.002 ETH
```

**Why gasLimit?**
- **Safety Cap**: Prevent runaway costs if transaction fails
- **Too Low**: Transaction fails with "out of gas"
- **Too High**: Only actual gas used is charged

**Backend Example:**
```javascript
// blockchain.js - Admin registering land
const tx = await landRegistryContract.registerLand(
  ownerAddress,
  khatian,
  state,
  city,
  ward,
  areaInUnits,
  valuationInWei,
  { gasLimit: 500000 } // Admin pays gas fee
);
```

**Who Pays Gas?**
```
User Actions     → User pays (from MetaMask)
Admin Actions    → Backend wallet pays (deducted from server wallet)
```

---

### 3. **Contract-to-Contract Communication**

Your system has **3 smart contracts** that talk to each other:

```
┌──────────────────┐
│  AdminControl    │ ← Base contract (admin management)
└────────┬─────────┘
         │ (inherits)
    ┌────┴────┬────────┐
    ▼         ▼        ▼
┌────────┐ ┌──────────┐
│Registry│ │  Escrow  │
└────────┘ └──────────┘
     ▲          │
     └──────────┘ (references)
```

**How They Communicate:**

#### Example 1: Escrow Checking Land Owner
```solidity
// LandEscrow.sol
contract LandEscrow {
    LandRegistry public registry; // Reference to Registry contract
    
    constructor(address registryAddress) {
        registry = LandRegistry(registryAddress); // Store reference
    }
    
    function approveDeal(uint256 dealId) external {
        Deal storage d = deals[dealId];
        
        // COMMUNICATION: Escrow asks Registry for owner
        address seller = registry.getLandOwner(d.landId);
        
        // Transfer money to seller
        payable(seller).transfer(d.amount);
        
        // COMMUNICATION: Escrow tells Registry to transfer ownership
        registry.transferOwnership(d.landId, d.buyer, "Sale Deed");
    }
}
```

**How It Works:**
1. **Address Injection**: Registry address passed in constructor
2. **Interface Creation**: Escrow creates Registry interface
3. **Function Calls**: Escrow calls Registry functions as if local
4. **State Reading**: Can read Registry's storage
5. **State Writing**: Can trigger Registry's state changes

**Real Deployment:**
```javascript
// config/contract.js
const LAND_REGISTRY_ADDRESS = "0x1234..."; // Deployed first
const ESCROW_ADDRESS = "0x5678...";        // Deployed second (receives Registry address)

// When deploying Escrow:
const escrow = await EscrowFactory.deploy(LAND_REGISTRY_ADDRESS);
```

#### Example 2: Registry Checking Admin Permission
```solidity
// LandRegistry.sol
contract LandRegistry is AdminControl {
    function registerLand(...) external onlyAdmin { // Uses AdminControl modifier
        // Only executes if msg.sender == admin
        lands[landCount] = Land({...});
    }
}
```

**Inheritance Flow:**
```
AdminControl has:     ├─ address admin
                      └─ modifier onlyAdmin

LandRegistry inherits ├─ Gets admin variable
                      └─ Gets onlyAdmin modifier
                      
When registerLand() called:
1. onlyAdmin checks msg.sender == admin
2. If true, continue to function body
3. If false, revert transaction
```

---

## 🔄 Complete Workflow: Land Purchase

### Scenario: Alice buys Bob's land for 5 ETH

---

### **PHASE 1: Listing Creation (Off-Chain)**

```
┌─────────────────────────────────────────────────────────┐
│  Bob (Seller) → Frontend → Backend → MongoDB           │
└─────────────────────────────────────────────────────────┘
```

**Step 1.1: Bob Submits Listing**
```javascript
// Frontend: UserDashboard.jsx
const handleSubmitListing = async () => {
  await axios.post(`${API_URL}/marketplace/listings`, {
    landId: 42,
    priceEth: "5"
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
```

**Step 1.2: Backend Processes**
```javascript
// Backend: marketplace.js
async function submitSaleListing(req, res) {
  const { landId, priceEth } = req.body;
  
  // Convert ETH to Wei
  const priceWei = ethers.parseEther(priceEth).toString();
  // "5" → "5000000000000000000" (18 zeros)
  
  // Save to database
  const listing = await SaleListing.create({
    userId: req.user._id,  // Bob's ID
    landId: 42,
    priceWei: "5000000000000000000",
    status: 'pending'
  });
}
```

**Step 1.3: Admin Approves (Off-Chain)**
```javascript
// Frontend: GovDashboard.jsx
const handleApproveSaleListing = async (listingId) => {
  await axios.post(`${API_URL}/marketplace/listings/status`, {
    listingId,
    status: 'approved'
  });
};

// Backend: Updates MongoDB
listing.status = 'approved';
await listing.save();
```

**Result:** Listing now visible in marketplace UI

---

### **PHASE 2: Purchase Initiation (On-Chain)**

```
┌─────────────────────────────────────────────────────────┐
│  Alice (Buyer) → MetaMask → Blockchain → Smart Contract│
└─────────────────────────────────────────────────────────┘
```

**Step 2.1: Alice Clicks "Buy Now"**
```javascript
// Frontend: Marketplace.jsx
const handleBuyLand = async (listing) => {
  // 1. Connect to MetaMask
  const provider = new ethers.BrowserProvider(window.ethereum);
  
  // 2. Get Alice's wallet as signer
  const signer = await provider.getSigner();
  // Alice's address: 0xAlice123...
  
  // 3. Create contract instance with Alice's signer
  const escrowWithSigner = new ethers.Contract(
    ESCROW_ADDRESS,
    ESCROW_ABI,
    signer // Alice will sign the transaction
  );
  
  // 4. Check Alice's balance
  const balance = await provider.getBalance(await signer.getAddress());
  console.log("Alice's Balance:", ethers.formatEther(balance));
  // Output: "10.5 ETH" (she has enough!)
  
  // 5. Prepare transaction
  const tx = await escrowWithSigner.initiateDeal(
    listing.landId, // 42
    {
      value: listing.priceWei, // "5000000000000000000" Wei = 5 ETH
      gasLimit: 300000         // Max gas willing to spend
    }
  );
  
  // At this point, MetaMask pops up!
};
```

**Step 2.2: MetaMask Popup**
```
┌─────────────────────────────────────────┐
│  MetaMask Confirmation                   │
├─────────────────────────────────────────┤
│  Send to: LandEscrow Contract           │
│  From: 0xAlice123...                    │
│  Amount: 5 ETH                          │
│  Gas Fee: ~0.002 ETH (estimated)        │
│  Total: 5.002 ETH                       │
│                                         │
│  [Reject] [Confirm]                     │
└─────────────────────────────────────────┘
```

**What MetaMask Does:**
1. **Signs Transaction**: Uses Alice's private key (never leaves browser)
2. **Broadcasts**: Sends signed transaction to Ethereum network
3. **Returns Hash**: Transaction hash for tracking

```javascript
// After Alice confirms:
console.log("Transaction Hash:", tx.hash);
// Output: "0xabc123def456..." (unique transaction ID)
```

**Step 2.3: Transaction in Mempool**
```
Ethereum Network (Sepolia Testnet):
┌────────────────────────────────────┐
│  Mempool (Pending Transactions)    │
├────────────────────────────────────┤
│  Tx: 0xabc123...                   │
│  From: 0xAlice123...               │
│  To: LandEscrow Contract           │
│  Value: 5 ETH                      │
│  Gas Limit: 300,000                │
│  Status: Pending... ⏳              │
└────────────────────────────────────┘
```

**Step 2.4: Validator Picks Up Transaction**
```
Validator (Miner/Validator Node):
1. Selects transaction from mempool
2. Executes smart contract code:
   ├─ Run initiateDeal(42)
   ├─ Check: msg.value >= minValue? ✓
   ├─ Deduct 5 ETH from Alice
   ├─ Credit 5 ETH to Escrow contract
   ├─ Create Deal struct in storage
   └─ Emit DealInitiated event
3. Includes transaction in new block
4. Block gets added to blockchain
```

**Step 2.5: Smart Contract Execution**
```solidity
// LandEscrow.sol - What actually runs on blockchain
function initiateDeal(uint256 landId) external payable {
    // msg.sender = 0xAlice123... (Alice's address)
    // msg.value = 5000000000000000000 Wei (5 ETH)
    // landId = 42
    
    // Step 1: Get minimum value from Registry contract
    uint256 minValue = registry.getLandGovernmentValue(landId);
    // CROSS-CONTRACT CALL to LandRegistry
    // Returns: 4 ETH (government valuation)
    
    // Step 2: Validate payment
    require(msg.value >= minValue, "Below government valuation");
    // Check: 5 ETH >= 4 ETH ✓ (passes)
    
    // Step 3: Store deal in blockchain storage
    dealCount++; // dealCount = 1
    deals[1] = Deal({
        buyer: msg.sender,     // 0xAlice123...
        landId: landId,        // 42
        amount: msg.value,     // 5000000000000000000
        completed: false       // Not approved yet
    });
    
    // Step 4: Emit event for logging
    emit DealInitiated(1, 42, msg.sender);
    // Event appears in transaction logs
}
```

**Gas Consumption Breakdown:**
```
Operation                    Gas Cost
─────────────────────────────────────
External call (registry)     ~3,000
Storage write (dealCount++)  ~5,000
Storage write (deals[1])     ~20,000
Event emission               ~375
Execution overhead           ~21,000
─────────────────────────────────────
Total Gas Used:              ~49,375 units

Gas Price (network):         20 Gwei
Total Fee:                   49,375 × 20 / 1B = 0.0009875 ETH
```

**Step 2.6: Transaction Confirmed**
```javascript
// Frontend: Wait for confirmation
const receipt = await tx.wait(1); // Wait for 1 block confirmation

console.log("Block Number:", receipt.blockNumber);
// Output: 12345678

console.log("Gas Used:", receipt.gasUsed.toString());
// Output: "49375"

console.log("Status:", receipt.status);
// Output: 1 (success)
```

**Blockchain State Change:**
```
Before Transaction:
├─ Alice's Balance: 10.5 ETH
├─ Escrow Balance: 0 ETH
├─ dealCount: 0
└─ deals[1]: (doesn't exist)

After Transaction:
├─ Alice's Balance: 5.4990125 ETH (paid 5 ETH + gas)
├─ Escrow Balance: 5 ETH (holding for deal)
├─ dealCount: 1
└─ deals[1]: {buyer: Alice, landId: 42, amount: 5 ETH, completed: false}
```

---

### **PHASE 3: Admin Approval (On-Chain)**

```
┌─────────────────────────────────────────────────────────┐
│  Admin → Backend → Blockchain → Smart Contract         │
└─────────────────────────────────────────────────────────┘
```

**Step 3.1: Admin Views Pending Deal**
```javascript
// Frontend: GovDashboard.jsx
const loadPendingDeals = async () => {
  // Backend queries blockchain
  const response = await axios.get(`${API_URL}/blockchain/pending-deals`);
  
  // Displays:
  // Deal #1: Land 42, Buyer: 0xAlice123..., Amount: 5 ETH
};
```

**Step 3.2: Backend Queries Blockchain**
```javascript
// Backend: blockchain.js
async function getPendingDeals(req, res) {
  const dealCount = await escrowContract.dealCount();
  // READ operation (no gas, no signature needed)
  
  const deals = [];
  for (let i = 1; i <= dealCount; i++) {
    const deal = await escrowContract.deals(i);
    // READ operation (querying blockchain state)
    
    if (!deal.completed) {
      deals.push({
        id: i,
        buyer: deal.buyer,
        landId: deal.landId.toString(),
        amount: ethers.formatEther(deal.amount)
      });
    }
  }
  
  res.json({ deals });
}
```

**Step 3.3: Admin Clicks "Approve"**
```javascript
// Frontend: GovDashboard.jsx
const handleApproveDeal = async (dealId) => {
  // Send to backend (admin doesn't sign with MetaMask)
  await axios.post(`${API_URL}/blockchain/approve-deal`, { dealId });
};
```

**Step 3.4: Backend Signs & Sends Transaction**
```javascript
// Backend: blockchain.js
async function approveDeal(req, res) {
  const { dealId } = req.body;
  
  // Backend wallet (admin) signs transaction
  const tx = await escrowContract.approveDeal(dealId);
  // escrowContract has backend wallet as signer
  // (set up in contract.js)
  
  const receipt = await tx.wait();
  
  res.json({
    success: true,
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber
  });
}
```

**Step 3.5: Smart Contract Execution**
```solidity
// LandEscrow.sol
function approveDeal(uint256 dealId) external onlyAdmin {
    // msg.sender = Backend wallet address (checked by onlyAdmin)
    
    // Step 1: Load deal from storage
    Deal storage d = deals[dealId];
    require(!d.completed, "Already completed");
    
    // Step 2: Get seller address from Registry
    address seller = registry.getLandOwner(d.landId);
    // CROSS-CONTRACT CALL
    // Returns: 0xBob456... (Bob's address)
    
    // Step 3: Transfer ETH to seller
    payable(seller).transfer(d.amount);
    // Sends 5 ETH from Escrow contract to Bob
    
    // Step 4: Transfer land ownership
    registry.transferOwnership(
        d.landId,    // 42
        d.buyer,     // 0xAlice123...
        "Sale Deed"
    );
    // CROSS-CONTRACT CALL to update Registry storage
    
    // Step 5: Mark deal as completed
    d.completed = true;
    
    // Step 6: Emit event
    emit DealCompleted(dealId);
}
```

**Cross-Contract Execution Flow:**
```
1. Escrow.approveDeal() called
   └─> Calls registry.getLandOwner(42)
       └─> Registry returns: 0xBob456...
   
2. Escrow transfers 5 ETH to 0xBob456...
   └─> ETH moved from Escrow to Bob
   
3. Escrow calls registry.transferOwnership(42, 0xAlice123...)
   └─> Registry.transferOwnership() executes
       ├─> Checks: msg.sender == escrow address? ✓
       ├─> Updates: lands[42].owner = 0xAlice123...
       └─> Emits: OwnershipTransferred event
   
4. Escrow marks deal completed
   └─> deals[1].completed = true
```

**Final Blockchain State:**
```
After Approval:
├─ Alice's Balance: 5.4990125 ETH (unchanged)
├─ Bob's Balance: 10.0 ETH → 15.0 ETH (+5 ETH)
├─ Escrow Balance: 5 ETH → 0 ETH (transferred out)
├─ Land 42 Owner: 0xBob456... → 0xAlice123...
└─ deals[1].completed: false → true
```

---

## 🔐 Security Deep Dive

### 1. **Signature Verification**

**How Blockchain Verifies Alice Signed:**
```
Transaction Components:
├─ Nonce: 42 (Alice's transaction count)
├─ To: Escrow Contract Address
├─ Value: 5 ETH
├─ Gas Limit: 300,000
├─ Data: initiateDeal(42) encoded
└─ Signature: (r, s, v) ← Created with Alice's private key

Blockchain Verification:
1. Hash transaction data
2. Use signature (r, s, v) to recover public key
3. Derive address from public key
4. Check: Derived address == Alice's address? ✓
5. If match, transaction is valid
```

**Why This Matters:**
- Alice never shares private key
- Only Alice can create valid signature
- Blockchain mathematically proves Alice authorized transaction

### 2. **Reentrancy Protection**

**What's Reentrancy?**
```solidity
// VULNERABLE CODE (example of what NOT to do)
function withdraw() external {
    uint amount = balances[msg.sender];
    
    // DANGER: External call before state update
    payable(msg.sender).transfer(amount);
    
    // Attacker could call withdraw() again here!
    balances[msg.sender] = 0;
}
```

**Your Code (Safe):**
```solidity
function approveDeal(uint256 dealId) external onlyAdmin {
    Deal storage d = deals[dealId];
    
    // 1. Check first
    require(!d.completed, "Already completed");
    
    // 2. Effect (update state)
    d.completed = true; // ✓ State updated BEFORE external calls
    
    // 3. Interaction (external calls)
    payable(seller).transfer(d.amount);
    registry.transferOwnership(d.landId, d.buyer, "Sale Deed");
}
```

**Pattern: Checks-Effects-Interactions**
1. **Checks**: Validate conditions
2. **Effects**: Update state variables
3. **Interactions**: Call external contracts

### 3. **Admin Control**

**How onlyAdmin Modifier Works:**
```solidity
// AdminControl.sol
contract AdminControl {
    address public admin;
    
    constructor() {
        admin = msg.sender; // Deployer becomes admin
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _; // Continue to function body
    }
}

// Usage
function registerLand(...) external onlyAdmin {
    // If msg.sender != admin, reverts before this line
    lands[landCount] = Land({...});
}
```

**Attack Prevention:**
```
Scenario: Hacker tries to register land

1. Hacker calls registerLand() from address 0xHacker...
2. onlyAdmin modifier checks: 0xHacker... == admin?
3. Check fails: 0xHacker... != 0xBackendWallet...
4. Transaction reverts immediately
5. No gas wasted on function execution
6. Hacker pays gas for failed attempt
```

---

## 💰 Gas Optimization

### Why Gas Matters

**Real Cost Example (Current ETH prices):**
```
Gas Used: 200,000 units
Gas Price: 50 Gwei (moderate congestion)
ETH Price: $3,000

Cost Calculation:
200,000 × 50 / 1,000,000,000 = 0.01 ETH
0.01 ETH × $3,000 = $30 per transaction
```

### Gas Costs by Operation

```
Operation                          Gas Cost      Example
───────────────────────────────────────────────────────────
Storage write (new)                20,000        deals[1] = Deal({...})
Storage write (update)             5,000         d.completed = true
Storage read                       200           uint x = d.amount
External call                      2,600         registry.getLandOwner()
Event emission                     375           emit DealInitiated()
Function call (internal)           24            _transfer()
Math operation                     3             a + b
Comparison                         3             x > y
Memory allocation                  3/word        memory temp = new uint[](10)
```

### Optimization Techniques Used

**1. Storage vs Memory**
```solidity
// EXPENSIVE (multiple storage reads)
function bad(uint256 dealId) external {
    require(deals[dealId].completed == false);      // Read storage
    require(deals[dealId].amount > 0);              // Read storage again
    uint amount = deals[dealId].amount;             // Read storage again
    // 3 storage reads = 600 gas
}

// CHEAP (one storage read)
function good(uint256 dealId) external {
    Deal storage d = deals[dealId];  // Create reference (200 gas)
    require(!d.completed);           // Read from reference
    require(d.amount > 0);           // Read from reference
    uint amount = d.amount;          // Read from reference
    // 1 storage read = 200 gas (saves 400 gas!)
}
```

**2. Batch Operations**
```solidity
// Your code already does this efficiently
function registerLand(
    address ownerAddress,
    string calldata khatian,  // calldata cheaper than memory
    string calldata state,
    string calldata city,
    string calldata ward,
    uint256 areaInUnits,
    uint256 governmentValuation
) external onlyAdmin {
    landCount++;
    
    // Single storage write with all fields
    lands[landCount] = Land({
        owner: ownerAddress,
        khatian: khatian,
        state: state,
        city: city,
        ward: ward,
        areaInUnits: areaInUnits,
        governmentValuation: governmentValuation,
        verified: true
    });
    // More efficient than 8 separate writes
}
```

---

## 🌐 Network Communication

### Provider vs Signer

```javascript
// READ-ONLY: Provider (no gas, no signature)
const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/...");
const balance = await provider.getBalance("0xAlice...");
const dealCount = await escrowContract.dealCount();
// Free operations, just querying blockchain state

// WRITE: Signer (costs gas, requires signature)
const signer = new ethers.Wallet(privateKey, provider);
const tx = await escrowContract.approveDeal(1);
// Costs gas, creates new block, changes state
```

### RPC Endpoint

**What's Happening Behind the Scenes:**
```
Your Backend:
├─ Contract call: escrowContract.approveDeal(1)
│
▼
Ethers.js Library:
├─ Encodes function call: 0x1234abcd...
├─ Signs with private key
├─ Creates transaction object
│
▼
RPC Provider (Infura/Alchemy):
├─ Receives signed transaction
├─ Broadcasts to Ethereum network
├─ Returns transaction hash
│
▼
Ethereum Network:
├─ Validators receive transaction
├─ Execute smart contract code
├─ Add to new block
├─ Update world state
│
▼
Your Backend:
└─ Receives confirmation receipt
```

### Transaction Lifecycle

```
1. CREATED
   ├─ Transaction constructed in code
   └─ Signed with private key

2. BROADCAST
   ├─ Sent to network via RPC
   └─ Enters mempool

3. PENDING
   ├─ Waiting for validator
   └─ Can be viewed on Etherscan

4. INCLUDED
   ├─ Picked by validator
   ├─ Executed in EVM
   └─ Added to block

5. CONFIRMED
   ├─ Block added to chain
   ├─ 1st confirmation (latest block)
   ├─ 3rd confirmation (3 blocks deep)
   └─ 12+ confirmations (considered final)

6. FINALIZED
   └─ Irreversible (after many confirmations)
```

---

## 🧪 Testing Gas in Your Project

### Estimate Gas Before Sending

```javascript
// Backend: blockchain.js - Gas estimation
try {
    const gasEstimate = await landRegistryContract.registerLand.estimateGas(
        ownerAddress,
        khatian,
        state,
        city,
        ward,
        areaInUnits,
        valuationInWei
    );
    console.log("Estimated gas:", gasEstimate.toString());
    // Output: "234567"
    
    // Add 20% buffer
    const gasLimit = Math.floor(gasEstimate * 1.2);
    
    const tx = await landRegistryContract.registerLand(
        ...,
        { gasLimit } // Use estimated value
    );
} catch (gasError) {
    // Transaction would fail - don't send!
    console.error("Gas estimation failed:", gasError.message);
}
```

### Monitor Gas Usage

```javascript
// After transaction
const receipt = await tx.wait();

console.log("Gas Used:", receipt.gasUsed.toString());
console.log("Gas Price:", receipt.gasPrice.toString());
console.log("Total Cost:", 
    ethers.formatEther(
        receipt.gasUsed * receipt.gasPrice
    ), "ETH"
);
```

---

## 🎓 Key Takeaways

### Signer
- **Definition**: Wallet that can sign and send transactions
- **Types**: User (MetaMask), Backend (Server wallet)
- **Purpose**: Authorizes state changes on blockchain
- **Cost**: Pays gas fees

### Gas
- **Definition**: Computational units for executing code
- **Price**: Fluctuates with network demand (Gwei)
- **Limit**: Max gas willing to spend
- **Actual**: Only charged for gas used
- **Purpose**: Prevents infinite loops, rewards validators

### Contract Communication
- **Method**: Address references + function calls
- **Types**: Inheritance, External calls
- **State**: Can read/write other contracts
- **Verification**: Blockchain validates all calls
- **Atomicity**: All calls succeed or all revert

### Transaction Flow
1. **User Action** → Triggers frontend
2. **Sign** → MetaMask or backend wallet
3. **Broadcast** → Send to network
4. **Execute** → Run smart contract code
5. **Confirm** → Add to blockchain
6. **Update** → State permanently changed

---

## 📊 Practical Example: Full Transaction Trace

```
User: Alice buys land #42 for 5 ETH

Time    Action                                Gas        State Change
──────────────────────────────────────────────────────────────────────
T+0s    Alice clicks "Buy Now"                -          -
T+1s    MetaMask loads transaction            -          -
T+2s    Alice clicks "Confirm"                -          -
T+3s    Transaction broadcast                 -          Mempool: +1
T+15s   Validator picks transaction           49,375     Alice: -5.0009875 ETH
                                                         Escrow: +5 ETH
                                                         deals[1]: created
T+16s   Block mined (1 confirmation)          -          Block 12345678
T+28s   2nd confirmation                      -          Block 12345679
T+40s   3rd confirmation                      -          Block 12345680

--- Alice's transaction complete ---

T+120s  Admin views pending deal              -          -
T+121s  Admin clicks "Approve"                -          -
T+122s  Backend signs approval                -          -
T+125s  Approval transaction broadcast        -          Mempool: +1
T+140s  Validator executes approval           85,234     Bob: +5 ETH
                                                         Escrow: -5 ETH
                                                         Land 42: Alice
                                                         deals[1].completed: true
T+141s  Block mined (1 confirmation)          -          Block 12345695

--- Deal complete ---

Final State:
├─ Alice: Owns land #42, paid 5.0009875 ETH
├─ Bob: Received 5 ETH, lost land #42
├─ Backend: Paid 0.001704 ETH gas fee
└─ Validators: Earned 0.0026915 ETH total fees
```

This is the complete technical flow of how your land marketplace actually works!
