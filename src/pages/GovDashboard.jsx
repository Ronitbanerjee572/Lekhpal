import React, { useState, useEffect } from 'react';
import { FileCheck, DollarSign, PenTool, Activity, Wallet, AlertCircle, CheckCircle, LogOut } from 'lucide-react';
import { ethers } from 'ethers';
import { LAND_REGISTRY_ADDRESS, LAND_REGISTRY_ABI, ESCROW_ADDRESS, ESCROW_ABI, RPC_URL } from '../config/contractConfig';

export default function GovDashboard() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [escrowContract, setEscrowContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Register Land Form
  const [registerForm, setRegisterForm] = useState({
    ownerAddress: '',
    khatian: '',
    state: '',
    city: '',
    ward: '',
    area: '',
    valuation: ''
  });
  
  // Set Valuation Form
  const [valuationForm, setValuationForm] = useState({
    landId: '',
    value: ''
  });
  
  // Approve Deal Form
  const [dealForm, setDealForm] = useState({
    dealId: ''
  });
  
  // Pending Deals
  const [pendingDeals, setPendingDeals] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Initialize contract with signer when wallet connected
  useEffect(() => {
    if (account) {
      initContractWithSigner();
      checkIfAdmin();
    }
  }, [account]);

  // Initialize provider for reading contract data
  useEffect(() => {
    initProviderContract();
  }, []);

  const initProviderContract = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contractInstance = new ethers.Contract(
        LAND_REGISTRY_ADDRESS,
        LAND_REGISTRY_ABI,
        provider
      );
      const escrowInstance = new ethers.Contract(
        ESCROW_ADDRESS,
        ESCROW_ABI,
        provider
      );
      setContract(contractInstance);
      setEscrowContract(escrowInstance);
    } catch (err) {
      console.error("Failed to initialize provider contract:", err);
    }
  };

  const initContractWithSigner = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contractWithSigner = new ethers.Contract(
        LAND_REGISTRY_ADDRESS,
        LAND_REGISTRY_ABI,
        signer
      );
      
      const escrowWithSigner = new ethers.Contract(
        ESCROW_ADDRESS,
        ESCROW_ABI,
        signer
      );
      
      setContract(contractWithSigner);
      setEscrowContract(escrowWithSigner);
    } catch (err) {
      console.error("Failed to initialize signer contract:", err);
    }
  };

  const checkIfAdmin = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contractWithProvider = new ethers.Contract(
        LAND_REGISTRY_ADDRESS,
        LAND_REGISTRY_ABI,
        provider
      );
      
      const adminAddress = await contractWithProvider.admin();
      setIsAdmin(adminAddress.toLowerCase() === account.toLowerCase());
    } catch (err) {
      console.error("Failed to check admin status:", err);
      setIsAdmin(false);
    }
  };

  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      setError("MetaMask not detected! Please install MetaMask.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setSuccess(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error("MetaMask connection failed", err);
      setError("Failed to connect MetaMask.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDisconnect = () => {
    setAccount(null);
    setIsAdmin(false);
    setError(null);
    setSuccess(null);
  };

  const handleRegisterLand = async (e) => {
    e.preventDefault();
    
    if (!account) {
      setError("Please connect wallet first");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!isAdmin) {
      setError("Only admins can register lands");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!registerForm.ownerAddress || !registerForm.khatian || !registerForm.state || !registerForm.city || !registerForm.ward || !registerForm.area || !registerForm.valuation) {
      setError("Please fill all fields");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      
      const valuationInWei = ethers.parseEther(registerForm.valuation);
      const areaInUnits = parseInt(registerForm.area);
      
      const tx = await contract.registerLand(
        registerForm.ownerAddress,
        registerForm.khatian,
        registerForm.state,
        registerForm.city,
        registerForm.ward,
        areaInUnits,
        valuationInWei
      );
      
      await tx.wait();
      
      setSuccess(`Land registered successfully! Khatian: ${registerForm.khatian}`);
      setRegisterForm({
        ownerAddress: '',
        khatian: '',
        state: '',
        city: '',
        ward: '',
        area: '',
        valuation: ''
      });
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error("Error registering land:", err);
      setError(`Failed to register land: ${err.message}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSetValuation = async (e) => {
    e.preventDefault();
    
    if (!account) {
      setError("Please connect wallet first");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!isAdmin) {
      setError("Only admins can set valuations");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!valuationForm.landId || !valuationForm.value) {
      setError("Please fill all fields");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      
      const valueInWei = ethers.parseEther(valuationForm.value);
      const tx = await contract.setValuation(parseInt(valuationForm.landId), valueInWei);
      
      await tx.wait();
      
      setSuccess(`Valuation updated for Land #${valuationForm.landId}!`);
      setValuationForm({ landId: '', value: '' });
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error("Error setting valuation:", err);
      setError(`Failed to set valuation: ${err.message}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDeal = async (dealId) => {
    if (!account) {
      setError("Please connect wallet first");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!isAdmin) {
      setError("Only admins can approve deals");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      
      const tx = await escrowContract.approveDeal(dealId);
      await tx.wait();
      
      setSuccess(`Deal #${dealId} approved successfully!`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh pending deals
      await loadPendingDeals();
      
    } catch (err) {
      console.error("Error approving deal:", err);
      setError(`Failed to approve deal: ${err.message}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingDeals = async () => {
    try {
      if (!escrowContract) return;
      
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
      
      setPendingDeals(deals);
    } catch (err) {
      console.error("Error loading deals:", err);
    }
  };

  // Load pending deals when contract is ready
  useEffect(() => {
    if (escrowContract) {
      loadPendingDeals();
    }
  }, [escrowContract]);

  return (
    <div className="min-h-screen bg-brand-bg p-8">
      <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-brand-text">△ <span className="text-brand-accent">Lekhpal Admin</span></h1>
            <p className="text-gray-600">Manage land registrations, valuations, and deal approvals.</p>
          </div>
          
          {account ? (
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-xs text-gray-600 mb-1">Connected Account</p>
                <p className="font-bold text-brand-accent">{account.slice(0, 6)}...{account.slice(-4)}</p>
                {isAdmin && <p className="text-xs text-green-600 font-medium">✓ Admin</p>}
              </div>
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <LogOut size={16} /> Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="flex items-center gap-2 bg-brand-text text-white px-6 py-3 rounded-lg hover:bg-brand-accent transition font-bold"
            >
              <Wallet size={20} /> Connect Wallet
            </button>
          )}
      </header>

      {/* Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {!isAdmin && account && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>Your wallet is not an admin. Please contact the system administrator.</span>
        </div>
      )}

      {!account ? (
        <div className="bg-white p-12 rounded-xl shadow-md text-center">
          <Wallet size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-brand-text mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your MetaMask wallet to access admin functions.</p>
          <button
            onClick={handleConnectWallet}
            className="inline-flex items-center gap-2 bg-brand-text text-white px-8 py-3 rounded-lg hover:bg-brand-accent transition font-bold"
          >
            <Wallet size={20} /> Connect MetaMask
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-8">
        {/* Top row: 1 - Set Valuation, 2 - Register Land, 3 - Approve Escrow (top) */}
          {/* Set Valuation */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 md:row-start-1 md:col-start-1">
              <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                      <DollarSign size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-brand-text">Set Valuation</h2>
              </div>
              <form onSubmit={handleSetValuation} className="space-y-4">
                  <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Land ID</label>
                      <input 
                        type="number"
                        placeholder="Enter Land ID" 
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        value={valuationForm.landId}
                        onChange={(e) => setValuationForm({...valuationForm, landId: e.target.value})}
                        disabled={loading || !isAdmin}
                      />
                  </div>
                  <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">New Valuation (ETH)</label>
                      <input 
                        type="text"
                        placeholder="e.g., 5.5" 
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        value={valuationForm.value}
                        onChange={(e) => setValuationForm({...valuationForm, value: e.target.value})}
                        disabled={loading || !isAdmin}
                      />
                  </div>
                  <button 
                    type="submit"
                    disabled={loading || !account || !isAdmin}
                    className="w-full bg-brand-text text-white py-3 rounded-lg font-bold hover:bg-brand-accent transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {loading ? 'Updating...' : 'Update Valuation'}
                  </button>
              </form>
          </div>

          {/* Register Land */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-100 rounded-lg text-green-600">
                      <PenTool size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-brand-text">Register New Land</h2>
              </div>
              <form onSubmit={handleRegisterLand} className="space-y-4">
                  <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Owner Address</label>
                      <input 
                        type="text"
                        placeholder="0x..." 
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        value={registerForm.ownerAddress}
                        onChange={(e) => setRegisterForm({...registerForm, ownerAddress: e.target.value})}
                        disabled={loading || !isAdmin}
                      />
                  </div>
                  <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Khatian No.</label>
                      <input 
                        type="text"
                        placeholder="e.g., KH-001" 
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        value={registerForm.khatian}
                        onChange={(e) => setRegisterForm({...registerForm, khatian: e.target.value})}
                        disabled={loading || !isAdmin}
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">State</label>
                        <input 
                          type="text"
                          placeholder="State" 
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                          value={registerForm.state}
                          onChange={(e) => setRegisterForm({...registerForm, state: e.target.value})}
                          disabled={loading || !isAdmin}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">City</label>
                        <input 
                          type="text"
                          placeholder="City" 
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                          value={registerForm.city}
                          onChange={(e) => setRegisterForm({...registerForm, city: e.target.value})}
                          disabled={loading || !isAdmin}
                        />
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Ward</label>
                        <input 
                          type="text"
                          placeholder="Ward" 
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                          value={registerForm.ward}
                          onChange={(e) => setRegisterForm({...registerForm, ward: e.target.value})}
                          disabled={loading || !isAdmin}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Area (sq units)</label>
                        <input 
                          type="number"
                          placeholder="Area" 
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                          value={registerForm.area}
                          onChange={(e) => setRegisterForm({...registerForm, area: e.target.value})}
                          disabled={loading || !isAdmin}
                        />
                      </div>
                  </div>
                  <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Valuation (ETH)</label>
                      <input 
                        type="text"
                        placeholder="e.g., 5.5" 
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        value={registerForm.valuation}
                        onChange={(e) => setRegisterForm({...registerForm, valuation: e.target.value})}
                        disabled={loading || !isAdmin}
                      />
                  </div>
                  <button 
                    type="submit"
                    disabled={loading || !account || !isAdmin}
                    className="w-full bg-brand-text text-white py-3 rounded-lg font-bold hover:bg-brand-accent transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {loading ? 'Registering...' : 'Register Land'}
                  </button>
              </form>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 md:col-start-3 md:row-span-2">
              <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                      <FileCheck size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-brand-text">Pending Approvals ({pendingDeals.length})</h2>
              </div>
              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-96">
                  {pendingDeals.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No pending deals</p>
                  ) : (
                    pendingDeals.map(deal => (
                        <div key={deal.id} className="border border-gray-100 p-4 rounded-lg bg-gray-50">
                            <div className="flex justify-between mb-2">
                                <span className="font-bold text-sm">Deal #{deal.id}</span>
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Pending</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">Land ID: {deal.landId}</p>
                            <p className="text-xs text-gray-600 mb-3">Buyer: {deal.buyer.slice(0, 6)}...{deal.buyer.slice(-4)}</p>
                            <p className="text-xs text-gray-600 mb-3 font-bold">Amount: {deal.amount} ETH</p>
                            <button 
                              onClick={() => handleApproveDeal(deal.id)}
                              disabled={loading || !isAdmin}
                              className="w-full bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loading ? 'Processing...' : 'Approve Deal'}
                            </button>
                        </div>
                    ))
                  )}
              </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-0 bg-white p-6 rounded-xl shadow-md border border-gray-100 md:col-span-2 md:row-start-2">
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Activity size={20}/> Recent System Activity</h2>
             <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                     <thead>
                         <tr className="border-b border-gray-200 text-gray-500 text-sm">
                             <th className="py-3 font-medium">Activity</th>
                             <th className="py-3 font-medium">User</th>
                             <th className="py-3 font-medium">Time</th>
                             <th className="py-3 font-medium">Status</th>
                         </tr>
                     </thead>
                     <tbody>
                         {[1,2,3].map(i => (
                             <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                 <td className="py-3">New Land Registration</td>
                                 <td className="py-3">Officer Arghya</td>
                                 <td className="py-3">1{i} mins ago</td>
                                 <td className="py-3"><span className="text-green-600 text-sm font-medium">Completed</span></td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}