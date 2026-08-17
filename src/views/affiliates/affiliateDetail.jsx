import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from 'src/layout';
import Container from '@/components/ui/container';
import { getAffiliateByUid, getTransactionStatuses, updateTransactionStatus as updateTransactionStatusApi, createManualTransaction as createManualTransactionApi, updateCommissionPercentage as updateCommissionPercentageApi } from '@/lib/api/affiliatesApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { toast } from 'react-toastify';

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A');
const formatPrice = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;
// Display status: mPending -> pending, mCompleted -> completed, etc.
const displayStatus = (s) => {
    if (typeof s !== 'string' || !s) return s || '-';
    if (s.length > 1 && s[0] === 'm' && s[1] === s[1].toUpperCase()) {
        return s.slice(1).charAt(0).toLowerCase() + s.slice(2);
    }
    return s;
};

const AffiliateDetail = () => {
    const { uid } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [statuses, setStatuses] = useState([]);
    const [editingTxnId, setEditingTxnId] = useState(null);
    const [manualForm, setManualForm] = useState({ type: 'incoming', amount: '', reason: '' });
    const [submittingManual, setSubmittingManual] = useState(false);
    const [isEditingCommission, setIsEditingCommission] = useState(false);
    const [commissionValue, setCommissionValue] = useState('');
    const [submittingCommission, setSubmittingCommission] = useState(false);

    const fetchDetail = useCallback(async () => {
        if (!uid) return;
        const res = await getAffiliateByUid(uid);
        if (res.success) {
            setData(res.data);
            setCommissionValue(res.data.user.commissionPercentage || '');
        }
    }, [uid]);

    useEffect(() => {
        if (!uid) return;
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError('');
                const res = await getAffiliateByUid(uid);
                if (cancelled) return;
                if (res.success) {
                    setData(res.data);
                    setCommissionValue(res.data.user.commissionPercentage || '');
                }
                else setError(res.error || 'Failed to load');
            } catch (err) {
                if (!cancelled) setError(err.response?.data?.error || err.message || 'Failed to load');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [uid]);

    useEffect(() => {
        (async () => {
            try {
                const res = await getTransactionStatuses();
                if (res.success && Array.isArray(res.data)) setStatuses(res.data);
            } catch (_) { }
        })();
    }, []);

    if (loading && !data) {
        return (
            <Layout active="admin-affiliates-list" title="Affiliate Details">
                <Container containerclass="bg-transparent">
                    <div className="flex justify-center items-center min-h-[300px]">
                        <DotLottieReact
                            src="https://lottie.host/15a4b106-bbe8-40d8-bb4e-834fb23fceae/I9HKWeP6l2.lottie"
                            loop
                            autoplay
                            style={{ height: '200px', width: 'auto' }}
                        />
                    </div>
                </Container>
            </Layout>
        );
    }

    if (error || !data?.user) {
        return (
            <Layout active="admin-affiliates-list" title="Affiliate Details">
                <Container containerclass="bg-transparent">
                    <p className="text-red-600">{error || 'User not found'}</p>
                    <button onClick={() => navigate('/affiliates/list')} className="mt-4 px-4 py-2 bg-gray-200 rounded">
                        Back to list
                    </button>
                </Container>
            </Layout>
        );
    }

    const { user, analytics, transactions, orders, payoutHistory, bankAccounts } = data;

    const handleStatusChange = async (txnID, newStatus) => {
        try {
            const res = await updateTransactionStatusApi(txnID, newStatus);
            if (res.success) {
                toast.success('Status updated');
                setEditingTxnId(null);
                fetchDetail();
            } else toast.error(res.error || 'Update failed');
        } catch (err) {
            toast.error(err.response?.data?.error || err.message || 'Update failed');
        }
    };

    const MANUAL_REASONS = [
        { value: 'Manual credit - goodwill', label: 'Manual credit - goodwill' },
        { value: 'Manual credit - adjustment', label: 'Manual credit - adjustment' },
        { value: 'Manual deduction - adjustment', label: 'Manual deduction - adjustment' },
        { value: 'Manual deduction - dispute', label: 'Manual deduction - dispute' },
        { value: 'Manual credit - referral bonus', label: 'Manual credit - referral bonus' },
    ];

    const handleCreateManual = async (e) => {
        e.preventDefault();
        const amt = Number(manualForm.amount);
        if (!amt || amt <= 0) {
            toast.error('Enter a valid amount');
            return;
        }
        setSubmittingManual(true);
        try {
            const res = await createManualTransactionApi({
                uid: user.uid,
                amount: amt,
                type: manualForm.type,
                comment: manualForm.reason || (manualForm.type === 'incoming' ? 'Manual credit by admin' : 'Manual deduction by admin'),
            });
            if (res.success) {
                toast.success('Transaction created');
                setManualForm({ type: 'incoming', amount: '', reason: '' });
                fetchDetail();
            } else toast.error(res.error || 'Failed');
        } catch (err) {
            toast.error(err.response?.data?.error || err.message || 'Failed');
        } finally {
            setSubmittingManual(false);
        }
    };

    const handleUpdateCommission = async () => {
        if (commissionValue === '') {
            toast.error('Enter a valid percentage');
            return;
        }
        setSubmittingCommission(true);
        try {
            const res = await updateCommissionPercentageApi(uid, commissionValue);
            if (res.success) {
                toast.success('Commission updated');
                setIsEditingCommission(false);
                fetchDetail();
            } else toast.error(res.error || 'Update failed');
        } catch (err) {
            toast.error(err.response?.data?.error || err.message || 'Update failed');
        } finally {
            setSubmittingCommission(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'orders', label: 'Affiliated Orders' },
        { id: 'commissions', label: 'Commissions' },
        { id: 'payouts', label: 'Payment History' },
        { id: 'banks', label: 'Bank Accounts' }
    ];

    return (
        <Layout active="admin-affiliates-list" title={`Affiliate: ${user.username || user.name || uid}`}>
            <Container containerclass="bg-transparent">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/affiliates/list')}
                        className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-secondary-text hover:bg-background"
                    >
                        ← Back to list
                    </button>
                </div>

                {/* User details card */}
                <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">User Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">UID</p>
                            <p className="font-medium">{user.uid}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Name</p>
                            <p className="font-medium">{user.username || user.name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Email</p>
                            <p className="font-medium truncate">{user.emailID || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Phone</p>
                            <p className="font-medium">{user.phonenumber || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Affiliate Status</p>
                            <p className="font-medium">
                                <span className={`px-2 py-1 rounded-full text-xs ${(user.affiliate || '').toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {user.affiliate || 'N/A'}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">Balance / Pending</p>
                            <p className="font-medium">{formatPrice(user.balance)} / {formatPrice(user.pendingPayment)}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Joined</p>
                            <p className="font-medium">{formatDate(user.createdOn)}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Commission %</p>
                            {isEditingCommission ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={commissionValue}
                                        onChange={(e) => setCommissionValue(e.target.value)}
                                        className="border rounded px-2 py-1 w-20 text-xs"
                                    />
                                    <button
                                        onClick={handleUpdateCommission}
                                        disabled={submittingCommission}
                                        className="text-blue-600 font-medium text-xs hover:underline"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingCommission(false);
                                            setCommissionValue(user.commissionPercentage || '');
                                        }}
                                        className="text-gray-500 text-xs hover:underline"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">{user.commissionPercentage != null ? `${user.commissionPercentage}%` : 'Default (10%/20%)'}</p>
                                    <button
                                        onClick={() => setIsEditingCommission(true)}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Edit commission"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Analytics cards (same as user dashboard) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl border shadow-sm p-4">
                        <p className="text-xs text-gray-500">Total Clicks</p>
                        <p className="text-2xl font-bold">{Number(analytics?.totalClicks || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-xl border shadow-sm p-4">
                        <p className="text-xs text-gray-500">Total Orders</p>
                        <p className="text-2xl font-bold">{Number(analytics?.totalOrders || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-xl border shadow-sm p-4">
                        <p className="text-xs text-gray-500">Total Earnings</p>
                        <p className="text-2xl font-bold">{formatPrice(analytics?.totalEarnings)}</p>
                    </div>
                    <div className="bg-white rounded-xl border shadow-sm p-4">
                        <p className="text-xs text-gray-500">Pending Earnings</p>
                        <p className="text-2xl font-bold">{formatPrice(analytics?.totalPendingEarnings)}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4 border-b">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`px-4 py-2 text-sm rounded-t ${activeTab === t.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-secondary-text hover:bg-gray-200'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div className="bg-white rounded-xl border shadow-sm p-6">
                        <p className="text-secondary-text">Referral link: <code className="bg-gray-100 px-2 py-1 rounded text-xs">https://ithyaraa.com/shop?referBy={user.uid}</code></p>
                        <p className="text-sm text-gray-500 mt-2">Use the tabs above to view Orders, Commissions, Payment History, and Bank Accounts.</p>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Buyer UID</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No affiliated orders</TableCell></TableRow>
                                ) : (
                                    orders.map((o) => (
                                        <TableRow key={o.orderID}>
                                            <TableCell className="font-medium">#{o.orderID}</TableCell>
                                            <TableCell>{o.buyerUID}</TableCell>
                                            <TableCell>{formatPrice(o.total)}</TableCell>
                                            <TableCell>{o.orderStatus || 'N/A'}</TableCell>
                                            <TableCell>{formatDate(o.createdAt)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        {data.ordersPagination?.total > 20 && (
                            <p className="p-3 text-sm text-gray-500">Showing first 20 of {data.ordersPagination.total} orders.</p>
                        )}
                    </div>
                )}

                {activeTab === 'commissions' && (
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-background">
                            <h3 className="text-sm font-medium mb-3">Create manual transaction</h3>
                            <form onSubmit={handleCreateManual} className="flex flex-wrap items-end gap-3">
                                <select
                                    value={manualForm.type}
                                    onChange={(e) => setManualForm((f) => ({ ...f, type: e.target.value }))}
                                    className="border rounded px-3 py-2 text-sm"
                                >
                                    <option value="incoming">Credit (increase)</option>
                                    <option value="outgoing">Deduction (decrease)</option>
                                </select>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    placeholder="Amount"
                                    value={manualForm.amount}
                                    onChange={(e) => setManualForm((f) => ({ ...f, amount: e.target.value }))}
                                    className="border rounded px-3 py-2 text-sm w-28"
                                />
                                <select
                                    value={manualForm.reason}
                                    onChange={(e) => setManualForm((f) => ({ ...f, reason: e.target.value }))}
                                    className="border rounded px-3 py-2 text-sm min-w-[200px]"
                                >
                                    <option value="">— Select reason —</option>
                                    {MANUAL_REASONS.map((r) => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                                <button type="submit" disabled={submittingManual} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">
                                    {submittingManual ? 'Creating…' : 'Create'}
                                </button>
                            </form>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No transactions</TableCell></TableRow>
                                ) : (
                                    transactions.map((t) => (
                                        <TableRow key={t.txnID}>
                                            <TableCell>{formatDate(t.createdOn)}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs ${t.type === 'incoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-foreground'}`}>
                                                    {t.type}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {editingTxnId === t.txnID && statuses.length > 0 ? (
                                                    <select
                                                        defaultValue={t.status}
                                                        onChange={(e) => handleStatusChange(t.txnID, e.target.value)}
                                                        onBlur={() => setEditingTxnId(null)}
                                                        className="border rounded px-2 py-1 text-xs"
                                                        autoFocus
                                                    >
                                                        {statuses.map((s) => (
                                                            <option key={s} value={s}>{displayStatus(s)}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span
                                                        className="px-2 py-1 rounded text-xs bg-gray-100 cursor-pointer"
                                                        onClick={() => setEditingTxnId(t.txnID)}
                                                        title="Click to edit"
                                                    >
                                                        {displayStatus(t.status)}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{formatPrice(t.amount)}</TableCell>
                                            <TableCell className="text-right">
                                                {editingTxnId !== t.txnID && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingTxnId(t.txnID)}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Edit status
                                                    </button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        {data.transactionsPagination?.total > 20 && (
                            <p className="p-3 text-sm text-gray-500">Showing first 20 of {data.transactionsPagination.total} transactions.</p>
                        )}
                    </div>
                )}

                {activeTab === 'payouts' && (
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payoutHistory.length === 0 ? (
                                    <TableRow><TableCell colSpan={3} className="text-center py-8 text-gray-500">No payout history</TableCell></TableRow>
                                ) : (
                                    payoutHistory.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell>{formatDate(p.date)}</TableCell>
                                            <TableCell>{formatPrice(p.amount)}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs ${(p.status && (p.status === 'completed' || p.status === 'mCompleted')) ? 'bg-green-100 text-green-800' : (p.status && (p.status === 'pending' || p.status === 'mPending')) ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}>
                                                    {displayStatus(p.status)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {activeTab === 'banks' && (
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account Holder</TableHead>
                                    <TableHead>Bank</TableHead>
                                    <TableHead>Account No.</TableHead>
                                    <TableHead>IFSC</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(!bankAccounts || bankAccounts.length === 0) ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No bank accounts</TableCell></TableRow>
                                ) : (
                                    bankAccounts.map((b) => (
                                        <TableRow key={b.bankAccountID}>
                                            <TableCell>{b.accountHolderName}</TableCell>
                                            <TableCell>{b.bankName}</TableCell>
                                            <TableCell>****{String(b.accountNumber).slice(-4)}</TableCell>
                                            <TableCell>{b.ifscCode}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs ${b.status === 'approved' ? 'bg-green-100 text-green-800' : b.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {b.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </Container>
        </Layout>
    );
};

export default AffiliateDetail;
