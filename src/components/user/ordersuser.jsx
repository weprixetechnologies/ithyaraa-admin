import React, { useState } from 'react';
import { FaCaretDown, FaCaretUp } from "react-icons/fa";

const OrdersUser = ({ order, backgroundcolor }) => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleDropdown = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className='ordersuser'>
            {
                order?.map((i, index) => (
                    <div className="ordersuser-main-child" style={{ background: backgroundcolor || 'var(--primary-color)', borderRadius: '8px' }} key={index}>
                        <div
                            className="ordersuser-child"
                            onClick={() => toggleDropdown(index)}
                            style={{ cursor: 'pointer', color: '#fff' }}
                        >
                            <section style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '10px',
                                alignItems: 'center'
                            }}>
                                <b>#{i.orderDetails?.id}</b>
                                <div>
                                    {i.orderProducts.map((op, idx) => (
                                        <img
                                            key={idx}
                                            src={op.featuredImage.imageUrl}
                                            alt={op.featuredImage.imageAlt}
                                            style={{
                                                height: '30px',
                                                width: '30px',
                                                borderRadius: '50%',
                                                marginLeft: idx === 0 ? 0 : '-15px'
                                            }}
                                        />
                                    ))}
                                </div>
                                <p>(Includes {i.orderProducts.length} Products )</p>
                                <p>(Price: {i.orderDetails.subtotal} {i.orderDetails.status}  )</p>
                            </section>
                            {openIndex === index ? <FaCaretUp /> : <FaCaretDown />}
                        </div>

                        {openIndex === index && (
                            <div className="order-details-dropdown" style={{ marginTop: '10px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                                <>

                                    {
                                        i.orderProducts.map((p, index) => (
                                            <div className="odw-child">
                                                <div style={{ flexDirection: 'row', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <img className='pfeatured' src={p.featuredImage.imageUrl} alt={p.featuredImage.imageAlt}></img>
                                                    <div className="" style={{ display: 'flex', flexDirection: 'column' }}>

                                                        <p className="pname">{p.productName}</p>
                                                        <p className="psku">{p.skuID}</p>
                                                    </div>
                                                </div>
                                                <div className="" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                    <p className="pprice">
                                                        {p.amount}
                                                    </p>
                                                    <p className="poffer">
                                                        <b> Offer Applied : </b> {p.offerName}
                                                    </p>
                                                </div>

                                            </div>
                                        ))
                                    }
                                </>
                                <hr />
                                <div className="orderDetails-pww">
                                    <div className="orderDetails-pww-child">
                                        <span style={{ color: '#000' }}><b>Item Total</b></span>
                                        <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'var(--f2)', color: 'green' }}>{i.orderDetails.regularPrice}</span>
                                    </div>
                                    <div className="orderDetails-pww-child">
                                        <span style={{ color: '#000' }}><b>Shipping Charges</b></span>
                                        {
                                            i.orderDetails.shippingCharge > 0 ? <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'var(--f2)' }}> +{i.orderDetails.shippingCharge}</span> : <p style={{ color: 'green' }}>Free Delivery</p>
                                        }
                                    </div>
                                    <div className="orderDetails-pww-child">
                                        <span style={{ color: '#000' }}><b>Discount Applied</b></span>
                                        <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'var(--f2)', color: 'red' }}>- {i.orderDetails.discountApplied}</span>
                                    </div>
                                    <hr />
                                    <div className="orderDetails-pww-child">
                                        <span style={{ color: '#000', fontSize: '20px' }}><b>Sub Total</b></span>
                                        <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'var(--f2)', color: 'green' }}><b> {i.orderDetails.regularPrice + i.orderDetails.shippingCharge - i.orderDetails.discountApplied}   </b> </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            }
        </div>
    );
};

export default OrdersUser;
