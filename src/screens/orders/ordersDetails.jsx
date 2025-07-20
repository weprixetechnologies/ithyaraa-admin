import React, { useState } from 'react'
import Layout from '../../layout'
import { orderDetailMain, orderItems } from './../ordersSchema'
import './orders.css'
import Container from '../../components/ui/container'
import SelectCustomLabelled from '../../components/ui/customSelect'
import InputCustomLabelled from '../../components/ui/customLabelledField'
import VendorManageSection from '../../components/orders/vendormanage'

const OrdersDetails = () => {

    const [details, setDetails] = useState(orderDetailMain)
    const [products, setProducts] = useState(orderItems)

    const updateDetails = (key, value) => {
        setDetails((prev) => ({ ...prev, [key]: value }));
    };
    const handleSelectChange = (field) => (value) => {
        setDetails((prev) => ({
            ...prev,
            [field]: value,
        }));
    };



    return (
        <Layout title={'Order Details'}>
            <div className="order-details-layout">
                <div className="inner-layout-order" id='left-inner-order'>
                    <Container gap={10} title={`Order ID #${details.ordersId}`}>
                        <div className="order-tpline-ol" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '10px 0', alignItems: 'center', width: '100%' }}>
                            <p id='vc24'>Date : {details.createdOn} at {details.time}</p>
                            <div className="">
                                <button id='vc25'>Print Invoice</button>
                            </div>
                        </div>
                        <div className="linked-products-count" style={{ gap: '10px', display: 'flex', flexDirection: 'row' }}>
                            <p>Linked Products : </p>
                            <section style={{ display: 'flex', flexDirection: 'row', gap: '7px' }}>
                                {
                                    products.map((i, index) => (
                                        <button id='vc26'> {i.productID}</button>
                                    ))
                                }
                            </section>
                        </div>
                        <div className="items-table">
                            <table id='table-detail'>
                                <thead>
                                    <tr>
                                        <th>SL</th>
                                        <th>Item Details</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Discount</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        products.map((i, index) => (
                                            <tr key={index}>
                                                <td>{i.id}</td>
                                                <td id='product-data-order'>
                                                    <div style={{
                                                        display: 'flex', flexDirection: 'row',
                                                        alignItems: 'center',
                                                        fontSize: '11px',
                                                        fontWeight: 500, gap: '10px'
                                                    }}>
                                                        <img src={i.featuredImage} alt="" style={{ width: '30px', height: '50px', borderRadius: '6px' }} />
                                                        <aside>
                                                            <p>{i.name}</p>
                                                            <p style={{ color: 'var(--secondary-text)' }}> <b>SKU</b>: {i.sku}</p>
                                                            <p style={{ color: 'var(--secondary-text)' }}>  {i.variationSlug}</p>
                                                        </aside>
                                                    </div>
                                                </td>
                                                <td style={{ color: 'var(--dark-secondary-text)', fontWeight: '500' }}>{i.quantity}</td>
                                                <td style={{ color: 'var(--dark-secondary-text)', fontWeight: '500' }}>{i.regularPrice}</td>
                                                <td style={{ color: 'var(--dark-secondary-text)', fontWeight: '500' }}>{i.discount}</td>
                                                <td style={{ color: 'var(--dark-secondary-text)', fontWeight: '500' }}>{(i.regularPrice * i.quantity) - i.discount}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                        <div className="orderDetails--summary-ra" style={{ display: 'flex', justifyContent: 'end', marginBottom: '40px' }}>
                            <section>
                                <div className='uyt2'>
                                    <b>
                                        Sub Total    </b> : <p className='detail-mnf24'>
                                        {details.subTotal}
                                    </p>

                                </div>
                                <div className='uyt2'>
                                    <b>
                                        Shipping    </b> : <p className='detail-mnf24'>
                                        {details.shippingCharge ? details.shippingCharge : 'Free Delivery'}
                                    </p>

                                </div>
                                <div className='uyt2'>
                                    <b>Discount</b> : <p className='detail-mnf24'>
                                        -{details.discount}
                                    </p>
                                </div>
                                <div className='uyt2'>
                                    <b>
                                        Total    </b> : <p className='detail-mnf24'>
                                        {details.orderPrice}
                                    </p>

                                </div>
                            </section>
                        </div>

                    </Container>
                    <Container gap={10} title={'Payments'}>
                        <div className="pregrid-wrapper" style={{ gridTemplateColumns: '2fr 2fr' }}>
                            <InputCustomLabelled
                                label='INVOICE ID'
                                value={details.invoiceID}
                                inputFunction={(val) => updateDetails('invoiceID', val)}
                            />
                            <InputCustomLabelled
                                label='Transaction Date'
                                value={details.createdOn}
                                inputFunction={(val) => updateDetails('createdOn', val)}
                                type="date"
                            />
                        </div>

                        <div className="pregrid-wrapper" style={{ gridTemplateColumns: '2fr 2fr' }}>
                            <InputCustomLabelled
                                label='Amount Payment'
                                value={details.orderPrice}
                                inputFunction={(val) => updateDetails('orderPrice', val)}
                                type="number"
                            />
                            <InputCustomLabelled
                                label='Payment Mode'
                                value={details.paymentMode}
                                inputFunction={(val) => updateDetails('paymentMode', val)}
                            />
                        </div>
                    </Container>

                    <Container gap={10} title={'Shipment & Status'}>
                        <div className="pregrid-wrapper" style={{ gridTemplateColumns: '2fr 2fr' }}>
                            <SelectCustomLabelled
                                label='Change Order Status'
                                value={details.status}
                                selectFunction={handleSelectChange('status')}
                                options={[
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'shipped', label: 'Shipped' },
                                    { value: 'ready_to_ship', label: 'Ready to Ship' },
                                    { value: 'cancelled', label: 'Cancelled' },
                                    { value: 'return', label: 'Return' },
                                    { value: 'delivered', label: 'Delivered' },
                                ]} />
                            <SelectCustomLabelled
                                label='Payment Status'
                                value={details.paymentStatus}
                                selectFunction={handleSelectChange('paymentStatus')}
                                options={[
                                    { value: 'prepaid', label: 'Prepaid' },
                                    { value: 'cod', label: 'Cash on Delivery' },
                                ]}
                            />
                        </div>

                        <div style={{ height: '15px' }}></div>

                        <div className="pregrid-wrapper" style={{ gridTemplateColumns: '2fr 2fr' }}>
                            <SelectCustomLabelled
                                label='Shipping Company'
                                value={details.deliveryCompany}
                                selectFunction={handleSelectChange('deliveryCompany')}
                                options={[
                                    { value: 'delhivery', label: 'Delhivery' },
                                    { value: 'ekart', label: 'Ekart' },
                                    { value: 'bluedart', label: 'Blue Dart' },
                                    { value: 'ecom_express', label: 'Ecom Express' },
                                    { value: 'india_post', label: 'India Post' },
                                    { value: 'xpressbees', label: 'XpressBees' },
                                    { value: 'dtdc', label: 'DTDC' },
                                    { value: 'shadowfax', label: 'Shadowfax' },
                                    { value: 'wow_express', label: 'Wow Express' },]}
                            />
                            <InputCustomLabelled
                                label='Enter Tracking ID'
                                value={details.deliveryTracking}
                                inputFunction={(val) => updateDetails('deliveryTracking', val)}
                            />
                        </div>
                    </Container>




                </div>
                <div className="inner-layout-order" id='right-inner-order'>
                    {
                        details.status == 'pending' && details.type == 'vendor' &&
                        <marquee behavior="" direction="" style={{ color: 'red ' }}>Order Still not accepted by the vendor</marquee>
                    }
                    <VendorManageSection orderItems={orderItems} />

                    <Container gap={10} title={'Customer Details'}>
                        <div className='uyt2' style={{ justifyContent: 'space-between' }}>
                            <b>Username : </b>  <p >
                                Ronit Sarkar
                            </p>
                        </div>
                        <div className='uyt2' style={{ justifyContent: 'space-between' }}>
                            <b>UID : </b>  <p >
                                {details.uid}
                            </p>
                        </div>
                        <div className='uyt2' style={{ justifyContent: 'space-between' }}>
                            <b>Email Address : </b>  <p >
                                weprixeofficial@gmail.com
                            </p>
                        </div>
                        <div className='uyt2' style={{ justifyContent: 'space-between' }}>
                            <b>Phone Number : </b>  <p >
                                +91 74393 98783
                            </p>
                        </div>
                    </Container>
                    <Container gap={10} title={'Shipping Address'}>
                        <div className='uyt2' style={{ alignItems: 'end' }}>
                            <b>Address Line 1 : </b>  <p style={{ fontFamily: 'var(--f2)', fontWeight: '600', color: 'var(--secondary-text)', fontSize: '13px' }} >
                                56 Subhas Nagar
                            </p>
                        </div>
                        <div className='uyt2' style={{ alignItems: 'end' }}>
                            <b>Address Line 2 : </b>  <p style={{ fontFamily: 'var(--f2)', fontWeight: '600', color: 'var(--secondary-text)', fontSize: '13px' }} >
                                A.K Mukherjee LKane
                            </p>
                        </div>
                        <div className='uyt2' style={{ alignItems: 'end' }}>
                            <b>Landmark: </b>  <p style={{ fontFamily: 'var(--f2)', fontWeight: '600', color: 'var(--secondary-text)', fontSize: '13px' }} >
                                56 Subhas Nagar
                            </p>
                        </div>
                        <div className='uyt2' style={{ alignItems: 'end' }}>
                            <b>Pincode: </b>  <p style={{ fontFamily: 'var(--f2)', fontWeight: '600', color: 'var(--secondary-text)', fontSize: '13px' }} >
                                700090
                            </p>
                        </div>
                        <div className='uyt2' style={{ alignItems: 'end' }}>
                            <b>City / Town : </b>  <p style={{ fontFamily: 'var(--f2)', fontWeight: '600', color: 'var(--secondary-text)', fontSize: '13px' }} >
                                Hyper City
                            </p>
                        </div>
                        <div className='uyt2' style={{ alignItems: 'end' }}>
                            <b>State : </b>  <p style={{ fontFamily: 'var(--f2)', fontWeight: '600', color: 'var(--secondary-text)', fontSize: '13px' }} >
                                Telangana
                            </p>
                        </div>
                    </Container>
                    <Container gap={10} title={'Billing Address'}>
                        <div className='uyt2' style={{ alignItems: 'end' }}>
                            <b>Address Line 1 : </b>  <p style={{ fontFamily: 'var(--f2)', fontWeight: '600', color: 'var(--secondary-text)', fontSize: '13px' }} >
                                56 Subhas Nagar
                            </p>
                        </div>
                        <div className='uyt2' style={{ alignItems: 'end' }}>
                            <b>Address Line 2 : </b>  <p style={{ fontFamily: 'var(--f2)', fontWeight: '600', color: 'var(--secondary-text)', fontSize: '13px' }} >
                                A.K Mukherjee LKane
                            </p>
                        </div>
                        <div className='uyt2' style={{ alignItems: 'end' }}>
                            <b>Landmark: </b>  <p style={{ fontFamily: 'var(--f2)', fontWeight: '600', color: 'var(--secondary-text)', fontSize: '13px' }} >
                                56 Subhas Nagar
                            </p>
                        </div>
                        <div className='uyt2' style={{ alignItems: 'end' }}>
                            <b>Pincode: </b>  <p style={{ fontFamily: 'var(--f2)', fontWeight: '600', color: 'var(--secondary-text)', fontSize: '13px' }} >
                                700090
                            </p>
                        </div>
                        <div className='uyt2' style={{ alignItems: 'end' }}>
                            <b>City / Town : </b>  <p style={{ fontFamily: 'var(--f2)', fontWeight: '600', color: 'var(--secondary-text)', fontSize: '13px' }} >
                                Hyper City
                            </p>
                        </div>
                        <div className='uyt2' style={{ alignItems: 'end' }}>
                            <b>State : </b>  <p style={{ fontFamily: 'var(--f2)', fontWeight: '600', color: 'var(--secondary-text)', fontSize: '13px' }} >
                                Telangana
                            </p>
                        </div>
                    </Container>
                    <button id='vc25' onClick={() => console.log({ ...details, orderItems: orderItems })}>
                        Update Order Details & Notify
                    </button>
                    <button id='vc26'>
                        Send Order Details via Email
                    </button>
                </div>
            </div >
        </Layout >
    )
}

export default OrdersDetails