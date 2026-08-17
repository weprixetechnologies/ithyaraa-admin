import Container from '@/components/ui/container'
import InputUi from '@/components/ui/inputui'
import React, { useState, useEffect, useCallback } from 'react'
import Layout from 'src/layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useParams, useNavigate } from 'react-router-dom'
import { getOrderDetails, updateOrderStatus, updatePaymentStatus, downloadInvoice, emailInvoice, updateOrderItemsTracking, recheckOrderPaymentStatus } from '@/lib/api/ordersApi'
import { FaDownload, FaTruck, FaCreditCard, FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone, FaSpinner, FaSync } from 'react-icons/fa'
const OrderDetail = () => {
    const { orderId } = useParams()
    const navigate = useNavigate()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [emailing, setEmailing] = useState(false)
    const [newOrderStatus, setNewOrderStatus] = useState('')
    const [newPaymentStatus, setNewPaymentStatus] = useState('')
    const [selectedItem, setSelectedItem] = useState(null)
    const [showItemModal, setShowItemModal] = useState(false)
    const [editedItems, setEditedItems] = useState({})
    const [savingTracking, setSavingTracking] = useState(false)
    const [recheckingPayment, setRecheckingPayment] = useState(false)

    const fetchOrderDetails = useCallback(async () => {
        try {
            setLoading(true)
            const response = await getOrderDetails(orderId)
            if (response.success) {
                setOrder(response.data)
                setNewOrderStatus(response.data.orderStatus || '')
                setNewPaymentStatus(response.data.paymentStatus || '')
                // Initialize editedItems with current tracking data
                const initial = {}
                if (response.data.items) {
                    response.data.items.forEach((it, idx) => {
                        initial[idx] = {
                            name: it.name,
                            variationName: it.variationName || '',
                            trackingCode: it.trackingCode || '',
                            deliveryCompany: it.deliveryCompany || '',
                            itemStatus: it.itemStatus || 'pending',
                            returnStatus: it.returnStatus || 'none',
                            returnTrackingCode: it.returnTrackingCode || '',
                            returnDeliveryCompany: it.returnDeliveryCompany || ''
                        }
                    })
                }
                setEditedItems(initial)
            } else {
                alert('Order not found')
                navigate('/orders/list')
            }
        } catch (error) {
            console.error('Error fetching order details:', error)
            alert('Failed to load order details')
            navigate('/orders/list')
        } finally {
            setLoading(false)
        }
    }, [orderId, navigate])

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails()
        }
    }, [orderId, fetchOrderDetails])

    const handleUpdateOrderStatus = async () => {
        if (!newOrderStatus || newOrderStatus.toLowerCase() === (order.orderStatus?.toLowerCase())) return

        try {
            setUpdating(true)
            const response = await updateOrderStatus(orderId, newOrderStatus)
            if (response.success) {
                setOrder(prev => ({ ...prev, orderStatus: newOrderStatus }))
                alert('Order status updated successfully')
            } else {
                alert('Failed to update order status')
            }
        } catch (error) {
            console.error('Error updating order status:', error)
            alert('Failed to update order status')
        } finally {
            setUpdating(false)
        }
    }

    const handleUpdatePaymentStatus = async () => {
        if (!newPaymentStatus || newPaymentStatus.toLowerCase() === (order.paymentStatus?.toLowerCase())) return

        try {
            setUpdating(true)
            const response = await updatePaymentStatus(orderId, newPaymentStatus)
            if (response.success) {
                setOrder(prev => ({ ...prev, paymentStatus: newPaymentStatus }))
                alert('Payment status updated successfully')
            } else {
                alert('Failed to update payment status')
            }
        } catch (error) {
            console.error('Error updating payment status:', error)
            alert('Failed to update payment status')
        } finally {
            setUpdating(false)
        }
    }

    const handleRecheckPaymentStatus = async () => {
        try {
            setRecheckingPayment(true)
            const response = await recheckOrderPaymentStatus(orderId)
            if (response.success) {
                // Refresh order details to get updated status
                await fetchOrderDetails()

                if (response.updated) {
                    alert(`Payment status updated! New status: ${response.latestStatus.orderStatus}`)
                } else {
                    alert(`Payment status checked. Current status: ${response.latestStatus.orderStatus}\n${response.latestStatus.statusMessage}`)
                }
            } else {
                alert(response.message || 'Failed to check payment status')
            }
        } catch (error) {
            console.error('Error re-checking payment status:', error)
            alert(error.response?.data?.message || 'Failed to check payment status with PhonePe')
        } finally {
            setRecheckingPayment(false)
        }
    }

    const handleDownloadInvoice = async () => {
        try {
            setDownloading(true)
            await downloadInvoice(orderId)
            alert('Invoice download started')
        } catch (error) {
            console.error('Error downloading invoice:', error)
            alert('Failed to download invoice')
        } finally {
            setDownloading(false)
        }
    }

    const handleEmailInvoice = async () => {
        try {
            setEmailing(true)
            const response = await emailInvoice(orderId)
            if (response.success) {
                alert(`Invoice sent successfully to ${response.email}`)
            } else {
                alert(response.message || 'Failed to send invoice')
            }
        } catch (error) {
            console.error('Error emailing invoice:', error)
            alert('Failed to send invoice')
        } finally {
            setEmailing(false)
        }
    }

    const handleChangeItem = (index, field, value) => {
        setEditedItems(prev => ({
            ...prev,
            [index]: {
                ...prev[index],
                [field]: value
            }
        }))
    }

    const handleSaveTracking = async () => {
        try {
            setSavingTracking(true)
            const payloadItems = Object.values(editedItems).map(it => ({
                name: it.name,
                variationName: it.variationName || undefined,
                trackingCode: it.trackingCode || null,
                deliveryCompany: it.deliveryCompany || null,
                itemStatus: it.itemStatus || undefined,
                returnStatus: it.returnStatus || undefined,
                returnTrackingCode: it.returnTrackingCode || undefined,
                returnDeliveryCompany: it.returnDeliveryCompany || undefined
            }))

            console.log('Saving tracking with payload:', payloadItems)

            const response = await updateOrderItemsTracking(orderId, payloadItems)

            if (response.success) {
                // Update the order items with new tracking info
                setOrder(prev => ({
                    ...prev,
                    items: (prev.items || []).map((it, idx) => ({
                        ...it,
                        trackingCode: editedItems[idx]?.trackingCode || '',
                        deliveryCompany: editedItems[idx]?.deliveryCompany || '',
                        itemStatus: editedItems[idx]?.itemStatus || it.itemStatus,
                        returnStatus: editedItems[idx]?.returnStatus || it.returnStatus,
                        returnTrackingCode: editedItems[idx]?.returnTrackingCode || it.returnTrackingCode,
                        returnDeliveryCompany: editedItems[idx]?.returnDeliveryCompany || it.returnDeliveryCompany
                    }))
                }))
                alert(`Tracking info saved successfully! Updated ${response.updatedCount || payloadItems.length} items.`)
            } else {
                alert(response.message || 'Failed to save tracking info')
            }
        } catch (error) {
            console.error('Error saving tracking:', error)
            alert(error.response?.data?.message || 'Failed to save tracking info. Please check console for details.')
        } finally {
            setSavingTracking(false)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price || 0)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Preparing': return 'bg-yellow-100 text-yellow-800'
            case 'Shipped': return 'bg-blue-100 text-blue-800'
            case 'Delivered': return 'bg-green-100 text-green-800'
            case 'Cancelled': return 'bg-red-100 text-red-800'
            case 'Returned': return 'bg-orange-100 text-orange-800'
            default: return 'bg-gray-100 text-foreground'
        }
    }

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'successful': return 'bg-green-100 text-green-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'failed': return 'bg-red-100 text-red-800'
            case 'refunded': return 'bg-purple-100 text-purple-800'
            default: return 'bg-gray-100 text-foreground'
        }
    }

    const handleItemClick = (item) => {
        setSelectedItem(item)
        setShowItemModal(true)
    }

    const closeItemModal = () => {
        setShowItemModal(false)
        setSelectedItem(null)
    }

    if (loading) {
        return (
            <Layout active={'admin-orders-detail'} title={'Order Detail'}>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-secondary-text">Loading order details...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (!order) {
        return (
            <Layout active={'admin-orders-detail'} title={'Order Detail'}>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-red-600 text-lg">Order not found</p>
                        <button
                            onClick={() => navigate('/orders/list')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Back to Orders
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }



    return (
        <Layout active={'admin-orders-detail'} title={`Order Detail #${order.orderID}`}>
            <div className="grid-cols-6 grid gap-6">
                <div className="col-span-4">
                    <div className="flex flex-col gap-4">
                        {/* Order Information */}
                        <Container label={'Order Information'} gap={3}>
                            <div className="grid grid-cols-2 gap-4">
                                <InputUi label={'Order ID'} value={`#${order.orderID}`} readOnly />
                                <InputUi label={'Order Date'} value={formatDate(order.createdAt)} readOnly />
                                <InputUi label={'Payment Mode'} value={order.paymentMode} readOnly />
                                <InputUi label={'Total Amount'} value={formatPrice(order.total)} readOnly />
                            </div>
                        </Container>

                        {/* Order Items */}
                        <Container label={'Order Items'} gap={3}>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-foreground"></h3>
                                <button
                                    onClick={handleSaveTracking}
                                    disabled={savingTracking}
                                    className={`px-4 py-2 rounded flex items-center gap-2 text-sm ${savingTracking
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                        } text-white`}
                                >
                                    {savingTracking ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FaTruck />
                                            Save Tracking Info
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-left py-4 px-4 font-bold text-gray-900 border-b">Product Description</th>
                                            <th className="text-center py-4 px-4 font-bold text-gray-900 border-b">Qty</th>
                                            <th className="text-right py-4 px-4 font-bold text-gray-900 border-b">Sale Price</th>
                                            <th className="text-right py-4 px-4 font-bold text-gray-900 border-b">Subtotal</th>
                                            <th className="text-left py-4 px-4 font-bold text-gray-900 border-b">Tracking / Logistics</th>
                                            <th className="text-left py-4 px-4 font-bold text-gray-900 border-b">Item Status</th>
                                            <th className="text-left py-4 px-4 font-bold text-gray-900 border-b">Return Type</th>
                                            <th className="text-left py-4 px-4 font-bold text-gray-900 border-b">Return Management</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items?.map((item, index) => (
                                            <React.Fragment key={index}>
                                                {/* Main Item Row */}
                                                <tr
                                                    className={`border-b hover:bg-background transition-colors ${item.comboItems && item.comboItems.length > 0 ? 'cursor-pointer' : ''}`}
                                                    onClick={() => {
                                                        if (item.comboItems && item.comboItems.length > 0) {
                                                            handleItemClick(item);
                                                        }
                                                    }}
                                                >
                                                    <td className="py-4 px-4 align-top" onClick={(e) => {
                                                        if (!item.comboItems || item.comboItems.length === 0) {
                                                            handleItemClick(item);
                                                        } else {
                                                            e.stopPropagation();
                                                        }
                                                    }}>
                                                        <div className="flex items-start space-x-3">
                                                            <div className="relative flex-shrink-0">
                                                                <img
                                                                    src={item.featuredImage?.[0]?.imgUrl || item.featuredImage?.[0] || '/placeholder-product.jpg'}
                                                                    alt={item.name}
                                                                    className="w-14 h-14 object-cover rounded-lg border border-gray-100 shadow-sm"
                                                                />
                                                                {item.brandName && (
                                                                    <div className="absolute -bottom-1 -left-1 bg-white border border-gray-100 px-1 py-0.5 rounded text-[8px] font-bold text-gray-500 shadow-sm uppercase tracking-tighter shadow-sm">{item.brandName}</div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{item.name}</p>
                                                                    {item.comboItems && item.comboItems.length > 0 && (
                                                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Combo</span>
                                                                    )}
                                                                </div>
                                                                {item.variationName && (
                                                                    <p className="text-[11px] text-gray-600 mt-0.5 font-medium">{item.variationName}</p>
                                                                )}
                                                                {item.custom_inputs && Object.keys(item.custom_inputs).length > 0 && (
                                                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                                                        {Object.entries(item.custom_inputs).map(([key, value]) => (
                                                                            <span key={key} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9px] font-medium">
                                                                                {key}: {value}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-center align-top">
                                                        <span className="inline-flex items-center justify-center w-7 h-7 bg-gray-50 border border-gray-100 rounded-full text-xs font-bold text-gray-700">
                                                            {item.quantity}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right align-top whitespace-nowrap text-xs text-gray-600">
                                                        {formatPrice(item.salePrice || item.regularPrice || 0)}
                                                    </td>
                                                    <td className="py-4 px-4 text-right align-top whitespace-nowrap font-bold text-sm text-gray-900">
                                                        {formatPrice(item.lineTotalAfter || (item.salePrice || item.regularPrice || 0) * item.quantity)}
                                                    </td>
                                                    <td className="py-4 px-4 text-left align-top" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex flex-col gap-2 min-w-[150px]">
                                                            <div className="relative group">
                                                                <input
                                                                    type="text"
                                                                    value={(editedItems[index]?.trackingCode || '')}
                                                                    onChange={(e) => handleChangeItem(index, 'trackingCode', e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    placeholder="Tracking Code"
                                                                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-[11px] bg-white hover:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
                                                                />
                                                            </div>
                                                            <div className="relative group">
                                                                <input
                                                                    type="text"
                                                                    value={(editedItems[index]?.deliveryCompany || '')}
                                                                    onChange={(e) => handleChangeItem(index, 'deliveryCompany', e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    placeholder="Courier Name"
                                                                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-[11px] bg-white hover:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-left align-top" onClick={(e) => e.stopPropagation()}>
                                                        {(!item.brandID || item.brandID === 'inhouse' || item.brandName?.toLowerCase() === 'inhouse') ? (
                                                            <select
                                                                value={editedItems[index]?.itemStatus || 'pending'}
                                                                onChange={(e) => handleChangeItem(index, 'itemStatus', e.target.value)}
                                                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-[11px] bg-white shadow-sm focus:ring-blue-500 font-bold uppercase transition-all"
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="preparing">Preparing</option>
                                                                <option value="shipped">Shipped</option>
                                                                <option value="delivered">Delivered</option>
                                                            </select>
                                                        ) : (
                                                            <div className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                                                item.itemStatus === 'delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                                                                item.itemStatus === 'shipped' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                                'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                            }`}>
                                                                {item.itemStatus || 'Pending'}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-4 text-left align-top" onClick={(e) => e.stopPropagation()}>
                                                         {/* Return Type Column */}
                                                         {item.returnStatus && item.returnStatus !== 'none' ? (
                                                             <div className="flex flex-col gap-1">
                                                                 <div className={`px-2 py-0.5 rounded text-[10px] font-black border shadow-sm w-fit text-center uppercase tracking-wider ${
                                                                     item.returnType === 'replacement' ? 'bg-blue-600 text-white border-blue-700' :
                                                                     item.returnType === 'refund' ? 'bg-purple-600 text-white border-purple-700' :
                                                                     'bg-gray-100 text-gray-600 border-gray-200'
                                                                 }`}>
                                                                     {item.returnType || 'N/A'}
                                                                 </div>
                                                                 {item.returnType === 'replacement' && item.replacementOrderID && (
                                                                     <a href={`/orders/details/${item.replacementOrderID}`} target="_blank" rel="noreferrer" className="text-[9px] text-blue-600 underline font-bold">LINK ORDER</a>
                                                                 )}
                                                             </div>
                                                         ) : (
                                                             <span className="text-xs text-gray-400">—</span>
                                                         )}
                                                    </td>
                                                    <td className="py-4 px-4 text-left align-top" onClick={(e) => e.stopPropagation()}>
                                                         {['return_approval', 'refund_approval', 'replacement_approval'].includes(item.returnStatus) ? (
                                                             <div className="flex flex-col gap-2 bg-red-50/50 p-2 rounded border border-red-100 shadow-inner">
                                                                 <span className="text-[10px] font-bold text-red-600 animate-pulse uppercase tracking-tight">
                                                                     {item.returnStatus.replace('_', ' ')}
                                                                 </span>
                                                                 <p className="text-[9px] text-gray-500 italic leading-none font-medium">Wait for Admin Approval in Return Queries</p>
                                                             </div>
                                                         ) : (!item.brandID || item.brandID === 'inhouse' || item.brandName?.toLowerCase() === 'inhouse') ? (
                                                             <div className="flex flex-col gap-2 min-w-[150px]">
                                                                 {(editedItems[index]?.returnStatus && !['none', 'returnRejected'].includes(editedItems[index]?.returnStatus)) ? (
                                                                     <div className="flex flex-col gap-2">
                                                                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Return Type</p>
                                                                         <select
                                                                             value={editedItems[index]?.returnType || 'refund'}
                                                                             onChange={(e) => handleChangeItem(index, 'returnType', e.target.value)}
                                                                             className="w-full px-2 py-1.5 border border-gray-200 rounded text-[11px] bg-blue-50 font-black uppercase transition-all shadow-sm focus:ring-blue-500 mb-1"
                                                                         >
                                                                             <option value="refund">REFUND</option>
                                                                             <option value="replacement">REPLACEMENT</option>
                                                                         </select>
                                                                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Status Action</p>
                                                                         <select
                                                                             value={editedItems[index]?.returnStatus}
                                                                             onChange={(e) => handleChangeItem(index, 'returnStatus', e.target.value)}
                                                                             className="w-full px-2 py-1.5 border border-gray-200 rounded text-[11px] bg-white font-bold uppercase transition-all shadow-sm focus:ring-blue-500"
                                                                         >
                                                                              <option value="return_initiated">Return initiated</option>
                                                                              <option value="return_picked">Return picked</option>
                                                                              <option value="returned">Returned</option>
                                                                              {(editedItems[index]?.returnType || item.returnType) === 'replacement' ? (
                                                                                <>
                                                                                  <option value="replacement_processing">Replacement processing</option>
                                                                                  <option value="replacement_shipped">Replacement pending</option>
                                                                                  <option value="replacement_complete">Replacement complete</option>
                                                                                </>
                                                                              ) : (
                                                                                <>
                                                                                  <option value="refund_pending">Refund pending</option>
                                                                                  <option value="refund_completed">Refund completed</option>
                                                                                </>
                                                                              )}
                                                                              <option value="returnRejected">Return Rejected</option>
                                                                         </select>
                                                                         <div className="flex flex-col gap-1">
                                                                            <input
                                                                                type="text"
                                                                                value={(editedItems[index]?.returnTrackingCode || '')}
                                                                                onChange={(e) => handleChangeItem(index, 'returnTrackingCode', e.target.value)}
                                                                                placeholder="Return Tracking"
                                                                                className="w-full px-2 py-1 border border-gray-200 rounded text-[10px]"
                                                                            />
                                                                            <select
                                                                                value={editedItems[index]?.returnDeliveryCompany || ''}
                                                                                onChange={(e) => handleChangeItem(index, 'returnDeliveryCompany', e.target.value)}
                                                                                className="w-full px-2 py-1 border border-gray-200 rounded text-[10px] bg-white"
                                                                            >
                                                                                <option value="">Courier</option>
                                                                                <option value="Delhivery">Delhivery</option>
                                                                                <option value="BlueDart">Blue Dart</option>
                                                                                <option value="EcomExpress">Ecom Express</option>
                                                                                <option value="DTDC">DTDC</option>
                                                                                <option value="Xpressbees">Xpressbees</option>
                                                                                <option value="Shadowfax">Shadowfax</option>
                                                                                <option value="IndiaPost">India Post</option>
                                                                                <option value="Other">Other</option>
                                                                            </select>
                                                                         </div>
                                                                     </div>
                                                                 ) : (
                                                                     (editedItems[index]?.itemStatus === 'delivered') ? (
                                                                         <button
                                                                             onClick={() => handleChangeItem(index, 'returnStatus', 'return_initiated')}
                                                                             className="text-[10px] bg-orange-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-orange-700 transition-all font-black border border-orange-700 uppercase tracking-wider"
                                                                         >
                                                                             Initiate Return
                                                                         </button>
                                                                     ) : (
                                                                         <span className="text-gray-400 text-xs text-center">—</span>
                                                                     )
                                                                 )}
                                                             </div>
                                                         ) : (
                                                             item.returnStatus && item.returnStatus !== 'none' ? (
                                                                  <div className="text-[11px] font-bold text-gray-800 p-2 bg-gray-50 rounded border border-gray-100 uppercase tracking-tight text-center">
                                                                      {item.returnStatus?.replace('_', ' ')}
                                                                  </div>
                                                             ) : (
                                                                 <span className="text-xs text-gray-400 text-center block">—</span>
                                                             )
                                                         )}
                                                    </td>
                                                </tr>

                                                {/* Combo Items Rows */}
                                                {item.comboItems && item.comboItems.length > 0 && item.comboItems.map((comboItem, comboIndex) => (
                                                    <tr key={`${index}-combo-${comboIndex}`} className="border-b bg-background">
                                                        <td className="py-3 px-4 pl-8">
                                                            <div className="flex items-center space-x-3">
                                                                <img
                                                                    src={comboItem.featuredImage?.[0]?.imgUrl || comboItem.featuredImage?.[0] || '/placeholder-product.jpg'}
                                                                    alt={comboItem.name}
                                                                    className="w-10 h-10 object-cover rounded"
                                                                />
                                                                <div>
                                                                    <p className="text-sm font-medium text-secondary-text">{comboItem.name}</p>
                                                                    {comboItem.brandName && (
                                                                        <p className="text-xs text-blue-600 font-medium">{comboItem.brandName}</p>
                                                                    )}
                                                                    {comboItem.variationName && (
                                                                        <p className="text-xs text-gray-500">{comboItem.variationName}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className="text-xs text-gray-500">Included</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <span className="text-xs text-gray-500">-</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <span className="text-xs text-gray-500">-</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-left">
                                                            <span className="text-xs text-gray-400">-</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-left">
                                                            <span className="text-xs text-gray-400">-</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-left">
                                                            <span className="text-xs text-gray-400">-</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-left">
                                                            <span className="text-xs text-gray-400">-</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Order Summary */}
                            <div className="mt-6 border-t pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-secondary-text">Subtotal:</span>
                                        <span>{formatPrice(order.subtotal)}</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount:</span>
                                            <span>-{formatPrice(order.discount)}</span>
                                        </div>
                                    )}
                                    {order.couponDiscount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Coupon Discount ({order.couponCode}):</span>
                                            <span>-{formatPrice(order.couponDiscount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-secondary-text">Shipping:</span>
                                        <span>{formatPrice(order.shipping || 0)}</span>
                                    </div>
                                    {order.handlingFee && order.handFeeRate > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-secondary-text">Handling Fee:</span>
                                            <span>{formatPrice(order.handFeeRate)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                                        <span>Total:</span>
                                        <span>{formatPrice(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </Container>
                    </div>
                </div>

                <div className="col-span-2">
                    <div className="flex flex-col gap-4">
                        {/* Customer Information */}
                        <Container label={'Customer Information'} gap={3}>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <FaUser className="text-blue-500" />
                                    <span className="font-medium">{order.deliveryAddress?.emailID || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaEnvelope className="text-blue-500" />
                                    <span>{order.deliveryAddress?.emailID || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaPhone className="text-blue-500" />
                                    <span>{order.deliveryAddress?.phoneNumber || 'N/A'}</span>
                                </div>
                            </div>
                        </Container>

                        {/* Delivery Address */}
                        <Container label={'Delivery Address'} gap={3}>
                            {order.deliveryAddress ? (
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <FaMapMarkerAlt className="text-blue-500 mt-1" />
                                        <div>
                                            <p>{order.deliveryAddress.line1}</p>
                                            {order.deliveryAddress.line2 && <p>{order.deliveryAddress.line2}</p>}
                                            <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}</p>
                                            {order.deliveryAddress.landmark && (
                                                <p className="text-sm text-gray-500">Near: {order.deliveryAddress.landmark}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">Address not available</p>
                            )}
                        </Container>

                        {/* Order Status Update */}
                        <Container label={'Update Order Status'} gap={3}>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <FaTruck className="text-purple-500" />
                                    <span className="font-medium">Current Status:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                        {order.orderStatus || 'N/A'}
                                    </span>
                                </div>
                                <Select value={newOrderStatus?.toLowerCase() || 'select'} onValueChange={(value) => setNewOrderStatus(value === 'select' ? '' : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select new status" />
                                    </SelectTrigger>
                                    <SelectContent className=' bg-white'>
                                        <SelectItem value="select">Select new status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="preparing">Preparing</SelectItem>
                                        <SelectItem value="shipped">Shipped</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="returned">Returned</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <button
                                    onClick={handleUpdateOrderStatus}
                                    disabled={updating || !newOrderStatus || newOrderStatus === 'select' || newOrderStatus === order.orderStatus}
                                    className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {updating ? 'Updating...' : 'Update Order Status'}
                                </button>
                            </div>
                        </Container>

                        {/* Payment Status Update */}
                        <Container label={'Update Payment Status'} gap={3}>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <FaCreditCard className="text-green-500" />
                                    <span className="font-medium">Current Status:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                        {order.paymentStatus || 'N/A'}
                                    </span>
                                </div>
                                {(order.paymentMode === 'PREPAID' || order.paymentMode === 'PHONEPE') && (
                                    <button
                                        onClick={handleRecheckPaymentStatus}
                                        disabled={recheckingPayment}
                                        className={`w-full py-2 px-4 rounded flex items-center justify-center gap-2 ${recheckingPayment
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                            } text-white`}
                                    >
                                        {recheckingPayment ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                Checking...
                                            </>
                                        ) : (
                                            <>
                                                <FaSync />
                                                Re-Check Payment Status
                                            </>
                                        )}
                                    </button>
                                )}
                                <Select value={newPaymentStatus?.toLowerCase() || 'select'} onValueChange={(value) => setNewPaymentStatus(value === 'select' ? '' : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select new payment status" />
                                    </SelectTrigger>
                                    <SelectContent className='bg-white'>
                                        <SelectItem value="select">Select new payment status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="successful">Successful</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                                <button
                                    onClick={handleUpdatePaymentStatus}
                                    disabled={updating || !newPaymentStatus || newPaymentStatus === 'select' || newPaymentStatus === order.paymentStatus}
                                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {updating ? 'Updating...' : 'Update Payment Status'}
                                </button>
                            </div>
                        </Container>

                        {/* Invoice Actions */}
                        <Container label={'Invoice Actions'} gap={3}>
                            <div className="space-y-3">
                                <button
                                    onClick={handleDownloadInvoice}
                                    disabled={downloading}
                                    className={`w-full py-2 px-4 rounded flex items-center justify-center gap-2 ${downloading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                        } text-white`}
                                >
                                    {downloading ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <FaDownload />
                                            Download Invoice
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleEmailInvoice}
                                    disabled={emailing}
                                    className={`w-full py-2 px-4 rounded flex items-center justify-center gap-2 ${emailing
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700'
                                        } text-white`}
                                >
                                    {emailing ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <FaEnvelope />
                                            Email Invoice
                                        </>
                                    )}
                                </button>
                            </div>
                        </Container>

                        {/* Back Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => navigate('/orders/list')}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                                Back to Orders
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Item Details Modal */}
            {showItemModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Product Details</h2>
                            <button
                                onClick={closeItemModal}
                                className="text-gray-500 hover:text-secondary-text text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Product Info */}
                        <div className="mb-6 border-b pb-4">
                            <div className="flex gap-4">
                                <img
                                    src={selectedItem.featuredImage?.[0]?.imgUrl || '/placeholder-product.jpg'}
                                    alt={selectedItem.name}
                                    className="w-24 h-24 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{selectedItem.name}</h3>
                                    {selectedItem.brandName && (
                                        <p className="text-sm text-blue-600 font-medium mt-1">{selectedItem.brandName}</p>
                                    )}
                                    <div className="mt-2 space-y-1">
                                        <p className="text-secondary-text">Quantity: {selectedItem.quantity}</p>
                                        <p className="text-secondary-text">Price: {formatPrice(selectedItem.salePrice || selectedItem.regularPrice || 0)}</p>
                                        {selectedItem.comboItems && selectedItem.comboItems.length > 0 && (
                                            <p className="text-sm text-green-600 font-medium">
                                                Combo/Make-Combo Product ({selectedItem.comboItems.length} items included)
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Variations for Variable Products */}
                        {selectedItem.variation && (
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold mb-3 text-blue-600">Selected Variation Details</h4>
                                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                                    <p className="font-medium text-blue-900">Variation Name: {selectedItem.variation.variationName}</p>
                                    {selectedItem.variation.variationValues && selectedItem.variation.variationValues.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-blue-200">
                                            <p className="text-sm font-medium text-blue-700 mb-2">Attributes:</p>
                                            <div className="space-y-1">
                                                {selectedItem.variation.variationValues.map((attr, index) =>
                                                    Object.entries(attr).map(([key, value]) => (
                                                        <div key={`${index}-${key}`} className="flex gap-2">
                                                            <span className="font-medium text-blue-800 capitalize">{key}:</span>
                                                            <span className="text-blue-900">{value}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {selectedItem.variation.variationPrice && (
                                        <p className="text-sm text-blue-700 mt-2">
                                            Price: ₹{selectedItem.variation.variationSalePrice || selectedItem.variation.variationPrice}
                                            {selectedItem.variation.variationSalePrice && selectedItem.variation.variationSalePrice !== selectedItem.variation.variationPrice && (
                                                <span className="ml-2 text-green-600">
                                                    (Sale: ₹{selectedItem.variation.variationPrice - selectedItem.variation.variationSalePrice})
                                                </span>
                                            )}
                                        </p>
                                    )}
                                    {selectedItem.variation.variationStock !== undefined && (
                                        <p className="text-sm text-blue-700">Stock: {selectedItem.variation.variationStock}</p>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Fallback for old variationName only */}
                        {!selectedItem.variation && selectedItem.variationName && (
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold mb-3 text-blue-600">Selected Variation</h4>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="font-medium">{selectedItem.variationName}</p>
                                </div>
                            </div>
                        )}

                        {/* Custom Inputs for Custom Products */}
                        {selectedItem.custom_inputs && selectedItem.custom_inputs !== null && Object.keys(selectedItem.custom_inputs).length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold mb-3 text-purple-600">Custom Product Details</h4>
                                <div className="space-y-3">
                                    {selectedItem.productCustomInputs && Array.isArray(selectedItem.productCustomInputs) ? (
                                        // Use field definitions to show proper labels
                                        selectedItem.productCustomInputs.map((field) => {
                                            const fieldValue = selectedItem.custom_inputs[field.id];
                                            if (fieldValue) {
                                                return (
                                                    <div key={field.id} className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                                                        <p className="text-sm font-medium text-purple-700 uppercase">{field.label}</p>
                                                        <p className="text-foreground mt-1">{fieldValue}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }).filter(Boolean)
                                    ) : (
                                        // Fallback to showing IDs if field definitions not available
                                        Object.entries(selectedItem.custom_inputs).map(([key, value]) => (
                                            <div key={key} className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                                                <p className="text-sm font-medium text-purple-700 uppercase">Field {key}</p>
                                                <p className="text-foreground mt-1">{value}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Combo Items */}
                        {selectedItem.comboItems && selectedItem.comboItems.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold mb-3 text-green-600">
                                    Combo/Make-Combo Items ({selectedItem.comboItems.length})
                                </h4>
                                <p className="text-sm text-secondary-text mb-4">All products included in this combo with their selected variations:</p>
                                <div className="space-y-4">
                                    {selectedItem.comboItems.map((comboItem, index) => (
                                        <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                                            <div className="flex gap-4">
                                                <img
                                                    src={comboItem.featuredImage?.[0]?.imgUrl || '/placeholder-product.jpg'}
                                                    alt={comboItem.name}
                                                    className="w-20 h-20 object-cover rounded flex-shrink-0"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <p className="font-semibold text-foreground">{comboItem.name}</p>
                                                            {comboItem.brandName && (
                                                                <p className="text-xs text-blue-600 font-medium mt-0.5">{comboItem.brandName}</p>
                                                            )}
                                                        </div>
                                                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-medium">
                                                            Included
                                                        </span>
                                                    </div>

                                                    {/* Variation Details */}
                                                    {comboItem.variationID && (
                                                        <div className="mt-3 pt-3 border-t border-green-200">
                                                            <p className="text-sm font-medium text-green-800 mb-2">
                                                                Selected Variation:
                                                            </p>
                                                            {comboItem.variationName && (
                                                                <p className="text-sm text-secondary-text font-medium mb-2">
                                                                    {comboItem.variationName}
                                                                </p>
                                                            )}
                                                            {comboItem.variationValues && Array.isArray(comboItem.variationValues) && comboItem.variationValues.length > 0 && (
                                                                <div className="mt-2 space-y-1">
                                                                    <p className="text-xs font-medium text-green-700 mb-1">Variation Attributes:</p>
                                                                    <div className="space-y-1">
                                                                        {comboItem.variationValues.map((attr, attrIndex) => {
                                                                            // Handle both {label, value} format and {key: value} format
                                                                            if (attr && typeof attr === 'object') {
                                                                                const entries = Object.entries(attr);
                                                                                if (entries.length > 0) {
                                                                                    const [key, value] = entries[0];
                                                                                    // Check if it's already in {label, value} format
                                                                                    if (key === 'label' && 'value' in attr) {
                                                                                        return (
                                                                                            <div key={attrIndex} className="flex gap-2 text-xs">
                                                                                                <span className="font-medium text-green-800 capitalize">{attr.label}:</span>
                                                                                                <span className="text-secondary-text">{attr.value}</span>
                                                                                            </div>
                                                                                        );
                                                                                    } else {
                                                                                        return (
                                                                                            <div key={attrIndex} className="flex gap-2 text-xs">
                                                                                                <span className="font-medium text-green-800 capitalize">{key}:</span>
                                                                                                <span className="text-secondary-text">{value}</span>
                                                                                            </div>
                                                                                        );
                                                                                    }
                                                                                }
                                                                            }
                                                                            return null;
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {!comboItem.variationID && (
                                                        <p className="text-xs text-gray-500 mt-2">No variation selected</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Close Button */}
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={closeItemModal}
                                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    )
}

export default OrderDetail
