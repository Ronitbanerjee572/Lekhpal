import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Auth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNo: '',
    pinCode: '',
    password: '',
    role: 'user',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSuccess = (data) => {
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    const role = data.role || data.user?.role || formData.role;

    if (role === 'admin' || role === 'govt') {
      navigate('/gov-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8010';
      const url = isLogin
        ? `${apiUrl}/login`
        : `${apiUrl}/signup`;

      const payload = isLogin
        ? {
            email: formData.email,
            password: formData.password,
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            contactNo: formData.contactNo,
            pinCode: formData.pinCode,
            role: formData.role,
          };

      const res = await axios.post(url, payload);
      handleSuccess(res.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Request failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg-alt p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-bold text-center mb-6 text-brand-text">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <p className="text-red-500 text-center mb-4 font-medium">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg"
              />
              <input
                name="contactNo"
                placeholder="Contact Number"
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg"
              />
              <input
                name="pinCode"
                placeholder="Pin Code"
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg"
              />
            </>
          )}

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-accent text-white py-3 rounded-lg font-bold disabled:opacity-60"
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-brand-accent font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}