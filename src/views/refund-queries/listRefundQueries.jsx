import React, { useEffect, useState } from 'react';
import Layout from 'src/layout';
import Container from '@/components/ui/container';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getRefundQueries, updateRefundQueryStatus, approveReturnRequest, rejectReturnRequest } from '@/lib/api/refundQueriesApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';

const ListRefundQueries = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(20);
    const [statusFilter, setStatusFilter] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (statusFilter) params.status = statusFilter;
            const res = await getRefundQueries(params);
            if (res.success) {
                setData(res.data || []);
                setTotal(res.total ?? 0);
            } else {
                toast.error(res.message || 'Failed to fetch refund queries');
            }
        } catch (e) {
            toast.error('Failed to fetch refund queries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, statusFilter]);

    const handleStatusChange = async (refundQueryID, newStatus) => {
        setUpdatingId(refundQueryID);
        try {
            const res = await updateRefundQueryStatus(refundQueryID, newStatus);
            if (res.success) {
                toast.success('Status updated');
                fetchData();
            } else {
                toast.error(res.message || 'Update failed');
            }
        } catch {
            toast.error('Update failed');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleApprove = async (orderItemID) => {
        setUpdatingId(orderItemID);
        try {
            const res = await approveReturnRequest(orderItemID);
            if (res.success) {
                toast.success('Return Approved');
                fetchData();
            } else {
                toast.error(res.message || 'Approval failed');
            }
        } catch (e) {
            toast.error('Approval failed');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleReject = async (orderItemID, reason = '') => {
        setUpdatingId(orderItemID);
        try {
            const res = await rejectReturnRequest(orderItemID, reason);
            if (res.success) {
                toast.success('Return Rejected');
                fetchData();
            } else {
                toast.error(res.message || 'Rejection failed');
            }
        } catch (e) {
            toast.error('Rejection failed');
        } finally {
            setUpdatingId(null);
        }
    };

    const totalPages = Math.ceil(total / limit) || 1;

    return (
        <Layout>
            <Container>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Return Queries</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-secondary-text">Status:</span>
                            <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="refund_approval">Refund Approval Pending</SelectItem>
                                    <SelectItem value="replacement_approval">Replacement Approval Pending</SelectItem>
                                    <SelectItem value="pending">Approved/Processing</SelectItem>
                                    <SelectItem value="contacting_customer">Contacting Customer</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <p className="text-sm text-secondary-text">Manage all Return and Replacement requests submitted by customers. Approve or reject based on item condition and stock availability.</p>

                    {loading ? (
                        <div className="py-8 text-center text-gray-500">Loading...</div>
                    ) : (
                        <>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Query ID</TableHead>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Item ID</TableHead>
                                            <TableHead>Product ID</TableHead>
                                            <TableHead>User ID</TableHead>
                                            <TableHead>Brand ID</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                                                    No return queries found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            data.map((row) => (
                                                <TableRow key={row.refundQueryID} className={['refund_approval', 'replacement_approval'].includes(row.status) ? 'bg-red-50/30' : ''}>
                                                    <TableCell className="font-mono text-xs">{row.refundQueryID}</TableCell>
                                                    <TableCell className="font-medium">#{row.orderID}</TableCell>
                                                    <TableCell className="text-xs">{row.orderItemID}</TableCell>
                                                    <TableCell className="text-xs">{row.productID}</TableCell>
                                                    <TableCell className="text-xs">{row.userID}</TableCell>
                                                    <TableCell className="text-xs">{row.brandID || '—'}</TableCell>
                                                    <TableCell className="max-w-[150px] truncate" title={`${row.reason}\n\nRemarks: ${row.comments || 'N/A'}`}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-xs">{row.reason}</span>
                                                            <span className="text-[10px] text-gray-500 truncate">{row.comments}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${row.returnType === 'replacement' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                            {row.returnType}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className={`text-[10px] font-bold uppercase ${['refund_approval', 'replacement_approval'].includes(row.status) ? 'text-red-600' : 'text-gray-600'}`}>
                                                                {row.status?.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-secondary-text">
                                                        {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {['refund_approval', 'replacement_approval', 'return_approval'].includes(row.status) ? (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedQuery(row);
                                                                    setRejectionReason('');
                                                                    setIsDetailOpen(true);
                                                                }}
                                                                className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-blue-700"
                                                            >VIEW DETAIL</button>
                                                        ) : (
                                                            <Select
                                                                value={row.status}
                                                                onValueChange={(v) => handleStatusChange(row.refundQueryID, v)}
                                                                disabled={!!updatingId}
                                                            >
                                                                <SelectTrigger className="w-[130px] h-8 text-[10px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="pending">Approved/Processing</SelectItem>
                                                                    <SelectItem value="contacting_customer">Contacting Customer</SelectItem>
                                                                    <SelectItem value="resolved">Resolved</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page <= 1}
                                        className="px-3 py-2 border rounded disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-3 py-2">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                        className="px-3 py-2 border rounded disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                    {/* Detail Modal */}
                    <AlertDialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                        <AlertDialogContent className="max-w-2xl">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Return Request Details</AlertDialogTitle>
                            </AlertDialogHeader>
                            {selectedQuery && (
                                <div className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Order ID</p>
                                            <p className="font-bold">#{selectedQuery.orderID}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Return Type</p>
                                            <p className="font-bold uppercase">{selectedQuery.returnType}</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <p className="text-gray-500 text-sm">Topic/Reason</p>
                                        <p className="font-medium p-2 bg-gray-50 rounded border">{selectedQuery.reason || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-sm">Customer Remarks</p>
                                        <p className="p-2 bg-gray-50 rounded border text-sm whitespace-pre-wrap">{selectedQuery.comments || 'No remarks provided'}</p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-sm">Rejection Reason (Optional)</p>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Add a rejection reason for the customer"
                                            rows={3}
                                            className="w-full rounded border p-2 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-sm mb-2">Customer Photos</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {(() => {
                                                try {
                                                    const photos = typeof selectedQuery.photos === 'string' ? JSON.parse(selectedQuery.photos) : selectedQuery.photos;
                                                    if (!Array.isArray(photos) || photos.length === 0) return <p className="col-span-4 text-xs italic text-gray-400">No photos uploaded</p>;
                                                    return photos.map((p, idx) => (
                                                        <a key={idx} href={p} target="_blank" rel="noreferrer" className="aspect-square border rounded overflow-hidden">
                                                            <img src={p} alt={`Return item ${idx}`} className="w-full h-full object-cover" />
                                                        </a>
                                                    ));
                                                } catch (e) {
                                                    return <p className="col-span-4 text-xs italic text-gray-400">Invalid photos data</p>;
                                                }
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <AlertDialogFooter className="flex gap-2">
                                <div className="flex-1 flex gap-2">
                                    <button
                                        onClick={async () => {
                                            await handleApprove(selectedQuery.orderItemID);
                                            setIsDetailOpen(false);
                                        }}
                                        disabled={!!updatingId}
                                        className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-700 disabled:opacity-50"
                                    >APPROVE</button>
                                    <button
                                        onClick={async () => {
                                            await handleReject(selectedQuery.orderItemID, rejectionReason);
                                            setIsDetailOpen(false);
                                        }}
                                        disabled={!!updatingId}
                                        className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700 disabled:opacity-50"
                                    >REJECT</button>
                                </div>
                                <AlertDialogCancel onClick={() => setIsDetailOpen(false)}>CLOSE</AlertDialogCancel>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </Container>
        </Layout>
    );
};

export default ListRefundQueries;
