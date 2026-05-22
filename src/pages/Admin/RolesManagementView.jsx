import React, { useState } from 'react'
import { 
  Users, Plus, ShieldAlert, CheckCircle 
} from 'lucide-react'

export default function RolesManagementView() {
  const [admins, setAdmins] = useState([]);

  const rolesList = ['Super Admin', 'Manager', 'Support'];

  const [permissions, setPermissions] = useState({
    'Super Admin': { manageOrders: true, manageUsers: true, manageDevices: true },
    'Manager': { manageOrders: true, manageUsers: false, manageDevices: true },
    'Support': { manageOrders: true, manageUsers: false, manageDevices: false },
  });

  const togglePermission = (role, perm) => {
    if (role === 'Super Admin') return; 
    setPermissions({
      ...permissions,
      [role]: {
        ...permissions[role],
        [perm]: !permissions[role][perm]
      }
    });
  };

  const handleRoleChange = (id, newRole) => {
    setAdmins(admins.map(a => a.id === id ? { ...a, role: newRole } : a));
  };

  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'Support' });

  const handleAddAdmin = (e) => {
    e.preventDefault();
    const id = `ADM-0${Math.floor(4 + Math.random() * 9)}`;
    setAdmins([...admins, { id, ...newAdmin, status: 'Active' }]);
    setIsAddingAdmin(false);
    setNewAdmin({ name: '', email: '', role: 'Support' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Roles & Permissions</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage platform access, active personnel, and security hierarchies.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsAddingAdmin(true)} className="flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl px-4 py-2 text-sm font-black hover:bg-black transition shadow-sm">
            <Plus size={16} strokeWidth={3} /> Add Personnel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Personnel Matrix */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
             <h3 className="font-black text-slate-900 text-lg flex items-center gap-2"><Users size={18} className="text-blue-500"/> Team Directory</h3>
          </div>
          <div className="overflow-x-auto flex-1 p-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest h-10 border-b border-slate-100">
                  <th className="px-4">Admin Identity</th>
                  <th className="px-4">Assigned Role</th>
                  <th className="px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm font-semibold text-slate-500">
                      No personnel rows — add admins in the database or use Add Personnel when wired to the API.
                    </td>
                  </tr>
                )}
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-black text-slate-900 text-sm">{admin.name}</div>
                      <div className="font-medium text-slate-500 text-xs mt-0.5">{admin.email}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                       <select 
                         value={admin.role}
                         onChange={(e) => handleRoleChange(admin.id, e.target.value)}
                         className="text-xs font-black uppercase tracking-widest outline-none appearance-none px-3 py-1.5 rounded-lg shadow-sm transition-all focus:ring-2 focus:border-blue-500 w-32 cursor-pointer bg-white text-slate-700 border border-slate-300 hover:border-slate-400"
                       >
                         {rolesList.map(r => <option key={r} value={r}>{r}</option>)}
                       </select>
                    </td>
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${admin.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${admin.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          {admin.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permissions Configuration */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
             <h3 className="font-black text-slate-900 text-lg flex items-center gap-2"><ShieldAlert size={18} className="text-red-500"/> Role Configurations</h3>
          </div>
          <div className="p-5 flex-1 space-y-6 overflow-y-auto">
             {rolesList.map(role => (
                <div key={role} className="border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors shadow-sm bg-slate-50/20">
                   <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                      <span className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
                        {role === 'Super Admin' && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                        {role === 'Manager' && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                        {role === 'Support' && <span className="w-2 h-2 rounded-full bg-orange-500"></span>}
                        {role} 
                      </span>
                      {role === 'Super Admin' && <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Locked</span>}
                   </div>
                   <div className="p-4 space-y-3">
                      
                      {Object.keys(permissions[role]).map(perm => {
                         const permLabel = perm.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                         const isGranted = permissions[role][perm];
                         const isSuperAdmin = role === 'Super Admin';
                         return (
                            <div key={perm} className="flex justify-between items-center">
                               <span className={`text-sm font-bold ${isSuperAdmin ? 'text-slate-500' : 'text-slate-700'}`}>{permLabel}</span>
                               <button 
                                 onClick={() => togglePermission(role, perm)}
                                 disabled={isSuperAdmin}
                                 className={`w-12 h-6 flex items-center rounded-full p-1 border transition-all duration-300 shadow-inner ${isSuperAdmin ? 'bg-slate-200 border-slate-300 cursor-not-allowed opacity-70' : isGranted ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-200 border-slate-300'}`}
                               >
                                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isGranted ? 'translate-x-6' : 'translate-x-0'}`}></div>
                               </button>
                            </div>
                         )
                      })}

                   </div>
                </div>
             ))}
          </div>
        </div>

      </div>

      {isAddingAdmin && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
               <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><ShieldAlert size={18} className="text-red-500"/> Add Admin</h3>
               <button onClick={() => setIsAddingAdmin(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><Plus size={24} className="rotate-45"/></button>
            </div>
            <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Full Name</label>
                 <input required type="text" placeholder="e.g. Jane Doe" value={newAdmin.name} onChange={e=>setNewAdmin({...newAdmin, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-black text-slate-800 transition-all placeholder:font-medium" />
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Work Email</label>
                 <input required type="email" placeholder="jane@baskaro.com" value={newAdmin.email} onChange={e=>setNewAdmin({...newAdmin, email: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-black text-slate-800 transition-all placeholder:font-medium" />
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Assign Role</label>
                 <select required value={newAdmin.role} onChange={e=>setNewAdmin({...newAdmin, role: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-black text-slate-700 bg-white cursor-pointer transition-all">
                    {rolesList.map(r => <option key={r} value={r}>{r}</option>)}
                 </select>
               </div>
               <div className="pt-4 flex justify-end gap-3 mt-2">
                 <button type="button" onClick={() => setIsAddingAdmin(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                 <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-black bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 transition flex items-center gap-1.5"><CheckCircle size={16}/> Grant Access</button>
               </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
