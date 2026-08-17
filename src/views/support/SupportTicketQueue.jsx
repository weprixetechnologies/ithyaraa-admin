import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Container from '@/components/ui/container';
import Layout from 'src/layout';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './../../lib/axiosInstance';
import InputUi from '@/components/ui/inputui';
import { toast } from 'react-toastify';

const SupportTicketQueue = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        status: '',
        panel: '',
        priority: '',
        search: ''
    });

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admin/support/tickets', {
                params: { ...filters, page, limit: 20 }
            });
            if (response.data.success) {
                setTickets(response.data.tickets);
                // Simple total pages calculation as an example
                setTotalPages(response.data.tickets.length === 20 ? page + 1 : page);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
            toast.error('Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [page, filters]);

    const handleFilterChange = (e, name) => {
        setFilters({ ...filters, [name]: e.target.value });
        setPage(1);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-700';
            case 'in_progress': return 'bg-amber-100 text-amber-700';
            case 'closed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 font-bold';
            case 'medium': return 'text-amber-600 font-semibold';
            case 'low': return 'text-emerald-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <Layout title="Support Tickets" active="admin-support-tickets">
            <Container containerclass="bg-transparent">
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex-1 min-w-[200px]">
                            <InputUi 
                                placeholder="Search Ticket No / Comment" 
                                datafunction={(e) => handleFilterChange(e, 'search')} 
                            />
                        </div>
                        <select 
                            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-10"
                            value={filters.status}
                            onChange={(e) => handleFilterChange(e, 'status')}
                        >
                            <option value="">All Status</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="closed">Closed</option>
                        </select>
                        <select 
                            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-10"
                            value={filters.panel}
                            onChange={(e) => handleFilterChange(e, 'panel')}
                        >
                            <option value="">All Panels</option>
                            <option value="user">User</option>
                            <option value="brand">Brand</option>
                        </select>
                        <select 
                            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-10"
                            value={filters.priority}
                            onChange={(e) => handleFilterChange(e, 'priority')}
                        >
                            <option value="">All Priorities</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                        <button 
                            onClick={() => navigate('/support/topics')}
                            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition h-10"
                        >
                            Manage Topics
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead className="w-[150px]">Ticket No</TableHead>
                                <TableHead>Raised By</TableHead>
                                <TableHead>Topic</TableHead>
                                <TableHead className="text-center">Priority</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Created At</TableHead>
                                <TableHead className="text-right pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-gray-400">Loading tickets...</TableCell>
                                </TableRow>
                            ) : tickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-gray-400">No tickets found</TableCell>
                                </TableRow>
                            ) : (
                                tickets.map((ticket) => (
                                    <TableRow key={ticket.id} className="hover:bg-slate-50 transition-colors">
                                        <TableCell className="font-mono text-xs font-bold text-blue-600">{ticket.ticket_no}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{ticket.raised_by_id}</span>
                                                <span className="text-[10px] uppercase text-gray-400">{ticket.raised_by_type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs text-gray-600 max-w-[200px] truncate">
                                                {JSON.parse(ticket.topic_path).map(t => t.label).join(' > ')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`text-xs capitalize ${getPriorityColor(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center text-xs text-gray-500">
                                            {new Date(ticket.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <button 
                                                onClick={() => navigate(`/support/details/${ticket.ticket_no}`)}
                                                className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                                            >
                                                View Details
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <span className="text-sm text-gray-500">Showing page {page}</span>
                    <div className="flex gap-2">
                        <button 
                            disabled={page === 1 || loading}
                            onClick={() => setPage(page - 1)}
                            className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button 
                            disabled={tickets.length < 20 || loading}
                            onClick={() => setPage(page + 1)}
                            className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </Container>
        </Layout>
    );
};

export default SupportTicketQueue;
