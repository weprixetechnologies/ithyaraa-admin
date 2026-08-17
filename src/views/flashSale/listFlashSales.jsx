import React, { useEffect, useState } from 'react';
import Layout from '../../layout';
import Container from '../../components/ui/container';
import { listFlashSales } from '../../lib/api/flashSaleApi';
import { useNavigate } from 'react-router-dom';
import { 
    MdEdit, MdAdd, MdFlashOn, MdAccessTime, MdLocalOffer, MdCalendarToday, MdMoreHoriz, MdSearch
} from "react-icons/md";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ListFlashSales() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { success, data } = await listFlashSales();
        if (success) setRows(data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ended':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredRows = rows.filter(row => 
    row.name?.toLowerCase().includes(search.toLowerCase()) || 
    row.saleID?.toString().includes(search)
  );

  return (
    <Layout title={'Flash Sales Management'} active={'admin-flash-sale-list'}>
      {/* Registry Header */}
      <Container containerclass="bg-white border-b border-gray-200 py-6 mb-0 rounded-none shadow-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MdFlashOn className="text-amber-500" />
                    Flash Sale Registry
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Manage limited-time promotional windows and campaign visibility.</p>
              </div>
              <button
                onClick={() => navigate('/flash-sale/add')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-all shadow-sm"
              >
                <MdAdd size={20} />
                Register New Campaign
              </button>
          </div>
      </Container>

      {/* Control Bar */}
      <Container containerclass="bg-gray-50/50 border-b border-gray-200 py-4 mb-0 rounded-none shadow-none">
          <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                  <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                      className="w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                      placeholder="Search campaign name or ID..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                  />
              </div>
              <div className="flex gap-4">
                  <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Status</p>
                      <div className="flex gap-3 mt-1">
                          <span className="text-xs font-semibold text-emerald-600">Active: {rows.filter(r => r.status === 'active').length}</span>
                          <span className="text-xs font-semibold text-blue-600">Upcoming: {rows.filter(r => r.status === 'upcoming').length}</span>
                      </div>
                  </div>
              </div>
          </div>
      </Container>

      {/* Table Section */}
      <Container containerclass="p-0 border-none rounded-none shadow-none">
          <Table className="bg-white">
              <TableHeader className="bg-gray-50">
                  <TableRow>
                      <TableHead className="w-[100px] font-bold text-gray-600 text-xs uppercase tracking-wider">SALE ID</TableHead>
                      <TableHead className="font-bold text-gray-600 text-xs uppercase tracking-wider">CAMPAIGN NAME</TableHead>
                      <TableHead className="text-center font-bold text-gray-600 text-xs uppercase tracking-wider">OFFER VALUE</TableHead>
                      <TableHead className="text-center font-bold text-gray-600 text-xs uppercase tracking-wider">START DATE</TableHead>
                      <TableHead className="text-center font-bold text-gray-600 text-xs uppercase tracking-wider">END DATE</TableHead>
                      <TableHead className="text-center font-bold text-gray-600 text-xs uppercase tracking-wider">STATUS</TableHead>
                      <TableHead className="text-right font-bold text-gray-600 text-xs uppercase tracking-wider pr-6">MANAGEMENT</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {loading ? (
                      <TableRow>
                          <TableCell colSpan={7} className="py-24 text-center">
                              <div className="flex flex-col items-center gap-2">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                  <span className="text-sm text-gray-500 italic font-medium tracking-wide">Syncing campaign registry...</span>
                              </div>
                          </TableCell>
                      </TableRow>
                  ) : filteredRows.length === 0 ? (
                      <TableRow>
                          <TableCell colSpan={7} className="py-24 text-center">
                              <div className="flex flex-col items-center gap-2 opacity-60">
                                  <MdFlashOn size={48} className="text-gray-300" />
                                  <p className="text-gray-500 font-medium">No campaigns found matching your criteria.</p>
                              </div>
                          </TableCell>
                      </TableRow>
                  ) : (
                      filteredRows.map((row) => (
                          <TableRow key={row.saleID} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100 group">
                              <TableCell className="font-mono text-xs text-gray-400 align-middle">#{row.saleID}</TableCell>
                              <TableCell className="align-middle">
                                  <div className="flex flex-col">
                                      <span className="font-bold text-gray-900 text-sm tracking-tight">{row.name || 'Untitled Campaign'}</span>
                                      <span className="text-[10px] text-gray-400 uppercase mt-0.5 font-semibold">{row.itemCount || 0} Products Included</span>
                                  </div>
                              </TableCell>
                              <TableCell className="text-center align-middle">
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-100 font-bold text-xs">
                                      <MdLocalOffer size={12} />
                                      {row.discountType === 'percentage' ? `${row.discountValue}%` : `₹${row.discountValue}`} OFF
                                  </div>
                              </TableCell>
                              <TableCell className="text-center align-middle whitespace-nowrap">
                                  <div className="flex flex-col">
                                      <span className="text-xs font-semibold text-gray-700">{formatDate(row.startTime)}</span>
                                      <span className="text-[10px] text-gray-400 font-medium">{formatTime(row.startTime)}</span>
                                  </div>
                              </TableCell>
                              <TableCell className="text-center align-middle whitespace-nowrap">
                                  <div className="flex flex-col">
                                      <span className="text-xs font-semibold text-gray-700">{formatDate(row.endTime)}</span>
                                      <span className="text-[10px] text-gray-400 font-medium">{formatTime(row.endTime)}</span>
                                  </div>
                              </TableCell>
                              <TableCell className="text-center align-middle">
                                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border tracking-wider ${getStatusStyles(row.status)}`}>
                                      {row.status || 'inactive'}
                                  </span>
                              </TableCell>
                              <TableCell className="text-right pr-6 align-middle">
                                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                      <button 
                                          onClick={() => navigate(`/flash-sale/edit/${row.saleID}`)}
                                          className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-white border hover:border-blue-200 rounded transition-all"
                                          title="Modify Campaign"
                                      >
                                          <MdEdit size={16} />
                                      </button>
                                      <button 
                                          className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-white border rounded transition-all"
                                      >
                                          <MdMoreHoriz size={16} />
                                      </button>
                                  </div>
                              </TableCell>
                          </TableRow>
                      ))
                  )}
              </TableBody>
          </Table>
      </Container>
    </Layout>
  );
}
