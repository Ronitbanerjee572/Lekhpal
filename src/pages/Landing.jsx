import React from 'react';
import { Link } from 'react-router-dom';
import ThreeScene from '../components/ThreeScene';

export default function Landing() {
  return (
    <div className="flex h-screen w-full relative overflow-hidden bg-brand-bg">
        {/* Navbar / Top Button */}
        <div className="absolute top-8 left-8 z-10 flex w-[calc(100vw-4rem)] justify-between items-center">
            <h1 className="text-3xl font-bold text-brand-text">△ <span className="text-brand-accent">Lekhpal</span></h1>
            <Link to="/auth" className="bg-brand-accent text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 transition shadow-lg">
                Get Started
            </Link>
        </div>

      {/* Left Side - Text */}
      <div className="w-1/2 flex flex-col justify-center px-16 z-10">
        <h1 className="text-6xl font-extrabold text-brand-text mb-6">
          Secure Land <br />
          <span className="text-brand-accent">Registry</span> System
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed">
          The future of property management. Blockchain-powered land ownership that is transparent, immutable, and secure.
        </p>
        <div>
             <Link to="/auth" className="bg-brand-text text-white px-8 py-4 rounded-lg font-bold hover:bg-brand-accent transition shadow-xl text-lg">
                Get Started
            </Link>
        </div>
      </div>

      {/* Right Side - 3D Model */}
      <div className="w-1/2 h-full bg-brand-bg-alt relative">
        <ThreeScene />
      </div>
    </div>
  );
}
