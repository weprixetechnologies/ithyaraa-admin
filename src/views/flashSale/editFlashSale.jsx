import React, { useEffect, useState } from 'react';
import Layout from '../../layout';
import Container from '../../components/ui/container';
import InputUi from '../../components/ui/inputui';
import { listFlashSaleItems, setFlashSaleItems, updateFlashSale, getFlashSaleDetail } from '../../lib/api/flashSaleApi';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    MdArrowBack, MdSave, MdAdd, MdDeleteOutline, MdFlashOn, MdInfoOutline, MdListAlt, MdSearch, MdClose
} from "react-icons/md";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'react-toastify';
import axiosInstance from '@/lib/axiosInstance';
import SelectProducts from '@/components/ui/selectProducts';

export default function EditFlashSale() {
  const { saleID } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', startTime: '', endTime: '', status: 'active', metadata: '' });
  const [items, setItems] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // For Inline search in rows (fallback)
  const [searchQueries, setSearchQueries] = useState({});
  const [searchResults, setSearchResults] = useState({});
  const [searchLoading, setSearchLoading] = useState({});

  const formatDateTimeForInput = (dateValue) => {
    if (!dateValue || dateValue === '') return '';
    let val = dateValue;
    if (typeof val === 'string') {
      if (val.includes(' ') && !val.includes('T') && !val.includes('Z')) {
        val = val.replace(' ', 'T') + 'Z';
      }
      else if (val.includes('T') && !val.includes('Z') && !val.includes('+') && !val.includes('-')) {
        val = val + 'Z';
      }
    }
    const date = new Date(val);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const meta = await getFlashSaleDetail(saleID);
        if (meta?.success && meta.data) {
          const m = meta.data;
          setForm({
            name: m.name || '',
            startTime: formatDateTimeForInput(m.startTime || m.start_time),
            endTime: formatDateTimeForInput(m.endTime || m.end_time),
            status: m.status || 'active',
            metadata: m.metadata ? (typeof m.metadata === 'string' ? m.metadata : JSON.stringify(m.metadata)) : ''
          });
        }
        const resp = await listFlashSaleItems(saleID);
        if (resp?.success) {
          const rows = (resp.data || []).map(r => ({
            productID: r.productID,
            discountType: (r.discountType || 'percentage'),
            discountValue: Number(r.discountValue || 0)
          }));
          setItems(rows);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [saleID]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const convertToMySQL = (dateStr) => {
        if (!dateStr || dateStr === '') return null;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      };

      const metaPayload = {
        ...form,
        startTime: convertToMySQL(form.startTime),
        endTime: convertToMySQL(form.endTime)
      };

      const itemPayload = items
        .filter(it => it.productID)
        .map(it => ({ 
            productID: it.productID.trim(), 
            discountType: it.discountType || 'percentage', 
            discountValue: Number(it.discountValue || 0) 
        }));

      const metaRes = await updateFlashSale(saleID, metaPayload);
      const itemsRes = await setFlashSaleItems(saleID, { items: itemPayload });

      if (metaRes.success && itemsRes.success) {
          toast.success("Campaign updated successfully");
      } else {
          toast.info("Update completed with partial synchronization");
      }
    } catch (e) {
        toast.error("Failed to update campaign state");
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (idx, key, value) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: value } : it));
  };

  const handleProductSearch = async (idx, query) => {
      setSearchQueries(prev => ({ ...prev, [idx]: query }));
      if (!query || query.length < 2) {
          setSearchResults(prev => ({ ...prev, [idx]: [] }));
          return;
      }

      setSearchLoading(prev => ({ ...prev, [idx]: true }));
      try {
          const { data } = await axiosInstance.get(`/api/products/search?q=${query}`);
          if (data.success) {
              setSearchResults(prev => ({ ...prev, [idx]: data.data || [] }));
          }
      } catch (e) {
          console.error("Row search failed", e);
      } finally {
          setSearchLoading(prev => ({ ...prev, [idx]: false }));
      }
  };

  const selectProduct = (idx, product) => {
      updateItem(idx, 'productID', product.productID);
      setSearchQueries(prev => ({ ...prev, [idx]: product.name }));
      setSearchResults(prev => ({ ...prev, [idx]: [] }));
  };

  const addRow = () => setItems(prev => [...prev, { productID: '', discountType: 'percentage', discountValue: 0 }]);

  const handleProductToggle = (productID) => {
      setItems(prev => {
          const exists = prev.some(it => it.productID === productID);
          if (exists) {
              return prev.filter(it => it.productID !== productID);
          } else {
              return [...prev, { productID, discountType: 'percentage', discountValue: 0 }];
          }
      });
  };

  const removeRow = (idx) => {
      setItems(prev => prev.filter((_, i) => i !== idx));
  };

  if (loading) {
      return (
          <Layout title="Initializing Editor..." active={'admin-flash-sale-list'}>
              <div className="flex flex-col items-center justify-center h-96 opacity-40">
                  <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Campaign Schema</span>
              </div>
          </Layout>
      );
  }

  return (
    <Layout title={`Campaign Editor: ${saleID}`} active={'admin-flash-sale-list'}>
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-100 py-6 px-4 md:px-8 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                  <button 
                    onClick={() => navigate('/flash-sale/list')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                  >
                    <MdArrowBack size={24} />
                  </button>
                  <div>
                      <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
                        <MdFlashOn className="text-amber-500" />
                        Campaign Details
                      </h1>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400 font-mono italic">REGISTRY ID: {saleID}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${form.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {form.status}
                        </span>
                      </div>
                  </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-6 py-2.5 rounded-lg text-sm font-bold transition-all"
                >
                    <MdSearch size={20} />
                    Search & Add Products
                </button>
                <button 
                    onClick={handleUpdate}
                    disabled={saving}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                    <MdSave size={18} />
                    {saving ? 'Syncing...' : 'Update Campaign'}
                </button>
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto py-10 px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar: Activation Parameters */}
              <div className="lg:col-span-1 space-y-6">
                  <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
                          <MdInfoOutline size={18} className="text-blue-500" />
                          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">Base Config</h3>
                      </div>
                      <div className="space-y-5">
                          <InputUi 
                            label="Campaign Label" 
                            value={form.name} 
                            datafunction={e => set('name', e.target.value)} 
                            placeholder="e.g., Seasonal Flash"
                          />
                          <InputUi 
                            label="Starts" 
                            type="datetime-local" 
                            value={form.startTime} 
                            datafunction={e => set('startTime', e.target.value)} 
                          />
                          <InputUi 
                            label="Ends" 
                            type="datetime-local" 
                            value={form.endTime} 
                            datafunction={e => set('endTime', e.target.value)} 
                          />
                          
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Lifecycle</label>
                            <Select value={form.status} onValueChange={v => set('status', v)}>
                                <SelectTrigger className="w-full bg-white border-gray-200 text-xs py-5">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active (Visible)</SelectItem>
                                    <SelectItem value="inactive">Inactive (Hidden)</SelectItem>
                                </SelectContent>
                            </Select>
                          </div>
                      </div>
                  </div>

                  <div className="p-6 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Technical Metadata</h4>
                      <textarea 
                        className="w-full bg-transparent text-[10px] font-mono p-2 border-0 focus:ring-0 outline-none resize-none text-gray-500"
                        rows={3}
                        placeholder="Optional configuration JSON..."
                        value={form.metadata}
                        onChange={e => set('metadata', e.target.value)}
                      />
                  </div>
              </div>

              {/* Main Content: Registry Inclusions */}
              <div className="lg:col-span-3">
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                          <div className="flex items-center gap-2">
                              <MdListAlt size={20} className="text-blue-500" />
                              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">Global Product Registry</h3>
                              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-bold rounded-full">
                                {items.length} ACTIVE
                              </span>
                          </div>
                          <button 
                            onClick={addRow}
                            className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <MdAdd size={20} />
                            Add Empty Row
                          </button>
                      </div>

                      <div className="overflow-x-auto">
                          <table className="w-full">
                              <thead className="bg-gray-50/50">
                                  <tr>
                                      <th className="text-left py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product Information</th>
                                      <th className="text-left py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Offer Scheme</th>
                                      <th className="text-center py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discount</th>
                                      <th className="text-right py-4 px-6"></th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                  {items.length === 0 ? (
                                      <tr>
                                          <td colSpan={4} className="py-32 text-center">
                                              <div className="flex flex-col items-center gap-3 opacity-20">
                                                  <MdListAlt size={64} />
                                                  <p className="text-sm font-bold uppercase tracking-tighter italic">No campaigns items listed yet.</p>
                                              </div>
                                          </td>
                                      </tr>
                                  ) : items.map((it, idx) => (
                                      <tr key={idx} className="hover:bg-blue-50/10 transition-colors group">
                                          <td className="py-5 px-6 relative w-1/2">
                                              <div className="relative">
                                                  <input 
                                                    className="w-full bg-white border border-gray-100 rounded-lg px-4 py-3 text-xs focus:border-blue-300 outline-none transition-all shadow-sm group-hover:border-gray-200"
                                                    value={searchQueries[idx] !== undefined ? searchQueries[idx] : it.productID} 
                                                    onChange={e => handleProductSearch(idx, e.target.value)} 
                                                    placeholder="Search Name or Paste ID..." 
                                                  />
                                                  {searchLoading[idx] && (
                                                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                          <div className="animate-spin h-3 w-3 border-b-2 border-blue-500 rounded-full"></div>
                                                      </div>
                                                  )}
                                                  
                                                  {searchResults[idx] && searchResults[idx].length > 0 && (
                                                      <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-40 max-h-56 overflow-y-auto p-2">
                                                          {searchResults[idx].map(p => (
                                                              <div 
                                                                key={p.productID}
                                                                onClick={() => selectProduct(idx, p)}
                                                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer rounded-lg flex flex-col gap-0.5"
                                                              >
                                                                  <p className="text-xs font-bold text-gray-900">{p.name}</p>
                                                                  <p className="text-[10px] text-gray-400 font-mono italic">#{p.productID}</p>
                                                              </div>
                                                          ))}
                                                      </div>
                                                  )}
                                              </div>
                                          </td>
                                          <td className="py-5 px-6 w-1/4">
                                              <Select value={it.discountType} onValueChange={v => updateItem(idx, 'discountType', v)}>
                                                  <SelectTrigger className="w-full h-10 px-3 text-[11px] bg-white border-gray-100 group-hover:border-gray-200">
                                                      <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                      <SelectItem value="fixed">Fixed (₹)</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </td>
                                          <td className="py-5 px-6 w-1/6">
                                              <div className="relative">
                                                  <input 
                                                    type="number" 
                                                    className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2.5 text-center text-xs font-bold focus:border-blue-300 outline-none transition-all group-hover:border-gray-200 shadow-sm"
                                                    value={it.discountValue} 
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={e => updateItem(idx, 'discountValue', e.target.value)} 
                                                  />
                                              </div>
                                          </td>
                                          <td className="py-5 px-6 text-right w-12">
                                              <button 
                                                onClick={() => removeRow(idx)}
                                                className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                              >
                                                <MdDeleteOutline size={22} />
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Full Registry Browser Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
                onClick={() => setIsModalOpen(false)}
              ></div>
              
              <div className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden border border-white/20">
                  <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 tracking-tighter">
                             <MdSearch className="text-blue-600" size={32} />
                             Product Discovery Registry
                        </h2>
                        <p className="text-sm text-gray-400 mt-1 italic font-medium">Search across all products using Name, ID, or Category.</p>
                      </div>
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all hover:rotate-90"
                      >
                        <MdClose size={28} className="text-gray-400" />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto bg-white p-2">
                      <SelectProducts 
                        onProductToggle={handleProductToggle}
                        initialSelected={items.map(it => it.productID)}
                      />
                  </div>
                  
                  <div className="p-8 border-t border-gray-50 bg-white flex flex-col sm:flex-row justify-between items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Staged Participation</span>
                        <span className="text-lg font-black text-blue-600 font-mono tracking-tighter italic">
                            {items.length} PRODUCTS SELECTED
                        </span>
                      </div>
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-12 py-4 rounded-2xl text-base font-bold shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        Commit Changes
                      </button>
                  </div>
              </div>
          </div>
      )}
    </Layout>
  );
}
