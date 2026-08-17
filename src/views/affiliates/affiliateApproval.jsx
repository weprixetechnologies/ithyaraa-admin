import React, { useEffect, useState, useCallback } from 'react';
import Layout from 'src/layout';
import Container from '@/components/ui/container';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { getAffiliates, approveAffiliate as approveAffiliateApi, rejectAffiliate as rejectAffiliateApi } from '@/lib/api/affiliatesApi';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { IoMdEye } from 'react-icons/io';
import { MdCheckCircle, MdCancel } from 'react-icons/md';
import { toast } from 'react-toastify';

const AffiliateApproval = () => {
    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [loadingAPI, setLoadingAPI] = useState(true);
    const [error, setError] = useState('');
    const [approvingUid, setApprovingUid] = useState(null);
    const [rejectingUid, setRejectingUid] = useState(null);

    const fetchPending = useCallback(async () => {
        try {
            setLoadingAPI(true);
            setError('');
            const res = await getAffiliates({ status: 'pending', page: 1, limit: 50 });
            if (res.success) setList(res.data || []);
            else setError(res.error || 'Failed to fetch');
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to fetch');
        } finally {
            setLoadingAPI(false);
        }
    }, []);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    const handleApprove = async (uid) => {
        try {
            setApprovingUid(uid);
            const res = await approveAffiliateApi(uid);
            if (res.success) {
                toast.success('Affiliate approved successfully');
                setList((prev) => prev.filter((r) => r.uid !== uid));
            } else {
                toast.error(res.error || 'Approval failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || err.message || 'Approval failed');
        } finally {
            setApprovingUid(null);
        }
    };

    const handleReject = async (uid) => {
        if (!window.confirm('Reject this affiliate request? The user will need to apply again to become an affiliate.')) return;
        try {
            setRejectingUid(uid);
            const res = await rejectAffiliateApi(uid);
            if (res.success) {
                toast.success('Affiliate request rejected');
                setList((prev) => prev.filter((r) => r.uid !== uid));
            } else {
                toast.error(res.error || 'Reject failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || err.message || 'Reject failed');
        } finally {
            setRejectingUid(null);
        }
    };

    const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A');

    return (
        <Layout active="admin-affiliates-approval" title="Affiliate Approval">
            <Container containerclass="bg-transparent">
                <p className="text-secondary-text mb-4">Users who have applied for affiliate program and are awaiting approval.</p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <Table className="border-separate border-spacing-y-2">
                    <TableHeader>
                        <TableRow className="text-unique text-[16px] uppercase">
                            <TableHead className="pl-5">UID</TableHead>
                            <TableHead className="text-left pl-10">Name</TableHead>
                            <TableHead className="text-left">Phone</TableHead>
                            <TableHead className="text-center">Email</TableHead>
                            <TableHead className="text-center">Applied On</TableHead>
                            <TableHead className="pr-5 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white">
                        {loadingAPI && list.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="rounded-[10px]">
                                    <DotLottieReact
                                        src="https://lottie.host/15a4b106-bbe8-40d8-bb4e-834fb23fceae/I9HKWeP6l2.lottie"
                                        loop
                                        autoplay
                                        style={{ height: '200px', width: 'auto' }}
                                    />
                                </TableCell>
                            </TableRow>
                        )}

                        {list.length > 0 && !loadingAPI && list.map((row) => (
                            <TableRow key={row.uid} className="rounded-full bg-white shadow-lg shadow-cyan-500/50">
                                <TableCell className="rounded-l-[10px] font-bold py-5 pl-5">{row.uid}</TableCell>
                                <TableCell className="py-5 pl-10">{row.name || 'N/A'}</TableCell>
                                <TableCell className="py-5">{row.phonenumber || 'N/A'}</TableCell>
                                <TableCell className="text-center py-5 max-w-[200px] truncate">{row.emailID || 'N/A'}</TableCell>
                                <TableCell className="text-center py-5 text-sm">{formatDate(row.createdOn)}</TableCell>
                                <TableCell className="rounded-r-[10px] text-center pr-5">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            className="bg-blue-600 cursor border-none text-white p-2 rounded-full flex-center hover:bg-blue-700"
                                            onClick={() => navigate(`/affiliates/details/${row.uid}`)}
                                            title="View Details"
                                        >
                                            <IoMdEye style={{ width: '16px', height: '16px' }} />
                                        </button>
                                        <button
                                            className="bg-green-600 cursor border-none text-white p-2 rounded-full flex-center hover:bg-green-700 disabled:opacity-50"
                                            onClick={() => handleApprove(row.uid)}
                                            disabled={approvingUid === row.uid || rejectingUid === row.uid}
                                            title="Approve"
                                        >
                                            <MdCheckCircle style={{ width: '16px', height: '16px' }} />
                                        </button>
                                        <button
                                            className="bg-red-600 cursor border-none text-white p-2 rounded-full flex-center hover:bg-red-700 disabled:opacity-50"
                                            onClick={() => handleReject(row.uid)}
                                            disabled={approvingUid === row.uid || rejectingUid === row.uid}
                                            title="Reject"
                                        >
                                            <MdCancel style={{ width: '16px', height: '16px' }} />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {!loadingAPI && list.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <div className="text-center py-8 text-lg text-muted-foreground">
                                        No pending affiliate requests
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {!loadingAPI && list.length > 0 && (
                    <p className="text-center mt-4 text-sm text-secondary-text">{list.length} pending request(s)</p>
                )}
            </Container>
        </Layout>
    );
};

export default AffiliateApproval;
