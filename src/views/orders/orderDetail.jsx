import Container from '@/components/ui/container'
import InputUi from '@/components/ui/inputui'
import React, { useState, useEffect, useCallback } from 'react'
import Layout from 'src/layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useParams, useNavigate } from 'react-router-dom'
import { getOrderDetails, updateOrderStatus, updatePaymentStatus, downloadInvoice, emailInvoice } from '@/lib/api/ordersApi'
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

    const fetchOrderDetails = useCallback(async () => {
        try {
            setLoading(true)
            const response = await getOrderDetails(orderId)
            if (response.success) {
                setOrder(response.data)
                setNewOrderStatus(response.data.orderStatus || '')
                setNewPaymentStatus(response.data.paymentStatus || '')
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
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                                            <th className="text-center py-3 px-4 font-medium text-gray-700">Quantity</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-700">Price</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-700">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items?.map((item, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="py-4 px-4">
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
        </Layout>
    )
}

export default OrderDetail