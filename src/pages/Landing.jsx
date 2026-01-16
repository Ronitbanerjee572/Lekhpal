import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThreeScene from '../components/ThreeScene';
import axios from 'axios';

export default function Landing() {
  useEffect(() => {
    // Warm up the backend with a health check request
    axios.get('/api/health')
      .then(() => console.log('Backend warmed up successfully'))
      .catch(error => console.log('Warm-up request failed:', error.message));
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full relative overflow-hidden bg-brand-bg">
        {/* Navbar / Top Button */}
        <div className="absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 z-10 flex w-[calc(100vw-2rem)] sm:w-[calc(100vw-3rem)] md:w-[calc(100vw-4rem)] justify-between items-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-text">△ <span className="text-brand-accent">Lekhpal</span></h1>
            <Link to="/auth" className="bg-brand-accent text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg font-bold hover:opacity-90 transition shadow-lg text-sm sm:text-base">
                Get Started
            </Link>
        </div>

      {/* Left Side - Text */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-4 sm:px-8 md:px-16 z-10 pt-20 sm:pt-24 md:pt-0 pb-8 md:pb-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-text mb-4 sm:mb-6">
          Secure Land <br />
          <span className="text-brand-accent">Registry</span> System
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-lg leading-relaxed">
          The future of property management. Blockchain-powered land ownership that is transparent, immutable, and secure.
        </p>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[{
            name: 'Google Cloud',
            src: 'https://cdn.simpleicons.org/googlecloud/4285F4'
          }, {
            name: 'Google Maps',
            src: 'https://cdn.simpleicons.org/googlemaps/34A853'
          }, {
            name: 'Google Web3',
            src: 'https://cdn.simpleicons.org/google/4285F4'
          }, {
            name: 'Vertex AI',
            src: 'https://cdn.simpleicons.org/google/4285F4'
          }, {
            name: 'Ethereum',
            src: 'https://cdn.simpleicons.org/ethereum/3C3C3D'
          }].map((logo) => (
            <div
              key={logo.name}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white shadow-sm border border-gray-200"
            >
              <img
                src={logo.src}
                alt={`${logo.name} logo`}
                className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
                loading="lazy"
              />
              <span className="text-sm sm:text-base font-semibold text-gray-700">{logo.name}</span>
            </div>
          ))}
        </div>
        <div>
             <Link to="/auth" className="inline-block bg-brand-text text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold hover:bg-brand-accent transition shadow-xl text-base sm:text-lg">
                Get Started
            </Link>
        </div>
      </div>

      {/* Right Side - 3D Model */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full bg-brand-bg-alt relative">
        <ThreeScene />
      </div>
    </div>
  );
}
