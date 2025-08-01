import AddressList from '@/components/address/address.list'
import OrderItemTable from '@/components/orders/order.table'
import Container from '@/components/ui/container'
import InputUi from '@/components/ui/inputui'
import React, { useState } from 'react'
import Layout from 'src/layout'

const OrderDetail = () => {

    const orderDetailMain = {
        id: 'ORD0221',
        ordersId: 'ORD0221',
        createdOn: '2025-07-19',
        time: '15:45',
        orderItemID: 'vvid24',
        deliveryCompany: 'bluedart',
        status: 'shipped', // other values: Pending, Delivered, Cancelled
        deliveryTracking: 'BD123456789IN',
        uid: 'user_99881',
        username: 'Valid User',
        user: 'ravi.sharma@example.com',
        addressID: 'addr_1009',
        orderPrice: 3797, // 1398 + 2399
        discount: 300, // total discount across all items (optional field)
        subTotal: 4097,
        type: 'vendor', // vendor / in-house / hybrid
        invoiceID: 'INV-2025-0719-001',
        paymentStatus: 'cod',
        txnId: '',
        transactionDate: 'TXN21349NBSDF924B',
        amountPaid: '3797',
        paymentMode: 'Cash On Delivery',
        orderItemCount: 4,
        separateOrdersIDs: ['ITHY27B2O', 'ITHY27A2O', 'ITHY27C2O', 'ITHY27D2O'],
        items: [
            {
                id: 1,
                status: 'pending',
                sku: 'ITHY13',
                productID: 'cde223',
                vendor: 'vendor_4',
                featuredImage: 'https://picsum.photos/400/300?random=1',
                categoryName: 'Biking',
                orderItemID: 'vvid24',
                name: 'Classic Biker T-Shirt - Black',
                discount: 200,
                regularPrice: 799,
                quantity: 2,
                total: 1398,
                variationID: 'var-001',
                variationSlug: 'black-m',
                type: 'Variable'
            },
            {
                id: 2,
                status: 'pending',
                sku: 'ITHY13',
                productID: 'xdfg23',
                vendor: 'vendor_4',
                featuredImage: 'https://picsum.photos/400/300?random=1',
                categoryName: 'Biking',
                orderItemID: 'vvid24',
                name: 'Classic Biker T-Shirt - White',
                discount: 0,
                regularPrice: 799,
                quantity: 1,
                total: 799,
                variationID: 'var-002',
                variationSlug: 'white-l',
                type: 'Variable'
            },
            {
                id: 3,
                status: 'pending',
                sku: 'ITHY13',
                productID: 'nbg2344',
                vendor: 'vendor_3',
                featuredImage: 'https://picsum.photos/400/300?random=1',
                categoryName: 'Biking',
                orderItemID: 'vvid24',
                name: 'Custom Patch Jacket',
                discount: 100,
                regularPrice: 2499,
                quantity: 1,
                total: 2399,
                variationID: 'var-003',
                variationSlug: 'black-xl',
                type: 'Variable'
            }
        ],
        address: [
            { type: 'Work', line1: '56 Subhas Nagar', line2: 'A.K MukherJee Road', landmark: 'Noapara', city: 'Kolkata', state: 'West Bengal', pincode: '700090' },
        ]
    };

    const [order, setOrder] = useState(orderDetailMain)



    return (
        <Layout active={'admin-orders-detail'} title={'Order Detail'}>
            <div className="grid-cols-6 grid gap-2">
                <div className="col-span-4">
                    <div className="flex flex-col gap-2">
                        <Container label={'Order Information'} gap={10}>
                            <div className="grid grid-cols-2 gap-2">
                                <InputUi label={'Order ID'} value={order.ordersId} />
                                <InputUi label={'Username'} value={order.username} />
                                <InputUi label={'UID'} value={order.uid} />
                                <InputUi label={'Email ID'} value={order.user} />
                                <InputUi label={'Delivery Company'} value={order.deliveryCompany} />
                                <InputUi label={'Tracking Code'} value={order.deliveryTracking} />

                            </div>
                        </Container>
                        <OrderItemTable items={order.items} />
                    </div>
                </div>
                <div className="col-span-2">
                    <div className="flex flex-col gap-2">
                        <AddressList addressprop={order.address} />
                        <Container label={'Vendor Details'} gap={10}>
                            <div className="flex flex-col gap-2">
                                {
                                    order.items.map((i, index) => (
                                        <div className='py-3 px-4 border rounded-md bg-dark-text' key={index}>
                                            <p className='text-white'>
                                                {i.vendor}
                                            </p>
                                        </div>
                                    ))
                                }
                            </div>
                            <div className="flex-row flex justify-end gap-2">
                                <button className="primary-button">
                                    Notify Sellers
                                </button>
                                <button className="primary-button">
                                    Send Details
                                </button>
                            </div>
                        </Container>

                    </div>

                </div>
            </div>
        </Layout>
    )
}

export default OrderDetail