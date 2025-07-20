import React, { useState, useEffect } from 'react';
import Layout from '../../layout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Container from '../../components/ui/container';
import SelectCustomLabelled from '../../components/ui/customSelect';
import InputCustomLabelled from '../../components/ui/customLabelledField';
import { returnDetailsArray } from '../ordersSchema';
import { FaEye } from 'react-icons/fa';
import './returns.css';
import { BiDownload } from 'react-icons/bi';

const ReturnList = () => {
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status') || 'all';
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        type: '',
        deliveryCompany: '',
        status: '',
        paymentMode: '',
        orderId: '',
        email: '',
        date: '',
        dateType: '' // createdOn, transactionDate, etc.
    });

    const [returnList, setReturnList] = useState(returnDetailsArray);

    useEffect(() => {
        let filtered = [...returnDetailsArray];

        if (filters.type) {
            filtered = filtered.filter(order => order.type === filters.type);
        }

        if (filters.deliveryCompany) {
            filtered = filtered.filter(order => order.deliveryCompany === filters.deliveryCompany);
        }

        if (filters.status) {
            filtered = filtered.filter(order => order.status?.toLowerCase() === filters.status.toLowerCase());
        }

        if (filters.paymentMode) {
            filtered = filtered.filter(order => order.paymentMode === filters.paymentMode);
        }

        if (filters.orderId) {
            filtered = filtered.filter(order => order.returnsId?.includes(filters.orderId));
        }

        if (filters.email) {
            filtered = filtered.filter(order => order.user?.toLowerCase().includes(filters.email.toLowerCase()));
        }

        if (
            filters.date &&
            filters.dateType &&
            ['createdOn', 'transactionDate'].includes(filters.dateType)
        ) {
            filtered = filtered.filter(order => {
                const value = order[filters.dateType];
                return value && value.startsWith(filters.date);
            });
        }

        setReturnList(filtered);
    }, [filters]);

    const handleChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Layout active={`admin-returns-${status}`} title={`Order List - ${status.toUpperCase()}`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Container title={'Filter returns'} gap={10}>
                    <div className="pregrid-wrapper" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                        <SelectCustomLabelled
                            label="Order Type"
                            value={filters.type}
                            selectFunction={(val) => handleChange('type', val)}
                            options={[
                                { value: 'vendor', label: 'Vendor' },
                                { value: 'in-house', label: 'In-house' },
                                { value: 'hybrid', label: 'Hybrid' }
                            ]}
                        />
                        <SelectCustomLabelled
                            label="Delivery Company"
                            value={filters.deliveryCompany}
                            selectFunction={(val) => handleChange('deliveryCompany', val)}
                            options={[
                                { value: 'bluedart', label: 'Bluedart' },
                                { value: 'delhivery', label: 'Delhivery' },
                                { value: 'ekart', label: 'Ekart' },
                                { value: 'ecom', label: 'Ecom' },
                                { value: 'xpressbees', label: 'Xpressbees' }
                            ]}
                        />
                        <SelectCustomLabelled
                            label="Status"
                            value={filters.status}
                            selectFunction={(val) => handleChange('status', val)}
                            options={[
                                { value: 'Pending', label: 'Pending' },
                                { value: 'shipped', label: 'Shipped' },
                                { value: 'Delivered', label: 'Delivered' },
                                { value: 'Cancelled', label: 'Cancelled' }
                            ]}
                        />
                        <SelectCustomLabelled
                            label="Payment Mode"
                            value={filters.paymentMode}
                            selectFunction={(val) => handleChange('paymentMode', val)}
                            options={[
                                { value: 'Cash On Delivery', label: 'Cash On Delivery' },
                                { value: 'UPI', label: 'UPI' },
                                { value: 'Credit Card', label: 'Credit Card' }
                            ]}
                        />
                        <InputCustomLabelled
                            label="Order ID"
                            value={filters.orderId}
                            inputFunction={(val) => handleChange('orderId', val)}
                        />
                        <InputCustomLabelled
                            label="Email ID"
                            value={filters.email}
                            inputFunction={(val) => handleChange('email', val)}
                        />
                        <InputCustomLabelled
                            type="date"
                            label="Date"
                            value={filters.date}
                            inputFunction={(val) => handleChange('date', val)}
                        />
                        <SelectCustomLabelled
                            label="Date Type"
                            value={filters.dateType}
                            selectFunction={(val) => handleChange('dateType', val)}
                            options={[
                                { value: 'createdOn', label: 'Created On' },
                                { value: 'transactionDate', label: 'Transaction Date' }
                            ]}
                        />
                    </div>
                </Container>

                <Container title={'Order List'}>
                    <div className="items-table">
                        <table id='table-detail'>
                            <thead>
                                <tr>
                                    <th>Item ID</th>
                                    <th>Date & Time</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Mode</th>
                                    <th>Customer</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    returnList.length === 0 ? (
                                        <tr><td colSpan="8" style={{ textAlign: 'center' }}>No returns found</td></tr>
                                    ) : (
                                        returnList.map((i) => (
                                            <tr key={i.ordersId} style={{ height: '70px' }}>
                                                <td>{i.ordersId}</td>
                                                <td><p>{i.createdOn}</p><p>{i.time}</p></td>
                                                <td><p>{i.type}</p></td>
                                                <td><p>{i.orderPrice}</p></td>
                                                <td><p>{i.paymentMode}</p></td>
                                                <td>
                                                    <div>
                                                        <strong style={{ fontSize: '15px', color: 'var(--dark-secondary-text)' }}>{i.user}</strong>
                                                        <p style={{ fontSize: "13px", fontWeight: '500', color: 'var(--secondary-text)' }}>{i.uid}</p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <p>{i.status}</p>
                                                </td>
                                                <td>
                                                    <div className="vs29">
                                                        <button style={{ color: 'blue' }} onClick={() => navigate(`${i.ordersId}`)}>
                                                            <FaEye />
                                                        </button>
                                                        <button style={{ color: 'green' }}>
                                                            <BiDownload />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                </Container>
            </div>
        </Layout>
    );
};

export default ReturnList;
