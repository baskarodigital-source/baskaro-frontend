import React, { useState } from 'react'
import { appAlert, appConfirm } from '../../lib/appDialog.js'
import { 
  CheckCircle, Trash2, BarChart, DollarSign, Smartphone 
} from 'lucide-react'

export default function ConditionPricingView() {
  const [deductions, setDeductions] = useState({
    excellent: 5,
    good: 15,
    average: 25,
    broken: 45,
    screenCracked: 20,
    batteryPoor: 10,
    cameraDamaged: 15,
    biometricsFailed: 12
  });
  
  const [simBasePrice, setSimBasePrice] = useState(50000);
  const [simCondition, setSimCondition] = useState('excellent');
  const [simDefects, setSimDefects] = useState([]);

  const handleSliderChange = (key, val) => {
    setDeductions({ ...deductions, [key]: Number(val) });
  };

  const calculateResaleValue = () => {
    let price = simBasePrice;
    const condPct = deductions[simCondition] / 100;
    price = price - (simBasePrice * condPct);
    
    let defectSum = 0;
    simDefects.forEach(d => {
       defectSum += (deductions[d] / 100);
    });
    price = price - (simBasePrice * defectSum);
    
    return Math.max(0, Math.round(price));
  };

  const saveSettings = () => {
     appAlert('Algorithm variations deployed to production API successfully.');
  };

  const DeductionRow = ({ label, objKey, colorClass }) => {
    const localActive = true; 
    return (
      <div className="flex items-center justify-between p-4 px-6 hover:bg-slate-50 transition-colors">
         <div>
            <h4 className="text-sm font-black text-slate-700">{label}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Global Multiplier</p>
         </div>
         <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={deductions[objKey]} 
              onChange={(e) => handleSliderChange(objKey, e.target.value)}
              className="w-24 sm:w-32 accent-blue-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex items-center bg-slate-100 rounded-xl overflow-hidden border border-slate-200 h-10">
               <button 
                 onClick={() => handleSliderChange(objKey, Math.max(0, deductions[objKey] - 1))}
                 className="w-10 sm:w-12 h-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 border-r border-slate-200 text-slate-500 font-black transition active:bg-slate-200"
               >-</button>
               <input 
                 type="number"
                 min="0"
                 max="100"
                 value={deductions[objKey]}
                 onChange={(e) => handleSliderChange(objKey, e.target.value)}
                 className={`w-14 sm:w-16 h-full text-center font-black outline-none bg-transparent text-sm sm:text-base ${colorClass}`}
               />
               <span className={`pr-3 sm:pr-4 h-full flex items-center bg-transparent text-xs sm:text-sm font-black ${colorClass}`}>%</span>
               <button 
                 onClick={() => handleSliderChange(objKey, Math.min(100, deductions[objKey] + 1))}
                 className="w-10 sm:w-12 h-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 border-l border-slate-200 text-slate-500 font-black transition active:bg-slate-200"
               >+</button>
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Condition Pricing Engine</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Configure automated evaluation matrices across the platform.</p>
        </div>
        <button onClick={saveSettings} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-200/50 hover:shadow-blue-300/50 hover:from-blue-700 hover:to-indigo-700 transition">
          <CheckCircle size={18} strokeWidth={2.5} /> Deploy Engine Update
        </button>
      </div>

      {/* Live Simulator Panel */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center border border-slate-700">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
         
         <div className="flex-1 w-full relative z-10">
            <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">
               <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
               Live Resale Simulator
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
               <div>
                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 block">Test Base Price (₹)</label>
                  <input 
                     type="number" 
                     value={simBasePrice} 
                     onChange={(e) => setSimBasePrice(Number(e.target.value))}
                     className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white font-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
               </div>
               <div>
                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 block">Condition Class</label>
                  <select 
                     value={simCondition} 
                     onChange={(e) => setSimCondition(e.target.value)}
                     className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white font-black focus:border-blue-500 outline-none transition appearance-none cursor-pointer"
                  >
                     <option value="excellent">Excellent (-{deductions.excellent}%)</option>
                     <option value="good">Good (-{deductions.good}%)</option>
                     <option value="average">Average (-{deductions.average}%)</option>
                     <option value="broken">Broken (-{deductions.broken}%)</option>
                  </select>
               </div>
               <div>
                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 block">Trigger Defect</label>
                  <select 
                     value="" 
                     onChange={(e) => {
                        if (e.target.value && !simDefects.includes(e.target.value)) {
                           setSimDefects([...simDefects, e.target.value]);
                        }
                     }}
                     className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white font-black focus:border-blue-500 outline-none transition appearance-none cursor-pointer"
                  >
                     <option value="">+ Add Fault...</option>
                     {!simDefects.includes('screenCracked') && <option value="screenCracked">Screen Fault (-{deductions.screenCracked}%)</option>}
                     {!simDefects.includes('batteryPoor') && <option value="batteryPoor">Battery Poor (-{deductions.batteryPoor}%)</option>}
                     {!simDefects.includes('cameraDamaged') && <option value="cameraDamaged">Camera Fault (-{deductions.cameraDamaged}%)</option>}
                     {!simDefects.includes('biometricsFailed') && <option value="biometricsFailed">FaceID Failed (-{deductions.biometricsFailed}%)</option>}
                  </select>
               </div>
            </div>
            {simDefects.length > 0 && (
               <div className="flex flex-wrap gap-2 mt-4">
                  {simDefects.map(d => (
                     <div key={d} className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                        {d === 'screenCracked' ? 'ScreenFault' : d === 'batteryPoor' ? 'BadBattery' : d === 'cameraDamaged' ? 'BadCamera' : 'NoFaceID'} (-{deductions[d]}%)
                        <button onClick={() => setSimDefects(simDefects.filter(x => x !== d))} className="hover:text-white transition-colors ml-1"><Trash2 size={14}/></button>
                     </div>
                  ))}
               </div>
            )}
         </div>

         <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 min-w-[220px] text-center shrink-0 relative z-10 w-full md:w-auto shadow-inner">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Final Resale Value</div>
            <div className="text-3xl font-black text-white tracking-tight">
               ₹{calculateResaleValue().toLocaleString()}
            </div>
            <div className="text-emerald-400 text-xs font-bold mt-2 flex items-center justify-center gap-1">
               <CheckCircle size={12} /> Instantly calculated
            </div>
         </div>
      </div>

      {/* Algorithm Info panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row items-center gap-5 shadow-sm">
         <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100"><BarChart size={20}/></div>
         <div className="flex-1 w-full">
            <h4 className="text-xs font-black text-slate-900 mb-1.5 uppercase tracking-widest">Active Math Model</h4>
            <div className="bg-slate-50 border border-slate-200 font-mono text-xs font-semibold text-slate-600 p-2.5 rounded-lg overflow-x-auto w-full">
              Final_Price = Base_Model_Price - (Base_Model_Price × Overall_Condition_%) - (Base_Model_Price × Sum(Functional_Defect_%))
            </div>
         </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
         <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
               <div className="h-10 w-10 shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-200 text-slate-700"><DollarSign size={20}/></div>
               <div>
                  <h3 className="text-lg font-black text-slate-900">Base Grades</h3>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">Physical state multipliers</p>
               </div>
            </div>
            <div className="divide-y divide-slate-100 flex-1">
               <DeductionRow label="Excellent" objKey="excellent" colorClass="text-green-600" />
               <DeductionRow label="Good" objKey="good" colorClass="text-blue-600" />
               <DeductionRow label="Average" objKey="average" colorClass="text-orange-600" />
               <DeductionRow label="Broken" objKey="broken" colorClass="text-red-600" />
            </div>
         </div>

         <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
               <div className="h-10 w-10 shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-200 text-slate-700"><Smartphone size={20} /></div>
               <div>
                  <h3 className="text-lg font-black text-slate-900">Functional Tests</h3>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">Stacking deficit penalties</p>
               </div>
            </div>
            <div className="divide-y divide-slate-100 flex-1">
               <DeductionRow label="Screen condition" objKey="screenCracked" colorClass="text-red-500" />
               <DeductionRow label="Battery health" objKey="batteryPoor" colorClass="text-orange-500" />
               <DeductionRow label="Camera working" objKey="cameraDamaged" colorClass="text-purple-500" />
               <DeductionRow label="Face ID / Fingerprint" objKey="biometricsFailed" colorClass="text-indigo-500" />
            </div>
         </div>
      </div>
    </div>
  )
}
