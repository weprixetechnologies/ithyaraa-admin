import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Layout from 'src/layout';
import Container from '@/components/ui/container';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { MdSearch, MdCheckCircle, MdCancel, MdVisibility, MdClose, MdContentCopy } from 'react-icons/md';
import { toast } from 'react-toastify';
import axiosInstance from '@/lib/axiosInstance';

// ─────────────────────────────────────────────────────────────────────────────
// Status badge helper
// ─────────────────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const cfg = {
        pending:  { bg: 'bg-amber-100 text-amber-700 border-amber-200',  label: 'Pending' },
        approved: { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Approved' },
        rejected: { bg: 'bg-rose-100 text-rose-700 border-rose-200',     label: 'Rejected' },
    }[status] || { bg: 'bg-gray-100 text-gray-600 border-gray-200', label: status };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.bg}`}>
            {cfg.label}
        </span>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Detail Modal
// ─────────────────────────────────────────────────────────────────────────────
const DetailModal = ({ app, onClose, onApprove, onReject, acting }) => {
    const [rejectNotes, setRejectNotes] = useState('');
    const [showRejectBox, setShowRejectBox] = useState(false);
    const [copiedCreds, setCopiedCreds] = useState(false);
    const [approvalResult, setApprovalResult] = useState(null);

    if (!app) return null;

    const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';

    const handleApprove = async () => {
        const result = await onApprove(app.id);
        if (result) setApprovalResult(result);
    };

    const handleReject = () => {
        onReject(app.id, rejectNotes);
    };

    const copyCreds = () => {
        if (!approvalResult) return;
        navigator.clipboard.writeText(
            `Email: ${approvalResult.brandEmail}\nTemp Password: ${approvalResult.tempPassword}`
        );
        setCopiedCreds(true);
        setTimeout(() => setCopiedCreds(false), 2000);
    };

    const interests = Array.isArray(app.interests) ? app.interests : [];
    const partnershipType = Array.isArray(app.partnership_type) ? app.partnership_type : [];
    const partnershipLabels = { supply_to_ithyaraa: 'Supply products to Ithyaraa', sell_with_ithyaraa: 'Partner with Ithyaraa to sell products' };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">{app.brand_name}</h2>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{app.ref_id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={app.status} />
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 flex items-center justify-center transition-all"
                        >
                            <MdClose className="text-lg" />
                        </button>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-6">
                    {/* Approval result banner */}
                    {approvalResult && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                            <p className="text-sm font-bold text-emerald-700">✓ Brand account created successfully!</p>
                            <div className="bg-white border border-emerald-100 rounded-lg px-3 py-2 font-mono text-xs text-gray-700 space-y-1">
                                <p><span className="text-gray-400">Email:</span> {approvalResult.brandEmail}</p>
                                <p><span className="text-gray-400">Temp Password:</span> {approvalResult.tempPassword}</p>
                                <p><span className="text-gray-400">Brand UID:</span> {approvalResult.brandUid}</p>
                            </div>
                            <button
                                onClick={copyCreds}
                                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                            >
                                <MdContentCopy />
                                {copiedCreds ? 'Copied!' : 'Copy credentials'}
                            </button>
                        </div>
                    )}

                    {/* Brand Details */}
                    <Section title="Brand Identity">
                        <Row label="Brand Name" value={app.brand_name} />
                        <Row label="Website / Store" value={<a href={app.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-xs block">{app.website}</a>} />
                        <Row label="Product Type" value={<span className="capitalize">{app.product_type?.replace('_', ' ')}</span>} />
                        <Row label="Address" value={app.address} wide />
                    </Section>

                    {/* Collaboration */}
                    <Section title="Collaboration Interests">
                        <div className="col-span-2 flex flex-wrap gap-1.5">
                            {interests.map((i) => (
                                <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[11px] font-semibold">
                                    {i}
                                </span>
                            ))}
                        </div>
                    </Section>

                    {/* Dropshipping */}
                    {(app.dropship_status || app.monthly_order_volume || partnershipType.length > 0) && (
                        <Section title="Dropshipping Info">
                            <Row label="Currently Dropships" value={app.dropship_status} />
                            {app.monthly_order_volume && <Row label="Monthly Volume" value={app.monthly_order_volume} />}
                            {partnershipType.length > 0 && (
                                <Row label="Looking To" value={partnershipType.map(p => partnershipLabels[p] || p).join(' & ')} wide />
                            )}
                        </Section>
                    )}

                    {/* Brand Story */}
                    {app.goals && (
                        <Section title="Brand Story & Goals">
                            <div className="col-span-2 bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                                {app.goals}
                            </div>
                        </Section>
                    )}

                    {/* Lookbook */}
                    {app.lookbook_name && (
                        <Section title="Lookbook / Catalog">
                            <Row label="File Name" value={app.lookbook_name} />
                            {app.lookbook_url && (
                                <Row label="File URL" value={<a href={app.lookbook_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View File</a>} />
                            )}
                        </Section>
                    )}

                    {/* Contact */}
                    <Section title="Contact Information">
                        <Row label="Name" value={app.contact_name} />
                        {app.contact_position && <Row label="Position" value={app.contact_position} />}
                        <Row label="Email" value={app.contact_email} />
                        <Row label="Phone" value={app.contact_phone} />
                    </Section>

                    {/* Review Info */}
                    <Section title="Application Timeline">
                        <Row label="Submitted At" value={fmtDate(app.submitted_at)} />
                        {app.reviewed_at && <Row label="Reviewed At" value={fmtDate(app.reviewed_at)} />}
                        {app.reviewed_by && <Row label="Reviewed By" value={app.reviewed_by} />}
                        {app.notes && <Row label="Notes" value={app.notes} wide />}
                    </Section>

                    {/* Actions */}
                    {app.status === 'pending' && !approvalResult && (
                        <div className="border-t border-gray-100 pt-5">
                            {!showRejectBox ? (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleApprove}
                                        disabled={acting}
                                        className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <MdCheckCircle className="text-xl" />
                                        {acting === 'approve' ? 'Approving...' : 'Approve & Create Brand Account'}
                                    </button>
                                    <button
                                        onClick={() => setShowRejectBox(true)}
                                        disabled={acting}
                                        className="flex-1 py-3 bg-rose-50 text-rose-600 border border-rose-200 font-bold rounded-xl hover:bg-rose-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <MdCancel className="text-xl" />
                                        Reject Application
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Rejection Notes (optional)</label>
                                    <textarea
                                        rows={3}
                                        value={rejectNotes}
                                        onChange={(e) => setRejectNotes(e.target.value)}
                                        placeholder="Reason for rejection (will not be sent to applicant)"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-300"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowRejectBox(false)}
                                            className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-xl font-semibold hover:bg-gray-50 text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            disabled={acting}
                                            className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 disabled:opacity-50 text-sm"
                                        >
                                            {acting === 'reject' ? 'Rejecting...' : 'Confirm Reject'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {app.status === 'approved' && app.brand_uid && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm">
                            <p className="font-bold text-emerald-700 mb-1">Brand account active</p>
                            <p className="font-mono text-xs text-gray-600">UID: {app.brand_uid}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div>
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {children}
        </div>
    </div>
);

const Row = ({ label, value, wide }) => (
    <div className={wide ? 'col-span-2' : 'col-span-1'}>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">{label}</p>
        <p className="text-sm text-gray-800 font-medium">{value || <span className="text-gray-300 italic">—</span>}</p>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
const ListBrandApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loadingAPI, setLoadingAPI] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedApp, setSelectedApp] = useState(null);
    const [actingId, setActingId] = useState(null);
    const [actingType, setActingType] = useState(null);

    const fetchApplications = useCallback(async () => {
        try {
            setLoadingAPI(true);
            setError('');
            const params = activeTab !== 'all' ? `?status=${activeTab}` : '';
            const { data } = await axiosInstance.get(`/admin/brand-applications${params}`);
            if (data.success) {
                setApplications(data.data || []);
            } else {
                setError('Failed to fetch applications');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch applications');
        } finally {
            setLoadingAPI(false);
        }
    }, [activeTab]);

    useEffect(() => { fetchApplications(); }, [fetchApplications]);

    const filtered = useMemo(() => {
        if (!searchTerm) return applications;
        const term = searchTerm.toLowerCase();
        return applications.filter((a) =>
            a.brand_name?.toLowerCase().includes(term) ||
            a.contact_email?.toLowerCase().includes(term) ||
            a.ref_id?.toLowerCase().includes(term) ||
            a.contact_name?.toLowerCase().includes(term)
        );
    }, [applications, searchTerm]);

    const handleApprove = async (id) => {
        setActingId(id); setActingType('approve');
        try {
            const { data } = await axiosInstance.post(`/admin/brand-applications/${id}/approve`);
            if (data.success) {
                toast.success('Application approved! Brand account created.');
                fetchApplications();
                // Return credentials for display in modal
                return data.data;
            } else {
                toast.error(data.message || 'Approval failed');
                return null;
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Approval failed');
            return null;
        } finally {
            setActingId(null); setActingType(null);
        }
    };

    const handleReject = async (id, notes) => {
        setActingId(id); setActingType('reject');
        try {
            const { data } = await axiosInstance.post(`/admin/brand-applications/${id}/reject`, { notes });
            if (data.success) {
                toast.success('Application rejected');
                setSelectedApp(null);
                fetchApplications();
            } else {
                toast.error(data.message || 'Rejection failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Rejection failed');
        } finally {
            setActingId(null); setActingType(null);
        }
    };

    const openDetail = async (app) => {
        try {
            const { data } = await axiosInstance.get(`/admin/brand-applications/${app.id}`);
            if (data.success) setSelectedApp(data.data);
        } catch {
            setSelectedApp(app);
        }
    };

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'approved', label: 'Approved' },
        { key: 'rejected', label: 'Rejected' },
    ];

    const tabCounts = useMemo(() => ({
        pending:  applications.filter(a => a.status === 'pending').length,
        approved: applications.filter(a => a.status === 'approved').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
    }), [applications]);

    return (
        <Layout active="brand-applications" title="Brand Onboarding Applications">
            {/* Detail Modal */}
            {selectedApp && (
                <DetailModal
                    app={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    acting={actingId === selectedApp.id ? actingType : null}
                />
            )}

            <Container containerclass="bg-transparent">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Brand Onboarding Applications</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Review submissions from the brand onboarding form · {applications.length} total
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Search by brand, email, ref ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex gap-1 mb-6 bg-gray-50 rounded-xl p-1 w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === tab.key
                                    ? 'bg-white text-gray-800 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                            {tab.key !== 'all' && tabCounts[tab.key] > 0 && (
                                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    tab.key === 'pending' ? 'bg-amber-100 text-amber-700' :
                                    tab.key === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-rose-100 text-rose-700'
                                }`}>
                                    {tabCounts[tab.key]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}
            </Container>

            <Container containerclass="bg-transparent overflow-hidden">
                <div className="min-w-full inline-block align-middle">
                    <Table className="border-separate border-spacing-y-2">
                        <TableHeader>
                            <TableRow className="border-none">
                                <TableHead className="pl-6 text-gray-500 font-bold text-xs uppercase tracking-wider">Ref ID</TableHead>
                                <TableHead className="text-left text-gray-500 font-bold text-xs uppercase tracking-wider">Brand</TableHead>
                                <TableHead className="text-left text-gray-500 font-bold text-xs uppercase tracking-wider">Contact</TableHead>
                                <TableHead className="text-center text-gray-500 font-bold text-xs uppercase tracking-wider">Type</TableHead>
                                <TableHead className="text-center text-gray-500 font-bold text-xs uppercase tracking-wider">Interests</TableHead>
                                <TableHead className="text-center text-gray-500 font-bold text-xs uppercase tracking-wider">Submitted</TableHead>
                                <TableHead className="text-center text-gray-500 font-bold text-xs uppercase tracking-wider">Status</TableHead>
                                <TableHead className="pr-6 text-center text-gray-500 font-bold text-xs uppercase tracking-wider">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loadingAPI && applications.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-20">
                                        <div className="flex flex-col items-center justify-center">
                                            <DotLottieReact
                                                src="https://lottie.host/15a4b106-bbe8-40d8-bb4e-834fb23fceae/I9HKWeP6l2.lottie"
                                                loop autoplay style={{ height: '180px', width: 'auto' }}
                                            />
                                            <p className="text-gray-400 mt-3 animate-pulse text-sm">Loading applications...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loadingAPI && filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-20">
                                        <div className="text-center flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <MdSearch className="text-3xl text-gray-300" />
                                            </div>
                                            <p className="text-lg font-bold text-gray-400">No applications found</p>
                                            <p className="text-sm text-gray-300">
                                                {searchTerm ? 'Try adjusting your search' : `No ${activeTab === 'all' ? '' : activeTab} applications yet`}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}

                            {filtered.length > 0 && !loadingAPI && filtered.map((app) => {
                                const interests = Array.isArray(app.interests) ? app.interests : [];
                                return (
                                    <TableRow
                                        key={app.id}
                                        className="bg-white border-none shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.08)] transition-all cursor-pointer"
                                        onClick={() => openDetail(app)}
                                    >
                                        <TableCell className="rounded-l-xl pl-6 py-4 font-mono text-[11px] text-gray-400">
                                            {app.ref_id}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm leading-tight">{app.brand_name}</p>
                                                <p className="text-xs text-gray-400 capitalize mt-0.5">{app.product_type?.replace('_', ' ')}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div>
                                                <p className="text-sm text-gray-700 font-medium">{app.contact_name}</p>
                                                <p className="text-xs text-blue-500">{app.contact_email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <span className="text-xs text-gray-500 capitalize">{app.product_type}</span>
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <div className="flex flex-wrap gap-1 justify-center max-w-[180px]">
                                                {interests.slice(0, 2).map((i) => (
                                                    <span key={i} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-medium">
                                                        {i.split(' ').slice(0, 2).join(' ')}
                                                    </span>
                                                ))}
                                                {interests.length > 2 && (
                                                    <span className="px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded text-[10px]">
                                                        +{interests.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center py-4 text-xs text-gray-500">
                                            {fmtDate(app.submitted_at)}
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <StatusBadge status={app.status} />
                                        </TableCell>
                                        <TableCell className="rounded-r-xl pr-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => openDetail(app)}
                                                    className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                                                    title="View Details"
                                                >
                                                    <MdVisibility className="text-base" />
                                                </button>
                                                {app.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={async (e) => { e.stopPropagation(); await handleApprove(app.id); }}
                                                            disabled={actingId === app.id}
                                                            className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
                                                            title="Approve"
                                                        >
                                                            <MdCheckCircle className="text-base" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openDetail(app); }}
                                                            disabled={actingId === app.id}
                                                            className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
                                                            title="Reject"
                                                        >
                                                            <MdCancel className="text-base" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </Container>
        </Layout>
    );
};

export default ListBrandApplications;
