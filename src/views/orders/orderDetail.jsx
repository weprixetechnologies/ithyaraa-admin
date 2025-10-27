import Container from '@/components/ui/container'
import InputUi from '@/components/ui/inputui'
import React, { useState, useEffect, useCallback } from 'react'
import Layout from 'src/layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useParams, useNavigate } from 'react-router-dom'
import { getOrderDetails, updateOrderStatus, updatePaymentStatus, downloadInvoice, emailInvoice, updateOrderItemsTracking } from '@/lib/api/ordersApi'
import { FaDownload, FaTruck, FaCreditCard, FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone, FaSpinner } from 'react-icons/fa'
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
                            itemStatus: it.itemStatus || 'pending'
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
        if (!newOrderStatus || newOrderStatus === order.orderStatus) return

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
        if (!newPaymentStatus || newPaymentStatus === order.paymentStatus) return

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
                itemStatus: it.itemStatus || undefined
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
                        itemStatus: editedItems[idx]?.itemStatus || it.itemStatus
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
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'successful': return 'bg-green-100 text-green-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'failed': return 'bg-red-100 text-red-800'
            case 'refunded': return 'bg-purple-100 text-purple-800'
            default: return 'bg-gray-100 text-gray-800'
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
                        <p className="mt-4 text-gray-600">Loading order details...</p>
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
                                <h3 className="font-semibold text-gray-900">Items</h3>
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
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                                            <th className="text-center py-3 px-4 font-medium text-gray-700">Quantity</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-700">Price</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-700">Total</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Tracking Code</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Delivery Company</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items?.map((item, index) => (
                                            <tr
                                                key={index}
                                                className="border-b hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="py-4 px-4 cursor-pointer" onClick={() => handleItemClick(item)}>
                                                    <div className="flex items-center space-x-3">
                                                        <img
                                                            src={item.featuredImage?.[0]?.imgUrl || '/placeholder-product.jpg'}
                                                            alt={item.name}
                                                            className="w-12 h-12 object-cover rounded"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-900">{item.name}</p>
                                                            {item.variationName && (
                                                                <p className="text-sm text-gray-500">{item.variationName}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                                                        {item.quantity}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    {formatPrice(item.salePrice || item.regularPrice || 0)}
                                                </td>
                                                <td className="py-4 px-4 text-right font-medium">
                                                    {formatPrice(item.lineTotalAfter || (item.salePrice || item.regularPrice || 0) * item.quantity)}
                                                </td>
                                                <td className="py-4 px-4 text-left">
                                                    <input
                                                        type="text"
                                                        value={(editedItems[index]?.trackingCode || '')}
                                                        onChange={(e) => handleChangeItem(index, 'trackingCode', e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        placeholder="Enter tracking code"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="py-4 px-4 text-left">
                                                    <input
                                                        type="text"
                                                        value={(editedItems[index]?.deliveryCompany || '')}
                                                        onChange={(e) => handleChangeItem(index, 'deliveryCompany', e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        placeholder="Enter delivery company"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Order Summary */}
                            <div className="mt-6 border-t pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
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
                                        <span className="text-gray-600">Shipping:</span>
                                        <span>{formatPrice(order.shipping || 0)}</span>
                                    </div>
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
                                <Select value={newOrderStatus || 'select'} onValueChange={(value) => setNewOrderStatus(value === 'select' ? '' : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select new status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="select">Select new status</SelectItem>
                                        <SelectItem value="Preparing">Preparing</SelectItem>
                                        <SelectItem value="Shipped">Shipped</SelectItem>
                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                                <Select value={newPaymentStatus || 'select'} onValueChange={(value) => setNewPaymentStatus(value === 'select' ? '' : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select new payment status" />
                                    </SelectTrigger>
                                    <SelectContent>
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
                                className="text-gray-500 hover:text-gray-700 text-2xl"
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
                                <div>
                                    <h3 className="text-lg font-semibold">{selectedItem.name}</h3>
                                    <p className="text-gray-600">Quantity: {selectedItem.quantity}</p>
                                    <p className="text-gray-600">Price: {formatPrice(selectedItem.salePrice || selectedItem.regularPrice || 0)}</p>
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
                                            Price: ₹{selectedItem.variation.variationPrice}
                                            {selectedItem.variation.variationSalePrice && selectedItem.variation.variationSalePrice !== selectedItem.variation.variationPrice && (
                                                <span className="ml-2 text-green-600">
                                                    (Sale: ₹{selectedItem.variation.variationSalePrice})
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
                                                        <p className="text-gray-900 mt-1">{fieldValue}</p>
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
                                                <p className="text-gray-900 mt-1">{value}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Combo Items */}
                        {selectedItem.comboItems && selectedItem.comboItems.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold mb-3 text-green-600">Combo Items</h4>
                                <div className="space-y-3">
                                    {selectedItem.comboItems.map((comboItem, index) => (
                                        <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                                            <div className="flex gap-3">
                                                <img
                                                    src={comboItem.featuredImage?.[0]?.imgUrl || '/placeholder-product.jpg'}
                                                    alt={comboItem.name}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div>
                                                    <p className="font-medium">{comboItem.name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {comboItem.variationName || 'No variation'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">Combo Item - Free</p>
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