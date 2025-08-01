import React, { useEffect, useState } from 'react'
import Layout from 'src/layout'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Container from '@/components/ui/container'
import { MdEdit } from "react-icons/md";
import { IoMdEye } from 'react-icons/io';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useNavigate } from 'react-router-dom';


const ListOrders = () => {

    const [orderList, setOrderList] = useState([])
    const [loadingAPI, setLoadingAPI] = useState(true)

    const orderDetailList = [
        {
            id: 'ORD0321',
            ordersId: 'ORD0321',
            createdOn: '2025-07-22',
            time: '10:25',
            orderItemID: 'vvid33',
            deliveryCompany: 'delhivery',
            status: 'Delivered',
            deliveryTracking: 'DL123654789IN',
            uid: 'user_77441',
            username: 'Aarav Mehta',
            user: 'aarav.mehta@example.com',
            addressID: 'addr_1012',
            orderPrice: 5125,
            discount: 250,
            subTotal: 5375,
            type: 'in-house',
            invoiceID: 'INV-2025-0722-003',
            paymentStatus: 'paid',
            txnId: 'TXN99192HSJ812A',
            transactionDate: '2025-07-22',
            amountPaid: '5125',
            paymentMode: 'UPI',
            orderItemCount: 2,
            separateOrdersIDs: ['ITHY28A1O', 'ITHY28A2O']
        },
        {
            id: 'ORD0385',
            ordersId: 'ORD0385',
            createdOn: '2025-07-28',
            time: '14:10',
            orderItemID: 'vvid42',
            deliveryCompany: 'ekart',
            status: 'Pending',
            deliveryTracking: '',
            uid: 'user_88234',
            username: 'Neha Kapoor',
            user: 'neha.kapoor@example.com',
            addressID: 'addr_1033',
            orderPrice: 2149,
            discount: 0,
            subTotal: 2149,
            type: 'hybrid',
            invoiceID: 'INV-2025-0728-009',
            paymentStatus: 'cod',
            txnId: '',
            transactionDate: '',
            amountPaid: '0',
            paymentMode: 'Cash On Delivery',
            orderItemCount: 1,
            separateOrdersIDs: ['ITHY29Z1O']
        },
        {
            id: 'ORD0410',
            ordersId: 'ORD0410',
            createdOn: '2025-07-31',
            time: '17:55',
            orderItemID: 'vvid47',
            deliveryCompany: 'bluedart',
            status: 'Cancelled',
            deliveryTracking: 'BD872364598IN',
            uid: 'user_66720',
            username: 'Ritika Sinha',
            user: 'ritika.sinha@example.com',
            addressID: 'addr_1040',
            orderPrice: 3599,
            discount: 100,
            subTotal: 3699,
            type: 'vendor',
            invoiceID: 'INV-2025-0731-011',
            paymentStatus: 'cancelled',
            txnId: '',
            transactionDate: '',
            amountPaid: '0',
            paymentMode: 'UPI',
            orderItemCount: 3,
            separateOrdersIDs: ['ITHY30B1O', 'ITHY30B2O', 'ITHY30B3O']
        },
        {
            id: 'ORD0432',
            ordersId: 'ORD0432',
            createdOn: '2025-08-01',
            time: '11:05',
            orderItemID: 'vvid52',
            deliveryCompany: 'xpressbees',
            status: 'Shipped',
            deliveryTracking: 'XPB093847365IN',
            uid: 'user_55901',
            username: 'Kabir Verma',
            user: 'kabir.verma@example.com',
            addressID: 'addr_1060',
            orderPrice: 6820,
            discount: 820,
            subTotal: 7640,
            type: 'in-house',
            invoiceID: 'INV-2025-0801-001',
            paymentStatus: 'paid',
            txnId: 'TXN88292JJWE721C',
            transactionDate: '2025-08-01',
            amountPaid: '6820',
            paymentMode: 'Credit Card',
            orderItemCount: 5,
            separateOrdersIDs: ['ITHY31K1O', 'ITHY31K2O', 'ITHY31K3O', 'ITHY31K4O', 'ITHY31K5O']
        },
        {
            id: 'ORD0449',
            ordersId: 'ORD0449',
            createdOn: '2025-07-25',
            time: '09:20',
            orderItemID: 'vvid57',
            deliveryCompany: 'ecomexpress',
            status: 'Delivered',
            deliveryTracking: 'ECX837264193IN',
            uid: 'user_43892',
            username: 'Simran Kaur',
            user: 'simran.kaur@example.com',
            addressID: 'addr_1084',
            orderPrice: 2875,
            discount: 125,
            subTotal: 3000,
            type: 'vendor',
            invoiceID: 'INV-2025-0725-005',
            paymentStatus: 'paid',
            txnId: 'TXN17291LOPX632B',
            transactionDate: '2025-07-25',
            amountPaid: '2875',
            paymentMode: 'Net Banking',
            orderItemCount: 2,
            separateOrdersIDs: ['ITHY32Q1O', 'ITHY32Q2O']
        }
    ];


    useEffect(() => {
        setTimeout(() => {
            setOrderList(orderDetailList)
            setLoadingAPI(false)
        }, 5000);
    }, []);
    const navigate = useNavigate()

    return (
        <Layout active={'admin-orders-list'} title={'Orders List'}>
            <Container containerclass="bg-transparent">
                <Table className="border-separate border-spacing-y-2 ">
                    <TableHeader>
                        <TableRow className=" text-unique text-[16px] uppercase">
                            <TableHead className="pl-5">ORDER ID</TableHead>
                            <TableHead className="text-left pl-10">User Data</TableHead>
                            <TableHead className="text-center ">Count</TableHead>
                            <TableHead className="text-center">Amount</TableHead>
                            <TableHead className="text-center">Payment Type</TableHead>
                            <TableHead className="text-center">Ordered On</TableHead>
                            <TableHead className="pr-5 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="bg-white">

                        {
                            loadingAPI && orderList?.length === 0 && <TableRow>
                                <TableCell colSpan={7} className='rounded-[10px]'>

                                    <DotLottieReact
                                        src="https://lottie.host/15a4b106-bbe8-40d8-bb4e-834fb23fceae/I9HKWeP6l2.lottie"
                                        loop
                                        autoplay
                                        style={{ height: '200px', width: 'auto' }}
                                    />
                                </TableCell>
                            </TableRow>
                        }

                        {orderList?.length > 0 && !loadingAPI &&
                            orderList?.map((i, index) => (
                                <TableRow key={index} className="rounded-full bg-white  shadow-lg shadow-cyan-500/50">
                                    <TableCell className="rounded-l-[10px] font-bold py-5 pl-5 ">{i.ordersId}</TableCell>
                                    <TableCell className="text-center py-5 pl-10">
                                        <div className="flex gap-2 justify-start items-center">
                                            <img src='https://picsum.photos/400/300?random=1' className="h-[35px] w-[35px]  rounded-full" />
                                            <div className="flex flex-col justify-start items-start text-right">

                                                <p className='text-right font-medium '>{i.username}</p>
                                                <p className='font-light text-secondary-text max-w-[350px] truncate overflow-hidden whitespace-nowrap hover:text-dark-secondary-text cursor-pointer'>{i.user}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className=" text-center py-5 ">{i.orderItemCount}</TableCell>
                                    <TableCell className=" text-center py-5 ">{i.orderPrice}</TableCell>
                                    <TableCell
                                        className=" text-center py-5 max-w-[200px] truncate overflow-hidden whitespace-nowrap"
                                    >
                                        {i.paymentMode}
                                    </TableCell>
                                    <TableCell className=" text-center py-5">{i.createdOn}</TableCell>
                                    <TableCell className="rounded-r-[10px] text-center pr-5">
                                        <div className="flex-center gap-2">
                                            <button className='bg-green-600 cursor border-none text-white p-2 rounded-full flex-center' onClick={() => navigate('/orders/details')}><MdEdit style={{ width: '16px', height: '16px' }} /></button>
                                            <button className='bg-blue-600 cursor border-none text-white p-2 rounded-full flex-center' onClick={() => navigate('/orders/details')}><IoMdEye style={{ width: '16px', height: '16px' }} /></button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                        {!loadingAPI && orderList?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <div className="text-center py-8 text-lg text-muted-foreground">
                                        🚫 No Orders Found
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}


                    </TableBody>

                </Table>
            </Container>
        </Layout>
    )
}

export default ListOrders