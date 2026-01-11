import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Mail, Phone, Edit2, Save, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import axios from 'axios';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [locationData, setLocationData] = useState(null);

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    contactNo: '',
    pinCode: '',
    role: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNo: '',
    pinCode: ''
  });

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Fetch location when pinCode changes
  useEffect(() => {
    if (formData.pinCode && formData.pinCode.length === 6) {
      fetchLocationData(formData.pinCode);
    } else {
      setLocationData(null);
    }
  }, [formData.pinCode]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8010';
      const response = await axios.get(`${apiUrl}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const user = response.data;
      setUserData({
        name: user.name || '',
        email: user.email || '',
        contactNo: user.contactNo?.replace('+91-', '') || '',
        pinCode: user.pinCode || '',
        role: user.role || ''
      });

      setFormData({
        name: user.name || '',
        email: user.email || '',
        contactNo: user.contactNo?.replace('+91-', '') || '',
        pinCode: user.pinCode || ''
      });

      // Fetch location for current pinCode
      if (user.pinCode) {
        fetchLocationData(user.pinCode);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
      } else {
        setError('Failed to load profile data');
        setTimeout(() => setError(''), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationData = async (pincode) => {
    if (!pincode || pincode.length !== 6) {
      setLocationData(null);
      return;
    }

    setFetchingLocation(true);
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      
      if (response.data && response.data[0] && response.data[0].Status === 'Success') {
        const postOffices = response.data[0].PostOffice;
        if (postOffices && postOffices.length > 0) {
          setLocationData({
            district: postOffices[0].District,
            state: postOffices[0].State,
            country: postOffices[0].Country,
            postOffice: postOffices[0].Name,
            block: postOffices[0].Block || 'N/A',
            division: postOffices[0].Division || 'N/A'
          });
        } else {
          setLocationData(null);
        }
      } else {
        setLocationData(null);
      }
    } catch (err) {
      console.error('Error fetching location:', err);
      setLocationData(null);
    } finally {
      setFetchingLocation(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: userData.name,
      email: userData.email,
      contactNo: userData.contactNo,
      pinCode: userData.pinCode
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: userData.name,
      email: userData.email,
      contactNo: userData.contactNo,
      pinCode: userData.pinCode
    });
    setError('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.contactNo || !formData.pinCode) {
        setError('All fields are required');
        setTimeout(() => setError(''), 3000);
        return;
      }

      if (formData.pinCode.length !== 6) {
        setError('Pin code must be 6 digits');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login again.');
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8010';
      
      const updatePayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        contactNo: formData.contactNo.trim(),
        pinCode: formData.pinCode.trim()
      };
      
      console.log('Sending update request with payload:', updatePayload);
      
      const response = await axios.patch(
        `${apiUrl}/update`,
        updatePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Update response:', response.data);
      console.log('PinCode in response:', response.data.pinCode);

      // Refresh user data from server to get updated values (without showing loading)
      const refreshToken = localStorage.getItem('token');
      if (refreshToken) {
        const refreshResponse = await axios.get(`${apiUrl}/me`, {
          headers: {
            Authorization: `Bearer ${refreshToken}`
          }
        });
        
        const user = refreshResponse.data;
        setUserData({
          name: user.name || '',
          email: user.email || '',
          contactNo: user.contactNo?.replace('+91-', '') || '',
          pinCode: user.pinCode || '',
          role: user.role || ''
        });

        // Update location if pinCode changed or exists
        if (user.pinCode) {
          if (user.pinCode !== userData.pinCode) {
            fetchLocationData(user.pinCode);
          } else {
            // Refresh location data even if same, to ensure it's displayed
            fetchLocationData(user.pinCode);
          }
        }
      }

      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message ||
                          'Failed to update profile';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/auth');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  if (loading && !userData.name) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-brand-accent mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-text">
            △ <span className="text-brand-accent">Profile</span>
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm sm:text-base w-full sm:w-auto"
          >
            Back to Dashboard
          </button>
        </div>

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

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start mb-6 gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-accent rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold flex-shrink-0">
                {userData.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-brand-text wrap-break-word">{userData.name}</h2>
                <p className="text-sm sm:text-base text-gray-600 capitalize">{userData.role || 'User'}</p>
              </div>
            </div>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm sm:text-base flex-1 sm:flex-initial justify-center"
                >
                  <Save size={16} className="sm:w-[18px] sm:h-[18px]" /> {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 text-sm sm:text-base flex-1 sm:flex-initial justify-center"
                >
                  <X size={16} className="sm:w-[18px] sm:h-[18px]" /> Cancel
                </button>
              </div>
            )}
          </div>

          {/* Profile Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="inline mr-2" /> Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg">{userData.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="inline mr-2" /> Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg">{userData.email}</p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="inline mr-2" /> Contact Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleChange}
                  placeholder="10 digit number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg">{userData.contactNo ? `+91-${userData.contactNo}` : 'N/A'}</p>
              )}
            </div>

            {/* Pin Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-2" /> Pin Code
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  maxLength={6}
                  placeholder="6 digit pin code"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg">{userData.pinCode || 'N/A'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location Information Card */}
        {userData.pinCode && (
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-brand-text mb-3 sm:mb-4 flex items-center gap-2">
              <MapPin size={20} className="sm:w-6 sm:h-6 text-brand-accent" /> Location Information
            </h3>
            
            {fetchingLocation ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader className="animate-spin h-5 w-5" />
                <span>Fetching location data...</span>
              </div>
            ) : locationData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">State</p>
                  <p className="font-bold text-brand-text">{locationData.state}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">District</p>
                  <p className="font-bold text-brand-text">{locationData.district}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Post Office</p>
                  <p className="font-bold text-brand-text">{locationData.postOffice}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Block</p>
                  <p className="font-bold text-brand-text">{locationData.block}</p>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Division</p>
                  <p className="font-bold text-brand-text">{locationData.division}</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Country</p>
                  <p className="font-bold text-brand-text">{locationData.country}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No location data found for pin code: {userData.pinCode}</p>
                <p className="text-sm text-gray-500 mt-2">Please verify the pin code is correct.</p>
              </div>
            )}
          </div>
        )}

        {/* Logout Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
