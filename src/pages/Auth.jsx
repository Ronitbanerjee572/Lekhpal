import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNo: '',
    pinCode: '',
    password: '',
    role: 'user'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // // Mock routing based on role
    // if (formData.role === 'gov') {
    //     navigate('/gov-dashboard');
    // } else {
    //     navigate('/dashboard');
    // }
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg-alt p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-bold text-center mb-6 text-brand-text">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition" required />
              <input name="contactNo" placeholder="Contact Number" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition" required />
              <input name="pinCode" placeholder="Pin Code" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition" required />
            </>
          )}
          
          <input name="email" type="email" placeholder="Email Address" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition" required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition" required />
          
          {/* <div className="flex gap-4 justify-center py-2">
             <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="role" value="user" checked={formData.role === 'user'} onChange={handleChange} className="accent-brand-accent w-4 h-4" /> 
                <span className="font-medium">User</span>
             </label>
             <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="role" value="gov" checked={formData.role === 'gov'} onChange={handleChange} className="accent-brand-accent w-4 h-4" /> 
                <span className="font-medium">Government</span>
             </label>
          </div> */}

          <button type="submit" className="w-full bg-brand-accent text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition shadow-md">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-brand-accent font-bold hover:underline">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
