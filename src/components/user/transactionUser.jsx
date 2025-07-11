import React, { useState } from 'react';
import './TransactionUser.css';

const transactionHistory = [
    { date: '01/07/2025', time: '10:30 AM', orderID: 'ORD100001', isTopUp: 'TopUp', TXNID: 'TXN987654321', status: 'Success' },
    { date: '02/07/2025', time: '11:15 AM', orderID: 'ORD100002', isTopUp: 'Order', TXNID: 'TXN123456789', status: 'Pending' },
    { date: '03/07/2025', time: '09:45 AM', orderID: 'ORD100003', isTopUp: 'TopUp', TXNID: 'TXN222333444', status: 'Refunded' },
    { date: '04/07/2025', time: '02:30 PM', orderID: 'ORD100004', isTopUp: 'Order', TXNID: 'TXN555666777', status: 'Success' },
    { date: '05/07/2025', time: '04:20 PM', orderID: 'ORD100005', isTopUp: 'TopUp', TXNID: 'TXN888999000', status: 'Success' },
    { date: '06/07/2025', time: '03:00 PM', orderID: 'ORD100006', isTopUp: 'Order', TXNID: 'TXN101010101', status: 'Pending' },
    { date: '07/07/2025', time: '08:10 AM', orderID: 'ORD100007', isTopUp: 'TopUp', TXNID: 'TXN121212121', status: 'Success' },
    { date: '08/07/2025', time: '12:00 PM', orderID: 'ORD100008', isTopUp: 'Order', TXNID: 'TXN131313131', status: 'Refunded' },
    { date: '09/07/2025', time: '06:40 PM', orderID: 'ORD100009', isTopUp: 'TopUp', TXNID: 'TXN141414141', status: 'Success' },
    { date: '10/07/2025', time: '01:30 PM', orderID: 'ORD100010', isTopUp: 'Order', TXNID: 'TXN151515151', status: 'Pending' },
    { date: '11/07/2025', time: '11:59 AM', orderID: 'ORD100011', isTopUp: 'TopUp', TXNID: 'TXN161616161', status: 'Success' },
    { date: '12/07/2025', time: '10:10 AM', orderID: 'ORD100012', isTopUp: 'Order', TXNID: 'TXN171717171', status: 'Refunded' },
    { date: '13/07/2025', time: '07:00 PM', orderID: 'ORD100013', isTopUp: 'TopUp', TXNID: 'TXN181818181', status: 'Pending' },
    { date: '14/07/2025', time: '05:05 PM', orderID: 'ORD100014', isTopUp: 'Order', TXNID: 'TXN191919191', status: 'Success' },
    { date: '15/07/2025', time: '09:30 AM', orderID: 'ORD100015', isTopUp: 'TopUp', TXNID: 'TXN202020202', status: 'Success' },
];
const TransactionUser = () => {
    const [filter, setFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    const perPage = 5;

    const filterByDate = (txn) => {
        if (!dateRange.from && !dateRange.to) return true;

        const txnDate = new Date(txn.date.split('/').reverse().join('-'));
        const from = dateRange.from ? new Date(dateRange.from) : null;
        const to = dateRange.to ? new Date(dateRange.to) : null;

        if (from && txnDate < from) return false;
        if (to && txnDate > to) return false;
        return true;
    };

    const filtered = transactionHistory
        .filter(txn => filter === 'All' || txn.isTopUp === filter)
        .filter(txn => statusFilter === 'All' || txn.status === statusFilter)
        .filter(filterByDate);

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    const handlePrev = () => page > 1 && setPage(page - 1);
    const handleNext = () => page < totalPages && setPage(page + 1);

    return (
        <div className="txn-container">
            <div className="txn-filters-wrap">
                <div className="txn-filters">
                    {['All', 'TopUp', 'Order'].map(type => (
                        <button
                            key={type}
                            className={filter === type ? 'txn-active' : ''}
                            onClick={() => { setFilter(type); setPage(1); }}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="txn-filters">
                    {['All', 'Success', 'Pending', 'Refunded'].map(status => (
                        <button
                            key={status}
                            className={statusFilter === status ? 'txn-active' : ''}
                            onClick={() => { setStatusFilter(status); setPage(1); }}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="txn-date-range">
                    <label>From:
                        <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => { setDateRange({ ...dateRange, from: e.target.value }); setPage(1); }}
                        />
                    </label>
                    <label>To:
                        <input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => { setDateRange({ ...dateRange, to: e.target.value }); setPage(1); }}
                        />
                    </label>
                </div>
            </div>

            <div className="txn-list">
                {paginated.length ? paginated.map((txn, idx) => (
                    <div className={`txn-card ${txn.isTopUp === 'TopUp' ? 'topup' : 'order'}`} key={idx}>
                        <div><strong>Date:</strong> {txn.date}</div>
                        <div><strong>Time:</strong> {txn.time}</div>
                        <div><strong>{txn.isTopUp === 'TopUp' ? 'Top Up' : 'Order'} ID:</strong> {txn.orderID}</div>
                        <div><strong>TXN ID:</strong> {txn.TXNID}</div>
                        <div>
                            <strong>Status:</strong>{' '}
                            <span className={`txn-badge ${txn.status.toLowerCase()}`}>
                                {txn.status}
                            </span>
                        </div>
                    </div>
                )) : <p style={{ textAlign: 'center', marginTop: 20 }}>No transactions found</p>}
            </div>

            <div className="txn-pagination">
                <button onClick={handlePrev} disabled={page === 1}>Previous</button>
                <span>Page {page} of {totalPages}</span>
                <button onClick={handleNext} disabled={page === totalPages}>Next</button>
            </div>
        </div>
    );
};

export default TransactionUser;