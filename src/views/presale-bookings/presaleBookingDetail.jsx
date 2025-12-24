import Container from '@/components/ui/container'
import InputUi from '@/components/ui/inputui'
import React, { useState, useEffect, useCallback } from 'react'
import Layout from 'src/layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useParams, useNavigate } from 'react-router-dom'
import { getPresaleBookingDetails, updatePresaleBookingStatus, updatePresaleBookingPaymentStatus, updatePresaleBookingTracking, recheckPresalePaymentStatus } from '@/lib/api/presaleBookingsApi'
import { FaTruck, FaCreditCard, FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone, FaSpinner, FaSync } from 'react-icons/fa'

const PresaleBookingDetail = () => {
    const { preBookingID } = useParams()
    const navigate = useNavigate()

    const [booking, setBooking] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [newOrderStatus, setNewOrderStatus] = useState('')
    const [newPaymentStatus, setNewPaymentStatus] = useState('')
    const [trackingCode, setTrackingCode] = useState('')
    const [deliveryCompany, setDeliveryCompany] = useState('')
    const [savingTracking, setSavingTracking] = useState(false)
    const [recheckingPayment, setRecheckingPayment] = useState(false)

    const fetchBookingDetails = useCallback(async () => {
        try {
            setLoading(true)
            const response = await getPresaleBookingDetails(preBookingID)
            if (response.success) {
                const data = response.data
                setBooking(data)
                setNewOrderStatus(data.orderStatus || '')
                setNewPaymentStatus(data.paymentStatus || '')
                setTrackingCode(data.trackingCode || '')
                setDeliveryCompany(data.deliveryCompany || '')
            } else {
                alert('Presale booking not found')
                navigate('/presale-bookings/list')
            }
        } catch (error) {
            console.error('Error fetching presale booking details:', error)
            alert('Failed to load presale booking details')
            navigate('/presale-bookings/list')
        } finally {
            setLoading(false)
        }
    }, [preBookingID, navigate])

    useEffect(() => {
        if (preBookingID) {
            fetchBookingDetails()
        }
    }, [preBookingID, fetchBookingDetails])

    const handleUpdateOrderStatus = async () => {
        if (!newOrderStatus || newOrderStatus === booking.orderStatus) return

        try {
            setUpdating(true)
            const response = await updatePresaleBookingStatus(preBookingID, newOrderStatus)
            if (response.success) {
                setBooking(prev => ({ ...prev, orderStatus: newOrderStatus }))
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
        if (!newPaymentStatus || newPaymentStatus === booking.paymentStatus) return

        try {
            setUpdating(true)
            const response = await updatePresaleBookingPaymentStatus(preBookingID, newPaymentStatus)
            if (response.success) {
                setBooking(prev => ({ ...prev, paymentStatus: newPaymentStatus }))
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

    const handleUpdateTracking = async () => {
        try {
            setSavingTracking(true)
            const response = await updatePresaleBookingTracking(preBookingID, trackingCode, deliveryCompany)
            if (response.success) {
                setBooking(prev => ({
                    ...prev,
                    trackingCode: trackingCode,
                    deliveryCompany: deliveryCompany
                }))
                alert('Tracking information updated successfully')
            } else {
                alert('Failed to update tracking information')
            }
        } catch (error) {
            console.error('Error updating tracking:', error)
            alert('Failed to update tracking information')
        } finally {
            setSavingTracking(false)
        }
    }

    const handleRecheckPaymentStatus = async () => {
        try {
            setRecheckingPayment(true)
            const response = await recheckPresalePaymentStatus(preBookingID)
            if (response.success) {
                // Refresh booking details to get updated status
                await fetchBookingDetails()
                
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
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'accepted': return 'bg-blue-100 text-blue-800'
            case 'packed': return 'bg-purple-100 text-purple-800'
            case 'shipped': return 'bg-blue-100 text-blue-800'
            case 'delivered': return 'bg-green-100 text-green-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            case 'returned': return 'bg-orange-100 text-orange-800'
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
            <Layout active={'admin-presale-bookings-detail'} title={'Presale Booking Detail'}>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading presale booking details...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (!booking) {
        return (
            <Layout active={'admin-presale-bookings-detail'} title={'Presale Booking Detail'}>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-red-600 text-lg">Presale booking not found</p>
                        <button
                            onClick={() => navigate('/presale-bookings/list')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Back to Presale Bookings
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout active={'admin-presale-bookings-detail'} title={`Presale Booking Detail #${booking.preBookingID}`}>
            <div className="grid-cols-6 grid gap-6">
                <div className="col-span-4">
                    <div className="flex flex-col gap-4">
                        {/* Booking Information */}
                        <Container label={'Presale Booking Information'} gap={3}>
                            <div className="grid grid-cols-2 gap-4">
                                <InputUi label={'Pre-Booking ID'} value={`#${booking.preBookingID}`} readOnly />
                                <InputUi label={'Booking Date'} value={formatDate(booking.createdAt)} readOnly />
                                <InputUi label={'Payment Mode'} value={booking.paymentMode} readOnly />
                                <InputUi label={'Total Amount'} value={formatPrice(booking.total)} readOnly />
                            </div>
                        </Container>

                        {/* Booking Items */}
                        <Container label={'Booking Items'} gap={3}>
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
                                        {booking.items?.map((item, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center space-x-3">
                                                        <img
                                                            src={item.featuredImage?.[0]?.imgUrl || item.featuredImage || '/placeholder-product.jpg'}
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

                            {/* Booking Summary */}
                            <div className="mt-6 border-t pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span>{formatPrice(booking.subtotal)}</span>
                                    </div>
                                    {booking.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount:</span>
                                            <span>-{formatPrice(booking.discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                                        <span>Total:</span>
                                        <span>{formatPrice(booking.total)}</span>
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
                                    <span className="font-medium">{booking.user?.username || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaEnvelope className="text-blue-500" />
                                    <span>{booking.user?.emailID || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaPhone className="text-blue-500" />
                                    <span>{booking.user?.phoneNumber || booking.deliveryAddress?.phoneNumber || 'N/A'}</span>
                                </div>
                            </div>
                        </Container>

                        {/* Delivery Address */}
                        <Container label={'Delivery Address'} gap={3}>
                            {booking.deliveryAddress ? (
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <FaMapMarkerAlt className="text-blue-500 mt-1" />
                                        <div>
                                            <p>{booking.deliveryAddress.line1}</p>
                                            {booking.deliveryAddress.line2 && <p>{booking.deliveryAddress.line2}</p>}
                                            <p>{booking.deliveryAddress.city}, {booking.deliveryAddress.state} {booking.deliveryAddress.pincode}</p>
                                            {booking.deliveryAddress.landmark && (
                                                <p className="text-sm text-gray-500">Near: {booking.deliveryAddress.landmark}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">Address not available</p>
                            )}
                        </Container>

                        {/* Tracking Information */}
                        <Container label={'Tracking Information'} gap={3}>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Code</label>
                                    <InputUi
                                        value={trackingCode}
                                        datafunction={(e) => setTrackingCode(e.target.value)}
                                        placeholder="Enter tracking code"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Company</label>
                                    <InputUi
                                        value={deliveryCompany}
                                        datafunction={(e) => setDeliveryCompany(e.target.value)}
                                        placeholder="Enter delivery company"
                                    />
                                </div>
                                <button
                                    onClick={handleUpdateTracking}
                                    disabled={savingTracking}
                                    className={`w-full py-2 px-4 rounded flex items-center justify-center gap-2 ${savingTracking
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
                                            Update Tracking
                                        </>
                                    )}
                                </button>
                            </div>
                        </Container>

                        {/* Order Status Update */}
                        <Container label={'Update Order Status'} gap={3}>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <FaTruck className="text-purple-500" />
                                    <span className="font-medium">Current Status:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.orderStatus)}`}>
                                        {booking.orderStatus || 'N/A'}
                                    </span>
                                </div>
                                <Select value={newOrderStatus || 'select'} onValueChange={(value) => setNewOrderStatus(value === 'select' ? '' : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select new status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="select" className="bg-white">Select new status</SelectItem>
                                        <SelectItem value="pending" className="bg-white">Pending</SelectItem>
                                        <SelectItem value="accepted" className="bg-white">Accepted</SelectItem>
                                        <SelectItem value="packed" className="bg-white">Packed</SelectItem>
                                        <SelectItem value="shipped" className="bg-white">Shipped</SelectItem>
                                        <SelectItem value="delivered" className="bg-white">Delivered</SelectItem>
                                        <SelectItem value="cancelled" className="bg-white">Cancelled</SelectItem>
                                        <SelectItem value="returned" className="bg-white">Returned</SelectItem>
                                    </SelectContent>
                                </Select>
                                <button
                                    onClick={handleUpdateOrderStatus}
                                    disabled={updating || !newOrderStatus || newOrderStatus === 'select' || newOrderStatus === booking.orderStatus}
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
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                        {booking.paymentStatus || 'N/A'}
                                    </span>
                                </div>
                                
                                {/* Re-Check Payment Status Button - Only for PREPAID orders */}
                                {(booking.paymentType === 'PREPAID' || booking.paymentType === 'PHONEPE' || booking.paymentMode === 'PREPAID' || booking.paymentMode === 'PHONEPE') && (
                                    <button
                                        onClick={handleRecheckPaymentStatus}
                                        disabled={recheckingPayment}
                                        className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
                                    >
                                        {recheckingPayment ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                Checking Payment Status...
                                            </>
                                        ) : (
                                            <>
                                                <FaSync />
                                                Re-Check Payment Status
                                            </>
                                        )}
                                    </button>
                                )}

                                <Select value={newPaymentStatus || 'select'} onValueChange={(value) => setNewPaymentStatus(value === 'select' ? '' : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select new payment status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="select" className="bg-white">Select new payment status</SelectItem>
                                        <SelectItem value="pending" className="bg-white">Pending</SelectItem>
                                        <SelectItem value="successful" className="bg-white">Successful</SelectItem>
                                        <SelectItem value="failed" className="bg-white">Failed</SelectItem>
                                        <SelectItem value="refunded" className="bg-white">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                                <button
                                    onClick={handleUpdatePaymentStatus}
                                    disabled={updating || !newPaymentStatus || newPaymentStatus === 'select' || newPaymentStatus === booking.paymentStatus}
                                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {updating ? 'Updating...' : 'Update Payment Status'}
                                </button>
                            </div>
                        </Container>

                        {/* Back Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => navigate('/presale-bookings/list')}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                                Back to Presale Bookings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default PresaleBookingDetail

