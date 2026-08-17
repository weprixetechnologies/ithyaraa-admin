import React, { useEffect, useState } from 'react';
import Layout from 'src/layout';
import Container from '@/components/ui/container';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getResolvedRefundQueries } from '@/lib/api/refundQueriesApi';
import { toast } from 'react-toastify';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';

const ListResolvedQueries = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(20);
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = { page, limit };
            const res = await getResolvedRefundQueries(params);
            if (res.success) {
                setData(res.data || []);
                setTotal(res.total ?? 0);
            } else {
                toast.error(res.message || 'Failed to fetch resolved queries');
            }
        } catch (e) {
            toast.error('Failed to fetch resolved queries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    const totalPages = Math.ceil(total / limit) || 1;

    return (
        <Layout>
            <Container>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Return Resolved Queries</h1>
                    </div>
                    <p className="text-sm text-secondary-text">Archive of all approved and rejected return requests.</p>

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
                                            <TableHead>Product</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Outcome</TableHead>
                                            <TableHead>Resolved At</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.map((row) => (
                                            <TableRow key={row.refundQueryID} className="hover:bg-gray-50">
                                                <TableCell className="font-medium text-xs">{row.refundQueryID}</TableCell>
                                                <TableCell className="text-xs">#{row.orderID}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-medium leading-tight">{row.productName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${row.returnType === 'replacement' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {row.returnType}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${row.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {row.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-[10px] text-gray-500">
                                                    {row.resolvedAt ? new Date(row.resolvedAt).toLocaleString() : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedQuery(row);
                                                            setIsDetailOpen(true);
                                                        }}
                                                        className="bg-gray-600 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-gray-700"
                                                    >VIEW DETAIL</button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {data.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7} className="py-8 text-center text-gray-500">No resolved queries found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between py-4">
                                <div className="text-sm text-secondary-text">
                                    Page {page} of {totalPages}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                    >Previous</button>
                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                    >Next</button>
                                </div>
                            </div>
                        </>
                    )}
                    {/* Detail Modal */}
                    <AlertDialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                        <AlertDialogContent className="max-w-2xl">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Resolved Request Details</AlertDialogTitle>
                            </AlertDialogHeader>
                            {selectedQuery && (
                                <div className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Outcome</p>
                                            <p className={`font-bold uppercase ${selectedQuery.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>{selectedQuery.status}</p>
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

                                    {selectedQuery.adminRejectionReason && (
                                        <div>
                                            <p className="text-gray-500 text-sm">Admin Rejection Reason</p>
                                            <p className="p-2 bg-red-50 rounded border text-sm whitespace-pre-wrap text-red-700">
                                                {selectedQuery.adminRejectionReason}
                                            </p>
                                        </div>
                                    )}

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
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setIsDetailOpen(false)}>CLOSE</AlertDialogCancel>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </Container>
        </Layout>
    );
};

export default ListResolvedQueries;
