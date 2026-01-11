import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Search, Wallet, MapPin, Grid, LayoutDashboard, AlertCircle, CheckCircle, User, LogOut } from 'lucide-react';
import GlobeView from '../components/GlobeView';
import { ethers } from 'ethers';
import { LAND_REGISTRY_ADDRESS, LAND_REGISTRY_ABI, ESCROW_ADDRESS, ESCROW_ABI, RPC_URL } from '../config/contractConfig';
import axios from 'axios';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [account, setAccount] = useState(null);
  const [allLands, setAllLands] = useState([]);
  const [myLands, setMyLands] = useState([]);
  const [searchKhatian, setSearchKhatian] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [contract, setContract] = useState(null);
  const [escrowContract, setEscrowContract] = useState(null);
  const [buyingLandId, setBuyingLandId] = useState(null);
  const [buyingLoading, setBuyingLoading] = useState(false);
  const [userPinCode, setUserPinCode] = useState(null);

  // Fetch user pinCode on component mount
  useEffect(() => {
    fetchUserPinCode();
  }, []);

  // Initialize contract with provider (no wallet needed for reading)
  useEffect(() => {
    initContract();
  }, []);

  // Load all lands when component mounts
  useEffect(() => {
    if (contract) {
      loadAllLands();
    }
  }, [contract]);

  // Load user's lands when account changes
  useEffect(() => {
    if (contract && account) {
      loadMyLands();
    }
  }, [contract, account]);

  const fetchUserPinCode = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8010';
      const response = await axios.get(`${apiUrl}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.pinCode) {
        setUserPinCode(response.data.pinCode);
      }
    } catch (err) {
      console.error('Error fetching user pinCode:', err);
      // Silently fail - will use default pinCode
    }
  };

  const initContract = async () => {
    try {
      // Use JsonRpcProvider for read-only access (no wallet needed)
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
      setError(null);
    } catch (err) {
      console.error("Failed to initialize contract:", err);
      setError("Failed to connect to blockchain. Make sure your node is running.");
    }
  };

  const loadAllLands = async () => {
    setLoading(true);
    try {
      const landCount = await contract.landCount();
      const lands = [];
      
      // Fetch all registered lands
      for (let i = 1; i <= landCount; i++) {
        const land = await contract.lands(i);
        lands.push({
          id: land.id.toString(),
          owner: land.currentOwner,
          khatian: land.khatian,
          state: land.state,
          city: land.city,
          ward: land.ward,
          area: land.area.toString(),
          value: ethers.formatEther(land.governmentValue),
          registeredAt: new Date(Number(land.registeredAt) * 1000).toLocaleDateString(),
          deedType: land.deedType
        });
      }
      
      setAllLands(lands);
      setError(null);
    } catch (err) {
      console.error("Error loading lands:", err);
      setError("Failed to load lands from blockchain");
    } finally {
      setLoading(false);
    }
  };

  const loadMyLands = async () => {
    if (!account || !contract) return;
    
    try {
      const landCount = await contract.landCount();
      const myOwnedLands = [];
      
      // Filter lands owned by current user
      for (let i = 1; i <= landCount; i++) {
        const land = await contract.lands(i);
        if (land.currentOwner.toLowerCase() === account.toLowerCase()) {
          myOwnedLands.push({
            id: land.id.toString(),
            owner: land.currentOwner,
            khatian: land.khatian,
            state: land.state,
            city: land.city,
            ward: land.ward,
            area: land.area.toString(),
            value: ethers.formatEther(land.governmentValue),
            registeredAt: new Date(Number(land.registeredAt) * 1000).toLocaleDateString(),
            deedType: land.deedType
          });
        }
      }
      
      setMyLands(myOwnedLands);
    } catch (err) {
      console.error("Error loading my lands:", err);
    }
  };

  const handleSearch = async () => {
    if (!searchKhatian.trim() || !contract) return;
    
    setLoading(true);
    try {
      const landIds = await contract.searchByKhatian(searchKhatian);
      
      if (landIds.length === 0) {
        alert(`No lands found with Khatian: ${searchKhatian}`);
        return;
      }
      
      const searchedLands = [];
      for (let landId of landIds) {
        const land = await contract.lands(landId);
        searchedLands.push({
          id: land.id.toString(),
          owner: land.currentOwner,
          khatian: land.khatian,
          state: land.state,
          city: land.city,
          ward: land.ward,
          area: land.area.toString(),
          value: ethers.formatEther(land.governmentValue),
          registeredAt: new Date(Number(land.registeredAt) * 1000).toLocaleDateString(),
          deedType: land.deedType
        });
      }
      
      setAllLands(searchedLands);
      setError(null);
    } catch (err) {
      console.error("Error searching lands:", err);
      setError("Failed to search lands");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          setSuccess(`Connected wallet: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
          setTimeout(() => setSuccess(null), 3000);
        }
      } catch (error) {
        console.error("MetaMask connection failed", error);
        setError("Failed to connect MetaMask.");
        setTimeout(() => setError(null), 3000);
      }
    } else {
      setError("MetaMask not detected! Please install MetaMask to continue.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const handleBuyLand = async (land) => {
    if (!window.ethereum) {
      setError("MetaMask not detected! Please install MetaMask to purchase.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (account === land.owner) {
      setError("You already own this land!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setBuyingLandId(land.id);
      setBuyingLoading(true);
      
      // Get signer from MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create escrow contract instance with signer (for transaction)
      const escrowWithSigner = new ethers.Contract(
        ESCROW_ADDRESS,
        ESCROW_ABI,
        signer
      );
      
      // Get the land value in wei
      const landValue = ethers.parseEther(land.value);
      
      // Call initiateDeal with payment
      const tx = await escrowWithSigner.initiateDeal(land.id, {
        value: landValue,
        gasLimit: 300000
      });
      
      setSuccess(`Transaction initiated! Hash: ${tx.hash.slice(0, 10)}...`);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      setSuccess(`Successfully initiated deal for land ${land.id}! Awaiting admin approval.`);
      setTimeout(() => setSuccess(null), 5000);
      
      // Reload lands
      await loadAllLands();
      await loadMyLands();
      
    } catch (err) {
      console.error("Error buying land:", err);
      if (err.code === 'ACTION_REJECTED') {
        setError("Transaction rejected by user");
      } else {
        setError(`Failed to buy land: ${err.message}`);
      }
      setTimeout(() => setError(null), 3000);
    } finally {
      setBuyingLandId(null);
      setBuyingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg p-4 sm:p-6 md:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 bg-white p-3 sm:p-4 rounded-xl shadow-sm gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-text">△ <span className="text-brand-accent">Lekhpal</span></h1>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
             <button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-md text-sm sm:text-base"
             >
                <User size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Profile</span><span className="sm:hidden">Profile</span>
             </button>
             <button 
                onClick={() => setViewMode(viewMode === 'map' ? 'grid' : 'map')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition border text-sm sm:text-base ${viewMode === 'map' ? 'bg-brand-accent text-white border-brand-accent' : 'bg-white text-brand-text border-gray-300 hover:bg-gray-50'}`}
             >
                {viewMode === 'map' ? <><LayoutDashboard size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Grid View</span><span className="sm:hidden">Grid</span></> : <><Globe size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Map View</span><span className="sm:hidden">Map</span></>}
             </button>
             <button onClick={handleConnectWallet} className="flex items-center gap-1.5 sm:gap-2 bg-brand-text-dark text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow-md text-sm sm:text-base">
               <Wallet size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">{account ? `${account.slice(0,6)}...${account.slice(-4)}` : 'Connect Wallet'}</span><span className="sm:hidden">{account ? `${account.slice(0,4)}...` : 'Wallet'}</span>
             </button>
             <button onClick={handleLogout} className="flex items-center gap-1.5 sm:gap-2 bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-md text-sm sm:text-base">
               <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Logout</span><span className="sm:hidden">Out</span>
             </button>
        </div>
      </header>

      {/* Search Section */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-6 md:mb-8 border border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2"><Search size={18} className="sm:w-5 sm:h-5"/> <span>Search Land Registry</span></h2>
        <div className="flex gap-3 sm:gap-4 flex-col sm:flex-row">
            <input 
              placeholder="Enter Khatian No." 
              className="flex-1 p-2.5 sm:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent text-sm sm:text-base" 
              value={searchKhatian}
              onChange={(e) => setSearchKhatian(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              disabled={loading || !contract}
              className="bg-brand-text text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-brand-accent transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
                {loading ? 'Searching...' : 'Search'}
            </button>
            <button 
              onClick={loadAllLands}
              disabled={loading || !contract}
              className="bg-gray-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
                Show All
            </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
          <p className="mt-4 text-gray-600">Loading lands from blockchain...</p>
        </div>
      )}

      {viewMode === 'map' ? (
          <div className="mb-6 md:mb-8 animate-in fade-in zoom-in duration-300">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-brand-text">Global Land Map</h2>
             <GlobeView pinCode={userPinCode || 700050} /> 
          </div>
      ) : (
        <>
            {/* Owned Lands Section */}
            {account && myLands.length > 0 && (
              <div className="mb-8 sm:mb-10">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-brand-text border-b pb-2 border-gray-200">
                  My Owned Lands ({myLands.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                  {myLands.map((land) => (
                    <div key={land.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 border border-green-200 relative">
                      <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">OWNED</div>
                      <div className="h-40 bg-green-50 flex items-center justify-center text-green-300">
                        <MapPin size={40} />
                      </div>
                      <div className="p-4 sm:p-5">
                        <h3 className="font-bold text-base sm:text-lg text-brand-text break-words">Plot #{land.id} - Khatian: {land.khatian}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Location: {land.city}, {land.state}</p>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Ward: {land.ward}</p>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">Area: {land.area} sq units</p>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">Deed: {land.deedType}</p>
                        <p className="text-xs text-gray-500">Registered: {land.registeredAt}</p>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs sm:text-sm text-gray-600">Value: <span className="font-bold text-brand-accent">{land.value} ETH</span></p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Lands / Marketplace Section */}
            <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-brand-text border-b pb-2 border-gray-200">
                  {searchKhatian ? 'Search Results' : 'All Registered Lands'} ({allLands.length})
                </h2>
                {allLands.length === 0 && !loading ? (
                  <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm px-4">
                    <MapPin size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
                    <p className="text-gray-600 text-base sm:text-lg">No lands found</p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-2">Try adjusting your search or check back later</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                    {allLands.map((land) => {
                      const isOwned = account && land.owner.toLowerCase() === account.toLowerCase();
                      return (
                        <div key={land.id} className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 border ${isOwned ? 'border-green-200' : 'border-gray-100'} relative`}>
                          {isOwned && <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">OWNED</div>}
                          <div className={`h-48 ${isOwned ? 'bg-green-50' : 'bg-gray-200'} flex items-center justify-center text-gray-400 relative`}>
                            <MapPin size={40} className={`${isOwned ? 'text-green-300' : 'text-brand-accent'} opacity-50`} />
                            <span className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">ID: {land.id}</span>
                          </div>
                          <div className="p-4 sm:p-5">
                            <div className="flex justify-between items-start mb-2 gap-2">
                              <h3 className="font-bold text-base sm:text-lg text-brand-text break-words">Khatian: {land.khatian}</h3>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold whitespace-nowrap">Verified</span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">Location: {land.city}, {land.state}</p>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">Ward: {land.ward}</p>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2">Area: {land.area} sq units</p>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2">Deed Type: {land.deedType}</p>
                            <p className="text-xs text-gray-500 mb-3">Registered: {land.registeredAt}</p>
                            
                            <div className="border-t border-gray-100 pt-3 sm:pt-4">
                              <div className="flex justify-between items-center mb-3 flex-col sm:flex-row gap-2 sm:gap-0">
                                <div>
                                  <p className="text-xs text-gray-500">Gov. Value</p>
                                  <span className="font-bold text-brand-accent text-lg sm:text-xl">{land.value} ETH</span>
                                </div>
                                <div className="text-right sm:text-right">
                                  <p className="text-xs text-gray-500 mb-1">Owner</p>
                                  <p className="text-xs font-mono text-gray-700 break-all">
                                    {land.owner.slice(0, 6)}...{land.owner.slice(-4)}
                                  </p>
                                </div>
                              </div>
                              {!isOwned && (
                                <button 
                                  onClick={() => handleBuyLand(land)}
                                  disabled={buyingLoading && buyingLandId === land.id || !account}
                                  className="w-full bg-brand-text text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-accent transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                >
                                  {buyingLoading && buyingLandId === land.id ? 'Processing...' : account ? 'Buy Now' : 'Connect Wallet to Buy'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
        </>
      )}
    </div>
  );
}