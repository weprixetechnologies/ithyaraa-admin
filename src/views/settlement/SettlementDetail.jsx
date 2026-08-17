import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../../lib/axiosInstance';
import { Button } from '../../components/ui/button';
import Container from '@/components/ui/container';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import {
    RiArrowLeftLine,
    RiMoneyDollarCircleLine,
    RiRefund2Line,
    RiCheckLine,
    RiTimeLine,
    RiHistoryLine,
    RiFileList3Line,
    RiInformationLine
} from 'react-icons/ri';
import Layout from 'src/layout';

const SettlementDetail = () => {
    const { brandID, month } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('statement'); // 'statement' or 'payments'

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/admin/settlements/${brandID}/${month}`);
            if (response.data?.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Error fetching settlement detail:', error);
            toast.error('Failed to fetch details');
            navigate('/admin/settlements');
        } finally {
            setLoading(false);
        }
    };

    const handleManualClear = async (ledgerID) => {
        if (!window.confirm('Are you sure you want to manually clear the return window for this item? This will credit the brand immediately.')) return;
        try {
            const response = await axiosInstance.post(`/admin/settlements/ledger/${ledgerID}/clear-window`);
            if (response.data?.success) {
                toast.success('Return window cleared manually');
                fetchDetail();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to clear window');
        }
    };

    const handleManualCheck = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/admin/settlements/manual-check');
            if (response.data?.success) {
                toast.success(response.data.message);
                fetchDetail();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to run manual check');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [brandID, month]);

    if (loading) return <Layout title="Loading..."><div className="p-10 text-center">Loading settlement details...</div></Layout>;
    if (!data) return <Layout title="Error"><div className="p-10 text-center text-red-600">Failed to load data</div></Layout>;

    const { period, statement, payments } = data;

    const getEventBadge = (event) => {
        const config = {
            order_placed: 'bg-blue-50 text-blue-700 border-blue-100',
            order_delivered: 'bg-indigo-50 text-indigo-700 border-indigo-100',
            return_window_cleared: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            shipping_credit: 'bg-cyan-50 text-cyan-700 border-cyan-100',
            returned: 'bg-red-50 text-red-700 border-red-100',
            replacement_original: 'bg-amber-50 text-amber-700 border-amber-100',
            replacement_item: 'bg-gray-50 text-gray-700 border-gray-100'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${config[event] || 'bg-gray-50'}`}>
                {event.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <Layout title={`Settlement: ${period.brandName} - ${month}`} active="admin-settlement-list">
            <div className="min-h-screen bg-slate-50 p-6">
                <Container>
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Button variant="outline" size="sm" onClick={() => navigate('/admin/settlements')} className="rounded-full w-10 h-10 p-0">
                            <RiArrowLeftLine size={20} />
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold font-heading text-gray-900">{period.brandName}</h1>
                            <p className="text-gray-500 font-medium">Settlement Statement for <span className="text-gray-900 font-bold">{month}</span></p>
                        </div>
                        <Button 
                            variant="primary" 
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            onClick={handleManualCheck}
                            disabled={loading}
                        >
                            <RiCheckLine className="mr-2" />
                            RUN CHECK MANUALLY
                        </Button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-3 bg-blue-100 rounded-xl text-blue-600"><RiMoneyDollarCircleLine size={24} /></div>
                                <span className="text-gray-500 font-semibold text-sm">Total Credit</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">₹{Number(period.totalCredits).toLocaleString('en-IN')}</div>
                            <p className="text-xs text-gray-400 mt-1">Earnings from orders</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-3 bg-red-100 rounded-xl text-red-600"><RiRefund2Line size={24} /></div>
                                <span className="text-gray-500 font-semibold text-sm">Total Debit</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">₹{Number(period.totalDebits).toLocaleString('en-IN')}</div>
                            <p className="text-xs text-gray-400 mt-1">Returns & cancellations</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ring-2 ring-emerald-500 ring-offset-2">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600"><RiCheckLine size={24} /></div>
                                <span className="text-emerald-700 font-bold text-sm uppercase tracking-wider">Net Payable</span>
                            </div>
                            <div className="text-3xl font-black text-emerald-700">₹{Number(period.netPayable).toLocaleString('en-IN')}</div>
                            <p className="text-xs text-emerald-600 font-medium mt-1">Final amount for {month}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-3 bg-amber-100 rounded-xl text-amber-600"><RiTimeLine size={24} /></div>
                                <span className="text-gray-500 font-semibold text-sm">Amount Paid</span>
                            </div>
                            <div className="text-2xl font-bold text-amber-600">₹{Number(period.amountPaid).toLocaleString('en-IN')}</div>
                            <div className="text-xs font-bold text-red-500 mt-1">Balance: ₹{Number(period.balanceDue).toLocaleString('en-IN')}</div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex border-b">
                            <button 
                                onClick={() => setActiveTab('statement')}
                                className={`px-8 py-4 text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'statement' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <RiFileList3Line /> Statement Ledger
                            </button>
                            <button 
                                onClick={() => setActiveTab('payments')}
                                className={`px-8 py-4 text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'payments' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <RiHistoryLine /> Payment History
                            </button>
                        </div>

                        <div className="p-0">
                            {activeTab === 'statement' ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/80">
                                            <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-500">Date</TableHead>
                                            <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-500">Order Detail</TableHead>
                                            <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-500 text-center">Event</TableHead>
                                            <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-500 text-right">Amount</TableHead>
                                            <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-500">Effect</TableHead>
                                            <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-500">Notes</TableHead>
                                            <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-500 text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {statement.length === 0 ? (
                                            <TableRow><TableCell colSpan={6} className="text-center py-20 text-gray-400 font-medium">No ledger entries found for this period</TableCell></TableRow>
                                        ) : (
                                            statement.map((row) => (
                                                <TableRow key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <TableCell className="px-6 py-4 text-xs font-medium text-gray-600 whitespace-nowrap">
                                                        {new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4">
                                                        <div className="text-xs font-bold text-gray-900 underline decoration-blue-200 cursor-pointer hover:text-blue-600" onClick={() => navigate(`/admin/order/detail/${row.orderID}`)}>
                                                            #{row.orderID}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 font-mono">Item ID: {row.orderItemID}</div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 text-center">
                                                        {getEventBadge(row.event)}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 text-right font-mono font-bold text-gray-900">
                                                        ₹{Number(row.effectAmount || 0).toLocaleString('en-IN')}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                            row.effect === 'credit' ? 'text-emerald-600 bg-emerald-50' : 
                                                            row.effect === 'debit' ? 'text-red-600 bg-red-50' : 
                                                            row.effect === 'hold' ? 'text-amber-600 bg-amber-50' : 
                                                            'text-gray-400 bg-gray-50'
                                                        }`}>
                                                            {row.effect}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 text-xs text-gray-500 font-medium italic">
                                                        {row.notes || '-'}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 text-center">
                                                        {row.effect === 'hold' && 
                                                         (row.event === 'order_delivered' || row.event === 'order_placed' || row.event === 'replacement_original') && 
                                                         !statement.some(s => s.orderItemID === row.orderItemID && s.event === 'return_window_cleared') && (
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="h-7 px-2 text-[10px] border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                                                                onClick={() => handleManualClear(row.id)}
                                                            >
                                                                Clear Window
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/80">
                                            <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-500">Payment Date</TableHead>
                                            <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-500 text-right">Amount</TableHead>
                                            <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-500">Mode</TableHead>
                                            <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-500">UTR / Ref</TableHead>
                                            <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-500">Recorded By</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.length === 0 ? (
                                            <TableRow><TableCell colSpan={5} className="text-center py-20 text-gray-400 font-medium">No payment history found</TableCell></TableRow>
                                        ) : (
                                            payments.map((p) => (
                                                <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <TableCell className="px-6 py-4 text-xs font-bold text-gray-600">
                                                        {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 text-right font-mono font-black text-emerald-700">
                                                        ₹{Number(p.amount).toLocaleString('en-IN')}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 text-xs font-bold text-gray-700">
                                                        {p.paymentMode}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 text-xs font-mono text-gray-500">
                                                        {p.utrReference || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 text-[10px] text-gray-400">
                                                        {p.recordedBy}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </div>
                </Container>
            </div>
        </Layout>
    );
};

export default SettlementDetail;
