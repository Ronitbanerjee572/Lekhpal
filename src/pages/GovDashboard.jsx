import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, DollarSign, PenTool, Activity, Wallet, AlertCircle, CheckCircle, LogOut, User } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function GovDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

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

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Get auth headers
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // Check admin status on mount
  useEffect(() => {
    checkAdminStatus();
    loadPendingDeals();
    loadRecentActivity();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/blockchain/check-admin`, getAuthHeaders());
      if (response.data.success) {
        setIsAdmin(response.data.isAdmin);
        setWalletAddress(response.data.walletAddress);
      }
    } catch (err) {
      console.error("Failed to check admin status:", err);
      if (err.response?.status === 401) {
        navigate('/auth');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/blockchain/check-admin`, getAuthHeaders());

      if (response.data.success) {
        setWalletAddress(response.data.walletAddress);
        setIsAdmin(response.data.isAdmin);
        setSuccess("Connected to backend successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Failed to connect to backend");
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error("Error connecting to backend:", err);
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
        setTimeout(() => navigate('/auth'), 2000);
      } else {
        setError("Failed to connect to backend. Please try again.");
      }
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterLand = async (e) => {
    e.preventDefault();

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

      const response = await axios.post(
        `${API_URL}/blockchain/register-land`,
        registerForm,
        getAuthHeaders()
      );

      if (response.data.success) {
        setSuccess(response.data.message);
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
      }

    } catch (err) {
      console.error("Error registering land:", err);
      setError(err.response?.data?.message || `Failed to register land: ${err.message}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSetValuation = async (e) => {
    e.preventDefault();

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

      const response = await axios.post(
        `${API_URL}/blockchain/set-valuation`,
        valuationForm,
        getAuthHeaders()
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setValuationForm({ landId: '', value: '' });
        setTimeout(() => setSuccess(null), 3000);
      }

    } catch (err) {
      console.error("Error setting valuation:", err);
      setError(err.response?.data?.message || `Failed to set valuation: ${err.message}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDeal = async (dealId) => {
    if (!isAdmin) {
      setError("Only admins can approve deals");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/blockchain/approve-deal`,
        { dealId },
        getAuthHeaders()
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setTimeout(() => setSuccess(null), 3000);

        // Refresh pending deals
        await loadPendingDeals();
      }

    } catch (err) {
      console.error("Error approving deal:", err);
      setError(err.response?.data?.message || `Failed to approve deal: ${err.message}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingDeals = async () => {
    try {
      const response = await axios.get(`${API_URL}/blockchain/pending-deals`, getAuthHeaders());

      if (response.data.success) {
        setPendingDeals(response.data.deals);
      }
    } catch (err) {
      console.error("Error loading deals:", err);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/blockchain/recent-activity`,
        getAuthHeaders()
      );
      if (res.data.success) {
        setRecentActivity(res.data.activity);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg p-4 sm:p-6 md:p-8">
      <header className="mb-6 sm:mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-text">△ <span className="text-brand-accent">Lekhpal Admin</span></h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage land registrations, valuations, and deal approvals.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 w-full lg:w-auto">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-1.5 sm:gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
          >
            <User size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Profile</span><span className="sm:hidden">Profile</span>
          </button>

          {walletAddress && (
            <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Backend Wallet</p>
              <p className="font-bold text-brand-accent text-xs sm:text-sm break-all">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
              {isAdmin && <p className="text-xs text-green-600 font-medium">✓ Admin</p>}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 sm:gap-2 bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
          >
            <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Logout</span><span className="sm:hidden">Out</span>
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

      {!isAdmin && walletAddress && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>Your wallet is not an admin. Please contact the system administrator.</span>
        </div>
      )}

      {!walletAddress ? (
        <div className="bg-white p-6 sm:p-8 md:p-12 rounded-xl shadow-md text-center">
          <Wallet size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-brand-text mb-2">Connect Your Wallet</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">Please connect your MetaMask wallet to access admin functions.</p>
          <button
            onClick={handleConnectWallet}
            className="inline-flex items-center gap-2 bg-brand-text text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-brand-accent transition font-bold text-sm sm:text-base"
          >
            <Wallet size={18} className="sm:w-5 sm:h-5" /> Connect MetaMask
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Top row: 1 - Set Valuation, 2 - Register Land, 3 - Approve Escrow (top) */}
          {/* Set Valuation */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg text-blue-600">
                <DollarSign size={20} className="sm:w-6 sm:h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-brand-text">Set Valuation</h2>
            </div>
            <form onSubmit={handleSetValuation} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Land ID</label>
                <input
                  type="number"
                  placeholder="Enter Land ID"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  value={valuationForm.landId}
                  onChange={(e) => setValuationForm({ ...valuationForm, landId: e.target.value })}
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
                  onChange={(e) => setValuationForm({ ...valuationForm, value: e.target.value })}
                  disabled={loading || !isAdmin}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !isAdmin}
                className="w-full bg-brand-text text-white py-3 rounded-lg font-bold hover:bg-brand-accent transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Updating...' : 'Update Valuation'}
              </button>
            </form>
          </div>

          {/* Register Land */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg text-green-600">
                <PenTool size={20} className="sm:w-6 sm:h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-brand-text">Register New Land</h2>
            </div>
            <form onSubmit={handleRegisterLand} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Owner Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  value={registerForm.ownerAddress}
                  onChange={(e) => setRegisterForm({ ...registerForm, ownerAddress: e.target.value })}
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
                  onChange={(e) => setRegisterForm({ ...registerForm, khatian: e.target.value })}
                  disabled={loading || !isAdmin}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">State</label>
                  <input
                    type="text"
                    placeholder="State"
                    className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent text-sm sm:text-base"
                    value={registerForm.state}
                    onChange={(e) => setRegisterForm({ ...registerForm, state: e.target.value })}
                    disabled={loading || !isAdmin}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">City</label>
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent text-sm sm:text-base"
                    value={registerForm.city}
                    onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                    disabled={loading || !isAdmin}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Ward</label>
                  <input
                    type="text"
                    placeholder="Ward"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    value={registerForm.ward}
                    onChange={(e) => setRegisterForm({ ...registerForm, ward: e.target.value })}
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
                    onChange={(e) => setRegisterForm({ ...registerForm, area: e.target.value })}
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
                  onChange={(e) => setRegisterForm({ ...registerForm, valuation: e.target.value })}
                  disabled={loading || !isAdmin}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !isAdmin}
                className="w-full bg-brand-text text-white py-3 rounded-lg font-bold hover:bg-brand-accent transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Registering...' : 'Register Land'}
              </button>
            </form>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-100 lg:col-start-3 lg:row-span-2">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg text-purple-600">
                <FileCheck size={20} className="sm:w-6 sm:h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-brand-text">Pending Approvals ({pendingDeals.length})</h2>
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
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-100 lg:col-span-2">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2"><Activity size={18} className="sm:w-5 sm:h-5" /> Recent System Activity</h2>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-0">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 text-xs sm:text-sm">
                    <th className="py-2 sm:py-3 px-2 sm:px-0 font-medium">Activity</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-0 font-medium">User</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-0 font-medium">Time</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-0 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-gray-500">
                        No recent land registrations
                      </td>
                    </tr>
                  ) : (
                    recentActivity.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 sm:py-3 text-xs sm:text-sm">
                          Land Registered (#{item.landId})
                        </td>
                        <td className="py-2 sm:py-3 text-xs sm:text-sm">
                          {item.owner.slice(0, 6)}...{item.owner.slice(-4)}
                        </td>
                        <td className="text-xs sm:text-sm">
                          {new Date(item.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2 sm:py-3">
                          <span className="text-green-600 text-xs sm:text-sm font-medium">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}