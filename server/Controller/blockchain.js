const { ethers } = require('ethers');
const { landRegistryContract, escrowContract, wallet } = require('../Config/contract');

async function registerLand(req, res) {
    try {
        const { ownerAddress, khatian, state, city, ward, area, valuation } = req.body;

        if (!wallet) {
            return res.status(500).json({ message: "Backend wallet not configured" });
        }

        if (!ownerAddress || !khatian || !state || !city || !ward || !area || !valuation) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if caller is admin (from auth middleware)
        const adminAddress = await landRegistryContract.admin();
        console.log("Admin Address:", adminAddress);
        console.log("Wallet Address:", wallet.address);

        // Check wallet balance
        const balance = await wallet.provider.getBalance(wallet.address);
        console.log("Wallet Balance:", ethers.formatEther(balance), "ETH");

        if (balance === 0n) {
            return res.status(500).json({
                success: false,
                message: "Backend wallet has no ETH. Please fund it with Sepolia testnet ETH."
            });
        }

        if (wallet.address.toLowerCase() !== adminAddress.toLowerCase()) {
            return res.status(403).json({ message: "Only admin can register lands" });
        }

        const valuationInWei = ethers.parseEther(valuation.toString());
        const areaInUnits = parseInt(area);

        console.log("Registering land with:", {
            ownerAddress,
            khatian,
            state,
            city,
            ward,
            areaInUnits,
            valuationInWei: valuationInWei.toString()
        });

        // Estimate gas first
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
        } catch (gasError) {
            console.error("Gas estimation failed:", gasError.message);
            return res.status(500).json({
                success: false,
                message: "Transaction would fail. Check contract requirements.",
                error: gasError.message
            });
        }

        const tx = await landRegistryContract.registerLand(
            ownerAddress,
            khatian,
            state,
            city,
            ward,
            areaInUnits,
            valuationInWei,
            {
                gasLimit: 500000 // Set explicit gas limit
            }
        );

        console.log("Transaction sent:", tx.hash);
        console.log("Check status at: https://sepolia.etherscan.io/tx/" + tx.hash);

        // Verify network
        const network = await wallet.provider.getNetwork();
        console.log("Network:", network.name, "Chain ID:", network.chainId);

        // Wait for transaction confirmation with timeout
        console.log("Waiting for transaction confirmation...");

        let receipt;
        try {
            // Use Promise.race to add timeout
            receipt = await Promise.race([
                tx.wait(1),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Transaction confirmation timeout')), 120000) // 2 minute timeout
                )
            ]);

            console.log("✅ Transaction confirmed!");
            console.log("Block number:", receipt.blockNumber);
            console.log("Gas used:", receipt.gasUsed.toString());
            console.log("Status:", receipt.status === 1 ? "Success" : "Failed");
        } catch (waitError) {
            // If timeout or error, try to get transaction status manually
            console.log("⚠️ Wait timeout or error:", waitError.message);
            console.log("Checking transaction status manually...");

            const txStatus = await wallet.provider.getTransaction(tx.hash);
            if (!txStatus) {
                return res.status(500).json({
                    success: false,
                    message: "Transaction not found. It may have been dropped from mempool.",
                    txHash: tx.hash,
                    etherscanUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`
                });
            }

            if (txStatus.blockNumber) {
                console.log("Transaction is mined in block:", txStatus.blockNumber);
                receipt = await wallet.provider.getTransactionReceipt(tx.hash);
            } else {
                return res.status(202).json({
                    success: 'pending',
                    message: "Transaction is pending confirmation. Check Etherscan for status.",
                    txHash: tx.hash,
                    etherscanUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`
                });
            }
        }

        if (receipt && receipt.status === 0) {
            return res.status(500).json({
                success: false,
                message: "Transaction failed on blockchain",
                transactionHash: receipt.hash
            });
        }

        return res.status(200).json({
            success: true,
            message: `Land registered successfully! Khatian: ${khatian}`,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber
        });

    } catch (err) {
        console.error("Error registering land:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to register land",
            error: err.message
        });
    }
}

