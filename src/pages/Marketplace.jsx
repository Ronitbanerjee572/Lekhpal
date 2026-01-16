import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Store, CheckCircle, AlertCircle, XCircle, Clock, MapPin, LogOut, User } from 'lucide-react';
import axios from 'axios';
import { ethers } from 'ethers';
import { LAND_REGISTRY_ADDRESS, LAND_REGISTRY_ABI, ESCROW_ADDRESS, ESCROW_ABI, RPC_URL } from '../config/contractConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8010';

export default function Marketplace() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('buy'); // 'buy', 'sell', 'my-listings'
  const [user, setUser] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  
  // Listings
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [myLands, setMyLands] = useState([]);
  
  // Form states
  const [selectedLandId, setSelectedLandId] = useState('');
  const [salePrice, setSalePrice] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchUserData();
    initContract();
  }, []);

  useEffect(() => {
    if (contract && account) {
      fetchMyLands();
    }
  }, [contract, account]);

  useEffect(() => {
    if (!contract) return;
    
    if (activeTab === 'buy') {
      fetchListings();
    } else if (activeTab === 'my-listings') {
      fetchMyListings();
    }
  }, [activeTab, contract]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data);
      
      if (response.data.walletAddress) {
        setAccount(response.data.walletAddress);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      if (err.response?.status === 401) {
        navigate('/auth');
      }
    }
  };

  const initContract = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contractInstance = new ethers.Contract(
        LAND_REGISTRY_ADDRESS,
        LAND_REGISTRY_ABI,
        provider
      );
      setContract(contractInstance);
    } catch (err) {
      console.error('Failed to initialize contract:', err);
      setError('Failed to connect to blockchain');
    }
  };

  const fetchMyLands = async () => {
    if (!contract || !account) return;

    try {
      const landCount = await contract.landCount();
      const owned = [];

      for (let i = 1; i <= landCount; i++) {
        const land = await contract.lands(i);
        if (land.currentOwner.toLowerCase() === account.toLowerCase()) {
          owned.push({
            id: land.id.toString(),
            khatian: land.khatian,
            state: land.state,
            city: land.city,
            ward: land.ward,
            area: land.area.toString(),
            value: ethers.formatEther(land.governmentValue),
          });
        }
      }

      setMyLands(owned);
    } catch (err) {
      console.error('Error fetching my lands:', err);
    }
  };

  const fetchListings = async () => {
    if (!contract) {
      console.error('Contract not initialized');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/marketplace/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        // Fetch land details from blockchain for each listing
        const listingsWithDetails = await Promise.all(
          response.data.listings.map(async (listing) => {
            try {
              const land = await contract.lands(listing.landId);
              return {
                ...listing,
                priceEth: ethers.formatEther(listing.priceWei),
                landDetails: {
                  khatian: land.khatian,
                  state: land.state,
                  city: land.city,
                  ward: land.ward,
                  area: land.area.toString(),
                },
              };
            } catch (err) {
              console.error(`Error fetching land ${listing.landId}:`, err);
              return null;
            }
          })
        );
        
        setListings(listingsWithDetails.filter(Boolean));
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
    }
  };

  const fetchMyListings = async () => {
    if (!contract) {
      console.error('Contract not initialized');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/marketplace/my-listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        const listingsWithDetails = await Promise.all(
          response.data.listings.map(async (listing) => {
            try {
              const land = await contract.lands(listing.landId);
              return {
                ...listing,
                priceEth: ethers.formatEther(listing.priceWei),
                landDetails: {
                  khatian: land.khatian,
                  state: land.state,
                  city: land.city,
                  ward: land.ward,
                  area: land.area.toString(),
                },
              };
            } catch (err) {
              return null;
            }
          })
        );
        
        setMyListings(listingsWithDetails.filter(Boolean));
      }
    } catch (err) {
      console.error('Error fetching my listings:', err);
    }
  };

  const handleRequestBuyerRole = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/marketplace/request-role`,
        { roleType: 'buyer' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(response.data.message);
      setTimeout(() => {
        setSuccess(null);
        fetchUserData();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error requesting buyer role');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSellerRole = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/marketplace/request-role`,
        { roleType: 'seller' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(response.data.message);
      setTimeout(() => {
        setSuccess(null);
        fetchUserData();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error requesting seller role');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleListLandForSale = async (e) => {
    e.preventDefault();
    
    if (!selectedLandId || !salePrice) {
      setError('Please fill all fields');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/marketplace/listings`,
        { landId: selectedLandId, priceEth: salePrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(response.data.message);
      setSelectedLandId('');
      setSalePrice('');
      
      setTimeout(() => {
        setSuccess(null);
        setActiveTab('my-listings');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error listing land');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyLand = async (listing) => {
    if (!window.ethereum) {
      setError('MetaMask not detected!');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const escrowWithSigner = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
      
      const tx = await escrowWithSigner.initiateDeal(listing.landId, {
        value: ethers.parseEther(listing.priceEth),
        gasLimit: 300000,
      });

      setSuccess(`Transaction initiated! Hash: ${tx.hash.slice(0, 10)}...`);
      await tx.wait();
      
      setSuccess('Deal initiated successfully! Awaiting admin approval.');
      setTimeout(() => {
        setSuccess(null);
        fetchListings();
      }, 3000);
    } catch (err) {
      console.error('Error buying land:', err);
      setError(err.code === 'ACTION_REJECTED' ? 'Transaction rejected' : `Error: ${err.message}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Approved</span>,
      pending: <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">Pending</span>,
      rejected: <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">Rejected</span>,
      not_requested: <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold">Not Requested</span>,
    };
    return badges[status] || badges.not_requested;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <header className="mb-6 sm:mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">△ <span className="text-indigo-600">Marketplace</span></h1>
          <p className="text-sm text-gray-600 mt-1">Buy and sell registered lands</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <User size={18} /> Profile
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/auth');
            }}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
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

      {/* Role Status Banner */}
      {user && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Marketplace Access Status</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-indigo-600" />
              <span className="text-sm text-gray-700">Buyer:</span>
              {getStatusBadge(user.buyerStatus)}
              {user.buyerStatus === 'not_requested' && (
                <button
                  onClick={handleRequestBuyerRole}
                  disabled={loading}
                  className="ml-2 text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  Request
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Store size={20} className="text-green-600" />
              <span className="text-sm text-gray-700">Seller:</span>
              {getStatusBadge(user.sellerStatus)}
              {user.sellerStatus === 'not_requested' && (
                <button
                  onClick={handleRequestSellerRole}
                  disabled={loading}
                  className="ml-2 text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-4 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab('buy')}
          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition ${
            activeTab === 'buy'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ShoppingCart className="inline mr-2" size={18} />
          Buy Lands
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          disabled={user?.sellerStatus !== 'approved'}
          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition ${
            activeTab === 'sell'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Store className="inline mr-2" size={18} />
          Sell Lands
        </button>
        <button
          onClick={() => setActiveTab('my-listings')}
          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition ${
            activeTab === 'my-listings'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          My Listings ({myListings.length})
        </button>
      </div>

      {/* Buy Tab */}
      {activeTab === 'buy' && (
        <div>
          {user?.buyerStatus !== 'approved' ? (
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <p className="text-yellow-800 font-semibold">
                {user?.buyerStatus === 'pending'
                  ? 'Your buyer request is pending admin approval'
                  : 'You need buyer approval to purchase lands. Click "Request" above.'}
              </p>
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white p-12 rounded-lg text-center shadow-sm">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No lands for sale at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div key={listing._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
                  <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <MapPin size={40} className="text-indigo-600" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      Land #{listing.landId} - {listing.landDetails.khatian}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {listing.landDetails.city}, {listing.landDetails.state}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Area: {listing.landDetails.area} sq units
                    </p>
                    <div className="border-t pt-3">
                      <p className="text-2xl font-bold text-indigo-600 mb-3">
                        {listing.priceEth} ETH
                      </p>
                      <button
                        onClick={() => handleBuyLand(listing)}
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
                      >
                        {loading ? 'Processing...' : 'Buy Now'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sell Tab */}
      {activeTab === 'sell' && (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">List Your Land for Sale</h2>

          {myLands.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">You don't own any lands yet</p>
            </div>
          ) : (
            <form onSubmit={handleListLandForSale} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Land to Sell
                </label>
                <select
                  value={selectedLandId}
                  onChange={(e) => setSelectedLandId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Land --</option>
                  {myLands.map((land) => (
                    <option key={land.id} value={land.id}>
                      Land #{land.id} - {land.khatian} ({land.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Sale Price (ETH)
                </label>
                <input
                  type="text"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="e.g., 5.5"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
              >
                {loading ? 'Submitting...' : 'Submit for Admin Approval'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* My Listings Tab */}
      {activeTab === 'my-listings' && (
        <div>
          {myListings.length === 0 ? (
            <div className="bg-white p-12 rounded-lg text-center shadow-sm">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">You haven't listed any lands yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myListings.map((listing) => (
                <div key={listing._id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        Land #{listing.landId} - {listing.landDetails.khatian}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {listing.landDetails.city}, {listing.landDetails.state}
                      </p>
                    </div>
                    {getStatusBadge(listing.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-bold text-indigo-600">{listing.priceEth} ETH</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Listed On</p>
                      <p className="font-semibold">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {listing.status === 'rejected' && listing.rejectionReason && (
                    <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded">
                      <p className="text-sm text-red-800">
                        <strong>Rejection Reason:</strong> {listing.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
