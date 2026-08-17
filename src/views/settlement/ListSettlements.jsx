import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../lib/axiosInstance';
import { Button } from '../../components/ui/button';
import Container from '@/components/ui/container';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import {
    RiCheckLine,
    RiCloseLine,
    RiEyeLine,
    RiMoneyDollarCircleLine,
    RiUserLine,
    RiCalendarLine,
    RiRefreshLine,
    RiSearchLine,
    RiWallet3Line,
    RiBankCardLine
} from 'react-icons/ri';
import Layout from 'src/layout';
import { useNavigate } from 'react-router-dom';

const ListSettlements = () => {
    const navigate = useNavigate();
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    
    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [monthFilter, setMonthFilter] = useState('');

    // Payment Form State
    const [payForm, setPayForm] = useState({
        amount: '',
        paymentMode: 'bank_transfer',
        utrReference: '',
        paymentDate: new Date().toISOString().split('T')[0],
        remarks: ''
    });

    const fetchSettlements = async (page = 1) => {
        try {
            setLoading(true);
            setRefreshing(true);
            let url = `/admin/settlements?page=${page}&limit=20`;
            if (statusFilter !== 'all') url += `&status=${statusFilter}`;
            if (monthFilter) url += `&month=${monthFilter}`;

            const response = await axiosInstance.get(url);
            if (response.data?.success) {
                setSettlements(response.data.data || []);
                setTotalItems(response.data.total || 0);
                setTotalPages(Math.ceil((response.data.total || 0) / 20));
            }
        } catch (error) {
            console.error('Error fetching settlements:', error);
            toast.error('Failed to fetch settlements');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSettlements(currentPage);
    }, [currentPage, statusFilter, monthFilter]);

    const handlePayClick = (period) => {
        setSelectedPeriod(period);
        setPayForm({
            ...payForm,
            amount: period.balanceDue
        });
        setShowPayModal(true);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post(`/admin/settlements/${selectedPeriod.id}/pay`, payForm);
            if (response.data?.success) {
                toast.success('Payment recorded successfully');
                setShowPayModal(false);
                fetchSettlements(currentPage);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record payment');
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            unpaid: 'bg-red-100 text-red-800 border-red-200',
            partially_paid: 'bg-amber-100 text-amber-800 border-amber-200',
            paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            carried_forward: 'bg-blue-100 text-blue-800 border-blue-200'
        };
        const labels = {
            unpaid: 'Unpaid',
            partially_paid: 'Partial',
            paid: 'Settled',
            carried_forward: 'C/F'
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${config[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <Layout title="Brand Settlements" active="admin-settlement-list">
            <div className="min-h-screen bg-slate-50 p-6">
                <Container>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Brand Settlements</h1>
                            <p className="text-gray-500">Track and manage monthly payments to brands</p>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={() => fetchSettlements(currentPage)} variant="outline" className="flex items-center gap-2">
                                <RiRefreshLine className={refreshing ? 'animate-spin' : ''} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <RiSearchLine className="text-gray-400" />
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border-none focus:ring-0 text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="unpaid">Unpaid</option>
                                <option value="partially_paid">Partially Paid</option>
                                <option value="paid">Settled</option>
                            </select>
                        </div>
                        <div className="h-6 w-px bg-gray-200"></div>
                        <input 
                            type="month" 
                            value={monthFilter} 
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="border-none focus:ring-0 text-sm"
                        />
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="font-semibold px-6 py-4">Brand</TableHead>
                                    <TableHead className="font-semibold px-6 py-4">Period</TableHead>
                                    <TableHead className="font-semibold px-6 py-4 text-right">Net Payable</TableHead>
                                    <TableHead className="font-semibold px-6 py-4 text-right">Paid</TableHead>
                                    <TableHead className="font-semibold px-6 py-4 text-right text-red-600">Balance</TableHead>
                                    <TableHead className="font-semibold px-6 py-4 text-center">Status</TableHead>
                                    <TableHead className="font-semibold px-6 py-4 text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && settlements.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-10">Loading...</TableCell></TableRow>
                                ) : settlements.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-10">No records found</TableCell></TableRow>
                                ) : (
                                    settlements.map((s) => (
                                        <TableRow key={s.id} className="hover:bg-gray-50 transition-colors">
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                                                        {s.brandName?.charAt(0) || 'B'}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{s.brandName}</div>
                                                        <div className="text-xs text-gray-500">{s.brandID}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 font-medium text-gray-700">
                                                {s.settlementMonth}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right font-bold text-gray-900">
                                                ₹{Number(s.netPayable).toLocaleString('en-IN')}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right text-emerald-600 font-medium">
                                                ₹{Number(s.amountPaid).toLocaleString('en-IN')}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right text-red-600 font-bold">
                                                ₹{Number(s.balanceDue).toLocaleString('en-IN')}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-center">
                                                {getStatusBadge(s.status)}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={() => navigate(`/admin/settlements/${s.brandID}/${s.settlementMonth}`)}
                                                        className="h-8 px-2"
                                                    >
                                                        <RiEyeLine />
                                                    </Button>
                                                    {s.status !== 'paid' && (
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handlePayClick(s)}
                                                            className="h-8 px-2 bg-emerald-600 hover:bg-emerald-700"
                                                        >
                                                            <RiWallet3Line />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center gap-2">
                            <Button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</Button>
                            <span className="flex items-center px-4 font-medium">Page {currentPage} of {totalPages}</span>
                            <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
                        </div>
                    )}
                </Container>

                {/* Pay Modal */}
                {showPayModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                    <RiBankCardLine /> Record Payment
                                </h3>
                                <button onClick={() => setShowPayModal(false)} className="text-white/80 hover:text-white"><RiCloseLine size={24} /></button>
                            </div>
                            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Brand</label>
                                    <div className="bg-gray-100 px-3 py-2 rounded-lg text-gray-600 font-medium">{selectedPeriod?.brandName} ({selectedPeriod?.settlementMonth})</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₹)</label>
                                        <input 
                                            type="number" 
                                            required 
                                            value={payForm.amount} 
                                            onChange={e => setPayForm({...payForm, amount: e.target.value})}
                                            className="w-full border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                                        <input 
                                            type="date" 
                                            required 
                                            value={payForm.paymentDate}
                                            onChange={e => setPayForm({...payForm, paymentDate: e.target.value})}
                                            className="w-full border-gray-200 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Mode</label>
                                    <select 
                                        className="w-full border-gray-200 rounded-lg"
                                        value={payForm.paymentMode}
                                        onChange={e => setPayForm({...payForm, paymentMode: e.target.value})}
                                    >
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="upi">UPI</option>
                                        <option value="neft">NEFT</option>
                                        <option value="rtgs">RTGS</option>
                                        <option value="cheque">Cheque</option>
                                        <option value="adjustment">Adjustment</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">UTR / Reference</label>
                                    <input 
                                        type="text" 
                                        value={payForm.utrReference}
                                        onChange={e => setPayForm({...payForm, utrReference: e.target.value})}
                                        className="w-full border-gray-200 rounded-lg font-mono text-sm"
                                        placeholder="Optional"
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 mt-4">
                                    Confirm Payment
                                </Button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ListSettlements;
