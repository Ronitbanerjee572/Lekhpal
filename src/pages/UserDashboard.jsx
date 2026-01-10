import React, { useState } from 'react';
import { Globe, Search, Wallet, MapPin, Grid, LayoutDashboard } from 'lucide-react';
import GlobeView from '../components/GlobeView';

export default function UserDashboard() {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  const handleBuy = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        alert("MetaMask Connected! Proceeding with transaction...");
      } catch (error) {
        console.error("MetaMask connection failed", error);
        alert("Failed to connect MetaMask.");
      }
    } else {
      alert("MetaMask not detected! Please install MetaMask to purchase.");
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg p-8">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm gap-4">
        <h1 className="text-3xl font-bold text-brand-text">△ <span className="text-brand-accent">Lekhpal</span></h1>
        <div className="flex gap-4">
             <button 
                onClick={() => setViewMode(viewMode === 'map' ? 'grid' : 'map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition border ${viewMode === 'map' ? 'bg-brand-accent text-white border-brand-accent' : 'bg-white text-brand-text border-gray-300 hover:bg-gray-50'}`}
             >
                {viewMode === 'map' ? <><LayoutDashboard size={18} /> Grid View</> : <><Globe size={18} /> Map View</>}
             </button>
             <button className="flex items-center gap-2 bg-brand-text-dark text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow-md">
                <Wallet size={18} /> Connect Wallet
             </button>
        </div>
      </header>

      {/* Search Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Search size={20}/> Search Land Registry</h2>
        <div className="flex gap-4 flex-col md:flex-row">
            {/* <input placeholder="Enter Dag No." className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent" /> */}
            <input placeholder="Enter Khatian No." className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent" />
            <button className="bg-brand-text text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-accent transition">
                Search
            </button>
        </div>
      </div>

      {viewMode === 'map' ? (
          <div className="mb-8 animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold mb-4 text-brand-text">Global Land Map</h2>
            {/* <GlobeView /> */}
          </div>
      ) : (
        <>
            {/* Owned Lands Section */}
            <div className="mb-10">
                <h2 className="text-2xl font-bold mb-6 text-brand-text border-b pb-2 border-gray-200">My Owned Lands</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {/* Mock Owned Land */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 border border-green-200 relative">
                         <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">OWNED</div>
                        <div className="h-40 bg-green-50 flex items-center justify-center text-green-300">
                            <MapPin size={40} />
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-lg text-brand-text">Plot #101 - My Estate</h3>
                            <p className="text-sm text-gray-600 mb-2">Location: Prime City, Sector 5</p>
                            <button className="w-full mt-2 border border-brand-text text-brand-text px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-text hover:text-white transition">
                                View Documents
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Marketplace Section */}
            <div>
                <h2 className="text-2xl font-bold mb-6 text-brand-text border-b pb-2 border-gray-200">Marketplace</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 border border-gray-100">
                            <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400 relative">
                                <MapPin size={40} className="text-brand-accent opacity-50" />
                                <span className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">ID: 882{item}</span>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-brand-text">Plot #{item}234 - Green Valley</h3>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">Verified</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">Location: District A, Block B</p>
                                <p className="text-sm text-gray-600 mb-4">Area: 1200 sqft</p>
                                
                                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-gray-500">Price</p>
                                        <span className="font-bold text-brand-accent text-xl">2.5 ETH</span>
                                    </div>
                                    <button onClick={handleBuy} className="bg-brand-text text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-brand-accent transition shadow-lg">
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
      )}
    </div>
  );
}