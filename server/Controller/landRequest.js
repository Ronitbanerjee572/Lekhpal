const { ethers } = require('ethers');
const LandRequest = require('../Model/LandRequest');
const User = require('../Model/User');
const { landRegistryContract, wallet } = require('../Config/contract');

// User submits land registration request
async function submitLandRequest(req, res) {
    try {
        const { khatian, state, city, ward, area } = req.body;
        const userId = req.user.id;

        if (!khatian || !state || !city || !ward || !area) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Get user details including wallet address
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.walletAddress) {
            return res.status(400).json({ message: "User wallet not initialized" });
        }

        // Create pending land request without valuation (will be set by admin)
        const landRequest = await LandRequest.create({
            userId,
            userWalletAddress: user.walletAddress,
            khatian,
            state,
            city,
            ward,
            areaInUnits: parseInt(area),
            valuationInWei: null,
            status: 'pending'
        });

        return res.status(201).json({
            success: true,
            message: "Land registration request submitted successfully",
            requestId: landRequest._id,
            status: 'pending'
        });

    } catch (error) {
        console.error("Error submitting land request:", error);
        return res.status(500).json({ 
            success: false,
            message: "Error submitting land request",
            error: error.message 
        });
    }
}

// Get user's land requests
async function getUserLandRequests(req, res) {
    try {
        const userId = req.user.id;

        const requests = await LandRequest.find({ userId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            requests
        });

    } catch (error) {
        console.error("Error fetching user requests:", error);
        return res.status(500).json({ 
            success: false,
            message: "Error fetching requests",
            error: error.message 
        });
    }
}

// Get all pending land requests (Admin only)
async function getPendingLandRequests(req, res) {
    try {
        const adminAddress = await landRegistryContract.admin();
        
        if (wallet.address.toLowerCase() !== adminAddress.toLowerCase()) {
            return res.status(403).json({ message: "Only admin can view pending requests" });
        }

        const requests = await LandRequest.find({ status: 'pending' })
            .populate('userId', 'name email contactNo')
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error("Error fetching pending requests:", error);
        return res.status(500).json({ 
            success: false,
            message: "Error fetching pending requests",
            error: error.message 
        });
    }
}

// Approve land request and register on blockchain
async function approveLandRequest(req, res) {
    try {
        const { requestId, valuation } = req.body;

        if (!requestId || !valuation) {
            return res.status(400).json({ message: "Request ID and valuation are required" });
        }

        const landRequest = await LandRequest.findById(requestId);
        if (!landRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (landRequest.status !== 'pending') {
            return res.status(400).json({ message: "Request is not pending" });
        }

        // Verify admin
        const adminAddress = await landRegistryContract.admin();
        if (wallet.address.toLowerCase() !== adminAddress.toLowerCase()) {
            return res.status(403).json({ message: "Only admin can approve requests" });
        }

        // Parse valuation
        const valuationInWei = ethers.parseEther(valuation.toString());

        console.log("Approving land request with valuation:", {
            ownerAddress: landRequest.userWalletAddress,
            khatian: landRequest.khatian,
            state: landRequest.state,
            city: landRequest.city,
            ward: landRequest.ward,
            areaInUnits: landRequest.areaInUnits,
            valuationInWei: valuationInWei.toString()
        });

        // Check wallet balance
        const balance = await wallet.provider.getBalance(wallet.address);
        console.log("Wallet Balance:", ethers.formatEther(balance), "ETH");

        if (balance === 0n) {
            return res.status(500).json({ 
                success: false,
                message: "Backend wallet has no ETH. Cannot process request." 
            });
        }

        // Estimate gas
        try {
            const gasEstimate = await landRegistryContract.registerLand.estimateGas(
                landRequest.userWalletAddress,
                landRequest.khatian,
                landRequest.state,
                landRequest.city,
                landRequest.ward,
                landRequest.areaInUnits,
                valuationInWei.toString()
            );
            console.log("Estimated gas:", gasEstimate.toString());
        } catch (gasError) {
            console.error("Gas estimation failed:", gasError.message);
            return res.status(500).json({
                success: false,
                message: "Transaction would fail. Check land details.",
                error: gasError.message
            });
        }

        // Register land on blockchain
        const tx = await landRegistryContract.registerLand(
            landRequest.userWalletAddress,
            landRequest.khatian,
            landRequest.state,
            landRequest.city,
            landRequest.ward,
            landRequest.areaInUnits,
            valuationInWei.toString(),
            { gasLimit: 500000 }
        );

        console.log("Transaction sent:", tx.hash);

        // Wait for confirmation with timeout
        let receipt;
        try {
            receipt = await Promise.race([
                tx.wait(1),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Transaction confirmation timeout')), 120000)
                )
            ]);

            console.log("✅ Transaction confirmed!");
            
            // Update land request status
            await LandRequest.findByIdAndUpdate(
                requestId,
                { 
                    status: 'approved',
                    txHash: tx.hash,
                    landId: receipt.events?.[0]?.args?.landId?.toString() || null
                }
            );

            return res.status(200).json({
                success: true,
                message: "Land request approved and registered on blockchain",
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            });

        } catch (waitError) {
            console.log("Wait timeout or error:", waitError.message);
            
            // Try to get transaction status
            const txStatus = await wallet.provider.getTransaction(tx.hash);
            if (!txStatus) {
                await LandRequest.findByIdAndUpdate(
                    requestId,
                    { status: 'rejected', rejectionReason: 'Transaction dropped from mempool' }
                );
                return res.status(500).json({
                    success: false,
                    message: "Transaction failed - dropped from mempool",
                    txHash: tx.hash
                });
            }

            if (txStatus.blockNumber) {
                receipt = await wallet.provider.getTransactionReceipt(tx.hash);
                
                await LandRequest.findByIdAndUpdate(
                    requestId,
                    { 
                        status: 'approved',
                        txHash: tx.hash
                    }
                );

                return res.status(200).json({
                    success: true,
                    message: "Land request approved and registered",
                    txHash: tx.hash
                });
            }

            // Still pending
            return res.status(202).json({
                success: 'pending',
                message: "Transaction is pending confirmation",
                txHash: tx.hash
            });
        }

    } catch (error) {
        console.error("Error approving request:", error);
        return res.status(500).json({ 
            success: false,
            message: "Error approving request",
            error: error.message 
        });
    }
}

// Reject land request
async function rejectLandRequest(req, res) {
    try {
        const { requestId, reason } = req.body;

        if (!requestId || !reason) {
            return res.status(400).json({ message: "Request ID and reason are required" });
        }

        const landRequest = await LandRequest.findById(requestId);
        if (!landRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (landRequest.status !== 'pending') {
            return res.status(400).json({ message: "Request is not pending" });
        }

        // Verify admin
        const adminAddress = await landRegistryContract.admin();
        if (wallet.address.toLowerCase() !== adminAddress.toLowerCase()) {
            return res.status(403).json({ message: "Only admin can reject requests" });
        }

        // Update request status
        await LandRequest.findByIdAndUpdate(
            requestId,
            { 
                status: 'rejected',
                rejectionReason: reason
            }
        );

        return res.status(200).json({
            success: true,
            message: "Land request rejected",
            requestId
        });

    } catch (error) {
        console.error("Error rejecting request:", error);
        return res.status(500).json({ 
            success: false,
            message: "Error rejecting request",
            error: error.message 
        });
    }
}

module.exports = {
    submitLandRequest,
    getUserLandRequests,
    getPendingLandRequests,
    approveLandRequest,
    rejectLandRequest
};
