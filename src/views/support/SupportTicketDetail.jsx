import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@/components/ui/container';
import Layout from 'src/layout';
import axiosInstance from './../../lib/axiosInstance';
import { toast } from 'react-toastify';
import { BiArrowBack } from 'react-icons/bi';
import { MdSend, MdLock, MdHistory } from 'react-icons/md';

const SupportTicketDetail = () => {
    const { ticketNo } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [sending, setSending] = useState(false);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/admin/support/tickets/${ticketNo}`);
            if (response.data.success) {
                setTicket(response.data.ticket);
                setReplies(response.data.replies);
            }
        } catch (error) {
            console.error('Error fetching ticket detail:', error);
            toast.error('Failed to fetch ticket details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [ticketNo]);

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;
        
        try {
            setSending(true);
            const response = await axiosInstance.post(`/admin/support/tickets/${ticketNo}/replies`, {
                message: replyMessage,
                is_internal: isInternal
            });
            if (response.data.success) {
                toast.success(isInternal ? 'Internal note added' : 'Reply sent');
                setReplyMessage('');
                fetchDetail();
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error(error.response?.data?.message || 'Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    const updateTicketStatus = async (status) => {
        try {
            const response = await axiosInstance.patch(`/admin/support/tickets/${ticketNo}`, { status });
            if (response.data.success) {
                toast.success('Status updated');
                fetchDetail();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const updatePriority = async (priority) => {
        try {
            const response = await axiosInstance.patch(`/admin/support/tickets/${ticketNo}`, { priority });
            if (response.data.success) {
                toast.success('Priority updated');
                fetchDetail();
            }
        } catch (error) {
            console.error('Error updating priority:', error);
            toast.error('Failed to update priority');
        }
    };

    if (loading) return <Layout title="Ticket Detail"><Container>Loading...</Container></Layout>;
    if (!ticket) return <Layout title="Ticket Detail"><Container>Ticket not found</Container></Layout>;

    const topicPath = JSON.parse(ticket.topic_path);

    return (
        <Layout title={`Ticket Detail - ${ticketNo}`} active="admin-support-tickets">
            <Container>
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                        <BiArrowBack className="text-xl" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            {ticketNo}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ticket.status === 'open' ? 'bg-blue-100 text-blue-700' : ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-700'}`}>
                                {ticket.status.replace('_', ' ')}
                            </span>
                        </h2>
                        <div className="text-sm text-gray-500 mt-1">
                            {topicPath.map((t, idx) => (
                                <span key={idx}>
                                    {t.label} {idx < topicPath.length - 1 && ' > '}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chat Thread */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Original Comment */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-slate-800 uppercase tracking-tighter text-sm">ORIGINAL COMMENT</span>
                                <span className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket.comment}</p>
                        </div>

                        {/* Thread */}
                        <div className="flex flex-col gap-4">
                            {replies.map((reply) => (
                                <div key={reply.id} className={`flex flex-col ${reply.sender_type === 'admin' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                                        reply.is_internal 
                                            ? 'bg-amber-50 border border-amber-200 text-amber-900 italic' 
                                            : reply.sender_type === 'admin' 
                                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                    }`}>
                                        {reply.is_internal && <div className="text-[10px] uppercase font-bold mb-1 flex items-center gap-1"><MdLock size={10}/> INTERNAL NOTE</div>}
                                        <p className="text-sm">{reply.message}</p>
                                        <div className={`text-[10px] mt-2 opacity-60 ${reply.sender_type === 'admin' && !reply.is_internal ? 'text-blue-100' : ''}`}>
                                            {reply.sender_id} • {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Box */}
                        {ticket.status !== 'closed' && (
                            <form onSubmit={handleReply} className="mt-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-lg">
                                <textarea 
                                    className="w-full border-0 focus:ring-0 text-sm h-24 p-2 resize-none outline-none"
                                    placeholder="Type your message..."
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                />
                                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
                                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={isInternal} 
                                            onChange={(e) => setIsInternal(e.target.checked)}
                                            className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                                        />
                                        <span className={isInternal ? 'text-amber-700' : 'text-gray-500'}>Internal Note</span>
                                    </label>
                                    <button 
                                        type="submit" 
                                        disabled={sending || !replyMessage.trim()}
                                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition ${
                                            isInternal ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                                        } disabled:opacity-50`}
                                    >
                                        {sending ? 'Sending...' : <><MdSend /> Send {isInternal ? 'Note' : 'Reply'}</>}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Sidebar Sidebar */}
                    <div className="flex flex-col gap-6">
                        {/* Status Guard */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Management</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 block mb-1">TICKET STATUS</label>
                                    <select 
                                        className="w-full border p-2 rounded-lg text-sm bg-gray-50"
                                        value={ticket.status}
                                        onChange={(e) => updateTicketStatus(e.target.value)}
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 block mb-1">PRIORITY LEVEL</label>
                                    <select 
                                        className="w-full border p-2 rounded-lg text-sm bg-gray-50"
                                        value={ticket.priority}
                                        onChange={(e) => updatePriority(e.target.value)}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Stats / Info */}
                        <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-xl">
                            <h3 className="font-bold mb-4 text-xs uppercase text-slate-400">Raiser Metadata</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-[10px] opacity-60">RAISED BY</div>
                                    <div className="font-bold">{ticket.raised_by_id}</div>
                                    <div className="text-[10px] font-medium bg-slate-700 inline-block px-2 py-0.5 rounded mt-1 uppercase">{ticket.raised_by_type}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                                    <div>
                                        <div className="text-[10px] opacity-60">STARTED</div>
                                        <div className="text-xs">{new Date(ticket.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] opacity-60">RESPONSE</div>
                                        <div className="text-xs">{ticket.first_response_at ? 'Yes' : 'None'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 p-2 bg-gray-100 rounded-xl mt-4">
                           <div className="flex items-center gap-2 text-gray-500 text-xs px-2 py-1"><MdHistory/> Ticket history</div>
                           <div className="text-[10px] text-gray-400 italic px-2">System logged activity will appear here in future updates.</div>
                        </div>
                    </div>
                </div>
            </Container>
        </Layout>
    );
};

export default SupportTicketDetail;
