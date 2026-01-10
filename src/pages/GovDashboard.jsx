import React from 'react';
import { FileCheck, DollarSign, PenTool, Activity } from 'lucide-react';

export default function GovDashboard() {
  return (
    <div className="min-h-screen bg-brand-bg p-8">
      <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-text">△ <span className="text-brand-accent">Lekhpal</span></h1>
          <p className="text-gray-600">Manage land registrations, valuations, and approvals.</p>
      </header>

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
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Land Identifier</label>
                    <input placeholder="Dag / Khatian No." className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">New Valuation</label>
                    <input placeholder="Value in ETH/INR" className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                </div>
                <button className="w-full bg-brand-text text-white py-3 rounded-lg font-bold hover:bg-brand-accent transition mt-2">Update Valuation</button>
            </div>
        </div>

        {/* Register Land */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 rounded-lg text-green-600">
                    <PenTool size={24} />
                </div>
                <h2 className="text-xl font-bold text-brand-text">Register Land</h2>
            </div>
            <div className="space-y-4">
                <input placeholder="Owner Name" className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                <input placeholder="Land Details (Location, ID)" className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                <div className="flex gap-2">
                    <input placeholder="Area (sqft)" className="w-1/2 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                    <input placeholder="Dag No." className="w-1/2 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                </div>
                <button className="w-full bg-brand-text text-white py-3 rounded-lg font-bold hover:bg-brand-accent transition mt-2">Register Land</button>
            </div>
        </div>

        {/* Approve Escrow (spans both rows on the right) */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 md:col-start-3 md:row-span-2">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                    <FileCheck size={24} />
                </div>
                <h2 className="text-xl font-bold text-brand-text">Pending Approvals</h2>
            </div>
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {[1, 2, 3].map(i => (
                    <div key={i} className="border border-gray-100 p-4 rounded-lg bg-gray-50">
                        <div className="flex justify-between mb-2">
                            <span className="font-bold text-sm">Tx #{i}9923</span>
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Pending</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">Seller: 0xAb...3d <br/> Buyer: 0x92...a1</p>
                        <div className="flex gap-2">
                            <button className="flex-1 bg-green-600 text-white py-1.5 rounded text-sm font-medium hover:bg-green-700">Approve</button>
                            <button className="flex-1 bg-red-500 text-white py-1.5 rounded text-sm font-medium hover:bg-red-600">Reject</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Bottom row: 4+5 - Recent Activity (spans two columns), 6 - Approve Escrow (bottom-right duplicate) */}
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

        {/* duplicate removed; Approve Escrow now spans both rows */}

      </div>
    </div>
  );
}
