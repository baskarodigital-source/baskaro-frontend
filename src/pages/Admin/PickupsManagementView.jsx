import React, { useState } from 'react'
import { 
  Truck, Plus, MapPin, Calendar, Clock, CheckCircle 
} from 'lucide-react'

export default function PickupsManagementView() {
  const [pickups, setPickups] = useState([
    { id: 'PKP-1001', orderId: 'ORD-8X9P', customer: 'Rahul Sharma', address: '42, MG Road, Bangalore, KA - 560001', date: 'Oct 25, 2023', time: '10:00 AM - 12:00 PM', agent: 'Ramesh K.', status: 'Pending' },
    { id: 'PKP-1002', orderId: 'ORD-2K4M', customer: 'Priya Patel', address: '18, Navrangpura, Ahmedabad, GJ - 380009', date: 'Oct 24, 2023', time: '02:00 PM - 04:00 PM', agent: 'Suresh P.', status: 'Completed' },
    { id: 'PKP-1003', orderId: 'ORD-5W8N', customer: 'Vikram Reddy', address: 'B-Block, Rajouri Garden, Delhi - 110027', date: 'Oct 26, 2023', time: '04:00 PM - 06:00 PM', agent: 'Unassigned', status: 'Pending' },
  ]);

  const agents = ['Unassigned', 'Ramesh K.', 'Suresh P.', 'Karan S.', 'Deepak M.'];
  const statuses = ['Pending', 'Completed', 'Cancelled'];

  const [isAddingPickup, setIsAddingPickup] = useState(false);
  const [newPickup, setNewPickup] = useState({ orderId: '', customer: '', address: '', date: '', time: '', agent: 'Unassigned', status: 'Pending' });

  const handleCreatePickup = (e) => {
    e.preventDefault();
    const id = `PKP-${Math.floor(1000 + Math.random() * 9000)}`;
    setPickups([{ id, ...newPickup }, ...pickups]);
    setIsAddingPickup(false);
    setNewPickup({ orderId: '', customer: '', address: '', date: '', time: '', agent: 'Unassigned', status: 'Pending' });
  };

  const updatePickup = (id, field, value) => {
    setPickups(pickups.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-orange-100 text-orange-800 border-orange-200 focus:ring-orange-500/20';
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200 focus:ring-emerald-500/20';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200 focus:ring-red-500/20';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Pickup Management</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Assign agents and track on-field pickup operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsAddingPickup(true)} className="flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl px-5 py-2.5 text-sm font-black hover:bg-black shadow-md shadow-slate-200 transition">
            <Plus size={16} strokeWidth={3} /> Manual Pickup
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest h-14">
                <th className="px-6 font-bold">Pickup ID & Client</th>
                <th className="px-6 font-bold w-[30%]">Location</th>
                <th className="px-6 font-bold min-w-[150px]">Schedule</th>
                <th className="px-6 font-bold">Assigned Agent</th>
                <th className="px-6 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pickups.map((pickup) => (
                <tr key={pickup.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-900 text-sm">{pickup.id}</div>
                    <div className="font-semibold text-slate-600 text-xs mt-1">{pickup.customer}</div>
                    <div className="font-black text-slate-400 text-[10px] uppercase tracking-wider mt-0.5">{pickup.orderId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-700 leading-snug flex items-start gap-1.5 line-clamp-2">
                       <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                       {pickup.address}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-1">
                       <Calendar size={14} className="text-slate-400"/> {pickup.date}
                    </div>
                    <div className="font-semibold text-slate-500 text-[11px] flex items-center gap-1.5">
                       <Clock size={14} className="text-slate-400"/> {pickup.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={pickup.agent}
                      onChange={(e) => updatePickup(pickup.id, 'agent', e.target.value)}
                      className={`text-sm font-bold border rounded-lg px-2 py-1.5 outline-none transition-colors appearance-none cursor-pointer text-center sm:text-left ${pickup.agent === 'Unassigned' ? 'bg-orange-50 border-orange-200 text-orange-600 focus:border-orange-500' : 'bg-white border-slate-200 text-slate-700 focus:border-blue-500 hover:border-slate-300'}`}
                    >
                      {agents.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end">
                      <select 
                        value={pickup.status}
                        onChange={(e) => updatePickup(pickup.id, 'status', e.target.value)}
                        className={`text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border outline-none appearance-none cursor-pointer text-center ring-offset-1 focus:ring-2 transition-all shadow-sm ${getStatusColor(pickup.status)}`}
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isAddingPickup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
               <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><Truck size={18} className="text-blue-600"/> Create Manual Pickup</h3>
               <button onClick={() => setIsAddingPickup(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><Plus size={24} className="rotate-45"/></button>
            </div>
            <form onSubmit={handleCreatePickup} className="p-6 space-y-4">
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Linked Order ID</label>
                 <input required type="text" placeholder="e.g. ORD-9X12" value={newPickup.orderId} onChange={e=>setNewPickup({...newPickup, orderId: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium transition-all" />
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Customer Name</label>
                 <input required type="text" placeholder="Customer Name" value={newPickup.customer} onChange={e=>setNewPickup({...newPickup, customer: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium transition-all" />
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Full Address</label>
                 <textarea required rows="2" placeholder="Complete pickup location" value={newPickup.address} onChange={e=>setNewPickup({...newPickup, address: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium resize-none transition-all"></textarea>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Date</label>
                   <input required type="date" value={newPickup.date} onChange={e=>setNewPickup({...newPickup, date: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700 transition-all" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Time Slot</label>
                   <select required value={newPickup.time} onChange={e=>setNewPickup({...newPickup, time: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700 bg-white cursor-pointer transition-all">
                      <option value="">Select slot</option>
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                      <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                   </select>
                 </div>
               </div>
               <div className="pt-4 flex justify-end gap-3 mt-2">
                 <button type="button" onClick={() => setIsAddingPickup(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                 <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-black bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 transition flex items-center gap-1.5"><CheckCircle size={16}/> Schedule Pickup</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
