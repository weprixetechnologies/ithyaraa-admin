import React, { useState } from 'react'
import './returns.css'
import Layout from '../../layout'
import Container from '../../components/ui/container'
import InputCustomLabelled from '../../components/ui/customLabelledField'
import { returnDetailsMains, storeDetails } from './../ordersSchema'
import { returnItems } from './../ordersSchema'
import VendorManageSection from '../../components/orders/vendormanage'
import VendorDetails from '../../components/ui/vendorDetails'

const ReturnDetails = () => {
    const [details, setDetails] = useState(returnDetailsMains)
    const [products, setProducts] = useState(returnItems)

    return (
        <Layout active={'admin-returns-all'} title={"Returns & Refunds Details"}>
            <div className="return-detail-layout">
                <div className="inner-page-layout-left-return">
                    <Container title={'Return Summary'} gap={10}>
                        <div className="summary-grid" style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr' }}>
                            <div>
                                <strong>Return ID:</strong>
                                <p>{details?.returnID || 'N/A'}</p>
                            </div>
                            <div>
                                <strong>Return Date:</strong>
                                <p>{details?.createdOn || 'N/A'}</p>
                            </div>
                            <div>
                                <strong>Status:</strong>
                                <p>{details?.status || 'N/A'}</p>
                            </div>
                            <div>
                                <strong>Order ID:</strong>
                                <p>{details?.ordersId || 'N/A'}</p>
                            </div>
                        </div>
                    </Container>

                    <Container title={'Reason by Customer'}>
                        <InputCustomLabelled isLabel={false} isInput={false} placeholder='' value={details.customerReason} height={200} />
                    </Container>
                    <VendorDetails vendor={storeDetails} />

                </div>
                <div className="inner-page-layout-right-return">
                    <Container gap={16} title={'Product Details'}>
                        <div
                            className="product-details"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 2fr',
                                gap: '24px',
                                alignItems: 'center',
                                padding: '12px 0',
                            }}
                        >
                            {/* Product Image */}
                            <div className="productImage" style={{ width: '100%' }}>
                                <img
                                    src={products.featuredImage}
                                    alt={products.name}
                                    style={{
                                        width: '100%',
                                        borderRadius: '12px',
                                        boxShadow: '0 6px 14px rgba(0, 0, 0, 0.1)',
                                        objectFit: 'cover',
                                    }}
                                />
                            </div>

                            {/* Product Info */}
                            <div className="productDetals--return" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <p style={{ fontSize: '13px', fontWeight: '600', color: 'gray' }}>
                                    Product ID: <span style={{ fontWeight: '400' }}>{products.productID}</span>
                                </p>

                                <h2 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>
                                    {products.name}
                                </h2>

                                <div className="summary-grid" style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr' }}>
                                    <div>
                                        <strong>Return ID:</strong>
                                        <p>{details?.returnID || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <strong>Return Date:</strong>
                                        <p>{details?.createdOn || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <strong>Status:</strong>
                                        <p>{details?.status || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <strong>Order ID:</strong>
                                        <p>{details?.ordersId || 'N/A'}</p>
                                    </div>
                                </div>
                                <p style={{ fontSize: '16px', fontWeight: '600', color: '#000' }}>
                                    Total Paid: ₹{products.total}
                                </p>
                            </div>
                        </div>
                    </Container>


                </div>
            </div>
        </Layout>
    )
}

export default ReturnDetails