async function setValuation(req, res) {
    try {
        const { landId, value } = req.body;

        if (!wallet) {
            return res.status(500).json({ message: "Backend wallet not configured" });
        }

        if (!landId || !value) {
            return res.status(400).json({ message: "Land ID and value are required" });
        }

        // Check if caller is admin
        const adminAddress = await landRegistryContract.admin();
        if (wallet.address.toLowerCase() !== adminAddress.toLowerCase()) {
            return res.status(403).json({ message: "Only admin can set valuations" });
        }

        const valueInWei = ethers.parseEther(value.toString());
        const tx = await landRegistryContract.setValuation(parseInt(landId), valueInWei);

        const receipt = await tx.wait();

        return res.status(200).json({
            success: true,
            message: `Valuation updated for Land #${landId}!`,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber
        });

    } catch (err) {
        console.error("Error setting valuation:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to set valuation",
            error: err.message
        });
    }
}

async function approveDeal(req, res) {
    try {
        const { dealId } = req.body;

        if (!wallet) {
            return res.status(500).json({ message: "Backend wallet not configured" });
        }

        if (!dealId) {
            return res.status(400).json({ message: "Deal ID is required" });
        }

        // Check if caller is admin
        const adminAddress = await landRegistryContract.admin();
        if (wallet.address.toLowerCase() !== adminAddress.toLowerCase()) {
            return res.status(403).json({ message: "Only admin can approve deals" });
        }

        const tx = await escrowContract.approveDeal(dealId);
        const receipt = await tx.wait();

        return res.status(200).json({
            success: true,
            message: `Deal #${dealId} approved successfully!`,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber
        });

    } catch (err) {
        console.error("Error approving deal:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to approve deal",
            error: err.message
        });
    }
}

async function getPendingDeals(req, res) {
    try {
        const dealCount = await escrowContract.dealCount();
        const deals = [];

        for (let i = 1; i <= dealCount; i++) {
            const deal = await escrowContract.deals(i);

            if (!deal.completed) {
                deals.push({
                    id: i,
                    buyer: deal.buyer,
                    landId: deal.landId.toString(),
                    amount: ethers.formatEther(deal.amount),
                    completed: deal.completed
                });
            }
        }

        return res.status(200).json({
            success: true,
            deals
        });

    } catch (err) {
        console.error("Error getting pending deals:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to get pending deals",
            error: err.message
        });
    }
}

async function getLandDetails(req, res) {
    try {
        const { landId } = req.params;

        const land = await landRegistryContract.lands(landId);

        return res.status(200).json({
            success: true,
            land: {
                owner: land.owner,
                khatian: land.khatian,
                state: land.state,
                city: land.city,
                ward: land.ward,
                area: land.area.toString(),
                valuation: ethers.formatEther(land.valuation),
                isRegistered: land.isRegistered
            }
        });

    } catch (err) {
        console.error("Error getting land details:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to get land details",
            error: err.message
        });
    }
}

async function checkAdmin(req, res) {
    try {
        if (!wallet) {
            return res.status(500).json({ message: "Backend wallet not configured" });
        }

        const adminAddress = await landRegistryContract.admin();
        const isAdmin = wallet.address.toLowerCase() === adminAddress.toLowerCase();

        return res.status(200).json({
            success: true,
            isAdmin,
            walletAddress: wallet.address,
            adminAddress
        });

    } catch (err) {
        console.error("Error checking admin:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to check admin status",
            error: err.message
        });
    }
}

async function getRecentLandActivity(req, res) {
    try {
        const provider = wallet.provider;

        const events = await landRegistryContract.queryFilter(
            landRegistryContract.filters.LandRegistered(),
            -5000
        );

        const activity = await Promise.all(
            events.reverse().slice(0, 5).map(async (e) => {
                const block = await provider.getBlock(e.blockNumber);

                return {
                    landId: e.args.landId.toString(),
                    owner: e.args.owner,
                    khatian: e.args.khatian,
                    timestamp: block.timestamp * 1000 // ms
                };
            })
        );

        res.json({ success: true, activity });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}


module.exports = {
    registerLand,
    setValuation,
    approveDeal,
    getPendingDeals,
    getLandDetails,
    checkAdmin,
    getRecentLandActivity,
};