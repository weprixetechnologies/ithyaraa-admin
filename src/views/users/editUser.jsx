import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from './../../layout'
import InputUi from '../../components/ui/inputui'
import Container from '../../components/ui/container'
import AddressList from '../../components/address/address.list'
import OrderTable from '@/components/usersComponents/orderstable.component'
import { Skeleton } from "@/components/ui/skeleton"
import UploadImages from '@/components/ui/uploadImages'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from 'react-toastify'
import ApexChartComponent from '@/components/usersComponents/apexchartcomponent'
import axiosInstance from '@/lib/axiosInstance'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MdEdit } from "react-icons/md"
import { IoMdEye } from 'react-icons/io'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

// Simple Pagination Component
const SimplePagination = ({ currentPage, totalPages, onPageChange, hasNext, hasPrev }) => {
    const pages = []
    const maxVisiblePages = 5

    // Calculate which pages to show
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrev}
                className="px-3 py-2 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
                Previous
            </button>

            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 text-sm border rounded ${page === currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'hover:bg-gray-50'
                        }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNext}
                className="px-3 py-2 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
                Next
            </button>
        </div>
    )
}

// User Orders Section Component
const UserOrdersSection = ({ uid }) => {
    const [orderList, setOrderList] = useState([])
    const [loadingAPI, setLoadingAPI] = useState(true)
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        paymentStatus: 'all',
        page: 1,
        limit: 5
    })
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
        hasNext: false,
        hasPrev: false
    })

    const fetchOrders = async () => {
        try {
            setLoadingAPI(true)
            console.log('=== Frontend fetchOrders Debug ===');
            console.log('Fetching orders for UID:', uid);
            console.log('UID type:', typeof uid);

            // Convert "all" values to empty strings for the API
            const apiFilters = {
                ...filters,
                status: filters.status === 'all' ? '' : filters.status,
                paymentStatus: filters.paymentStatus === 'all' ? '' : filters.paymentStatus
            }

            console.log('API filters:', apiFilters);
            console.log('API URL:', `/admin/users/${uid}/orders`);

            const response = await axiosInstance.get(`/admin/users/${uid}/orders`, {
                params: apiFilters
            })

            console.log('API response:', response.data);

            if (response.data.success) {
                setOrderList(response.data.data)
                setPagination(response.data.pagination)
            }
        } catch (error) {
            console.error('Error fetching user orders:', error)
            console.error('Error response:', error.response?.data)
            toast.error('Failed to fetch user orders')
        } finally {
            setLoadingAPI(false)
        }
    }

    useEffect(() => {
        if (uid) {
            fetchOrders()
        }
    }, [uid, filters])

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filtering
        }))
    }

    const handleSearch = () => {
        setFilters(prev => ({
            ...prev,
            page: 1
        }))
        fetchOrders()
    }

    const handlePageChange = (page) => {
        setFilters(prev => ({
            ...prev,
            page
        }))
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
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

    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                    <div className="sm:col-span-2 lg:col-span-1">
                        <InputUi
                            placeholder={'Search Order ID / Payment Mode'}
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full"
                        />
                    </div>
                    <div className="w-full">
                        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Order Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Preparing">Preparing</SelectItem>
                                <SelectItem value="Shipped">Shipped</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full">
                        <Select value={filters.paymentStatus} onValueChange={(value) => handleFilterChange('paymentStatus', value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Payment Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Payment</SelectItem>
                                <SelectItem value="successful">Successful</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full">
                        <button
                            onClick={handleSearch}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="whitespace-nowrap">Total Orders: {pagination.totalOrders}</span>
                <span className="whitespace-nowrap">Page: {pagination.currentPage} of {pagination.totalPages}</span>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
                <Table className="border-separate border-spacing-y-2 min-w-full">
                    <TableHeader>
                        <TableRow className="text-unique text-[16px] uppercase">
                            <TableHead className="pl-5 min-w-[120px]">ORDER ID</TableHead>
                            <TableHead className="text-center min-w-[80px]">Items</TableHead>
                            <TableHead className="text-center min-w-[100px]">Amount</TableHead>
                            <TableHead className="text-center min-w-[100px]">Status</TableHead>
                            <TableHead className="text-center min-w-[120px]">Payment</TableHead>
                            <TableHead className="text-center min-w-[140px]">Ordered On</TableHead>
                            <TableHead className="pr-5 text-center min-w-[120px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="bg-white">
                        {loadingAPI && orderList?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className='rounded-[10px]'>
                                    <DotLottieReact
                                        src="https://lottie.host/15a4b106-bbe8-40d8-bb4e-834fb23fceae/I9HKWeP6l2.lottie"
                                        loop
                                        autoplay
                                        style={{ height: '200px', width: 'auto' }}
                                    />
                                </TableCell>
                            </TableRow>
                        )}

                        {orderList?.length > 0 && !loadingAPI &&
                            orderList?.map((order, index) => (
                                <TableRow key={index} className="rounded-full bg-white shadow-lg shadow-cyan-500/50">
                                    <TableCell className="rounded-l-[10px] font-bold py-5 pl-5">
                                        <span className="truncate block">#{order.orderID}</span>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-sm whitespace-nowrap">
                                            {order.itemCount}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center py-5 font-medium">
                                        <span className="whitespace-nowrap">{formatPrice(order.total)}</span>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(order.orderStatus)}`}>
                                            {order.orderStatus || 'N/A'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <div className="flex flex-col gap-1 items-center">
                                            <span className="text-sm font-medium truncate max-w-[100px]">{order.paymentMode}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                {order.paymentStatus || 'N/A'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-5 text-sm">
                                        <span className="whitespace-nowrap">{formatDate(order.createdAt)}</span>
                                    </TableCell>
                                    <TableCell className="rounded-r-[10px] text-center pr-5">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                className='bg-green-600 cursor border-none text-white p-2 rounded-full flex-center hover:bg-green-700'
                                                onClick={() => window.open(`/orders/details/${order.orderID}`, '_blank')}
                                                title="Edit Order"
                                            >
                                                <MdEdit style={{ width: '16px', height: '16px' }} />
                                            </button>
                                            <button
                                                className='bg-blue-600 cursor border-none text-white p-2 rounded-full flex-center hover:bg-blue-700'
                                                onClick={() => window.open(`/orders/details/${order.orderID}`, '_blank')}
                                                title="View Details"
                                            >
                                                <IoMdEye style={{ width: '16px', height: '16px' }} />
                                            </button>
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
            </div>

            {/* Pagination */}
            {!loadingAPI && pagination.totalPages > 1 && (
                <SimplePagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                    hasNext={pagination.hasNext}
                    hasPrev={pagination.hasPrev}
                />
            )}
        </div>
    )
}

const EditUser = () => {
    const { uid } = useParams()
    const navigate = useNavigate()
    const uploadRef = useRef()
    const [isLoaded, setIsLoaded] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    console.log('=== EditUser Component Debug ===');
    console.log('UID from useParams:', uid);
    console.log('UID type:', typeof uid);

    const [user, setUser] = useState({
        firstname: '',
        lastname: '',
        phonenumber: '',
        email: '',
        wallet: '',
        uid: '',
        lastLogin: '',
        refreshToken: '',
        device: '',
        createdOn: '',
        securityStatus: 'active',
        status: 'Normal',
        verifiedEmail: 0,
        verifiedPhone: 0,
        profilePhoto: ''
    })
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [addresses, setAddresses] = useState([])
    const [addressLoading, setAddressLoading] = useState(false)

    // Fetch user addresses
    const fetchAddresses = async (userId) => {
        try {
            setAddressLoading(true)
            console.log('Fetching addresses for UID:', userId)

            const response = await axiosInstance.get(`/admin/users/${userId}/addresses`)
            console.log('Addresses API response:', response.data)

            if (response.data.success) {
                setAddresses(response.data.data || [])
            } else {
                console.error('Failed to fetch addresses:', response.data.message)
                setAddresses([])
            }
        } catch (error) {
            console.error('Error fetching addresses:', error)
            setAddresses([])
        } finally {
            setAddressLoading(false)
        }
    }

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true)
                console.log('Fetching user with UID:', uid)
                console.log('UID type:', typeof uid)
                console.log('UID length:', uid?.length)

                // First, let's try to get the user list to see what UIDs exist
                const listResponse = await axiosInstance.get('/admin/users?limit=5')
                console.log('Available users:', listResponse.data)

                const { data } = await axiosInstance.get(`/admin/users/${uid}`)
                console.log('User API response:', data)

                if (data.success) {
                    const userData = data.data
                    console.log('User data:', userData)
                    setUser({
                        firstname: userData.name?.split(' ')[0] || '',
                        lastname: userData.name?.split(' ').slice(1).join(' ') || '',
                        phonenumber: userData.phonenumber || '',
                        email: userData.emailID || '',
                        wallet: userData.balance || '',
                        uid: userData.uid || '',
                        lastLogin: userData.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'Never',
                        refreshToken: 'ref_' + Math.random().toString(36).substr(2, 9),
                        device: 'Web Browser',
                        createdOn: userData.createdOn ? new Date(userData.createdOn).toLocaleDateString() : '',
                        securityStatus: 'active',
                        status: 'Normal',
                        verifiedEmail: userData.verifiedEmail || 0,
                        verifiedPhone: userData.verifiedPhone || 0,
                        profilePhoto: userData.profilePhoto || ''
                    })

                    // Fetch addresses after user data is loaded
                    if (userData.uid) {
                        await fetchAddresses(userData.uid)
                    }
                } else {
                    console.error('User not found in response:', data)
                    toast.error('User not found')
                    navigate('/users/list')
                }
            } catch (error) {
                console.error('Error fetching user:', error)
                console.error('Error response:', error.response?.data)
                toast.error('Failed to fetch user details')
                navigate('/users/list')
            } finally {
                setLoading(false)
            }
        }

        if (uid) {
            fetchUser()
        }
    }, [uid, navigate])

    // Update function
    const updateFunction = (data, name) => {
        setUser(prev => ({
            ...prev,
            [name]: data.target.value
        }))
    }

    // Update security function
    const updateSecurityFunction = async () => {
        if (confirmPassword !== password) {
            toast.error('Password Mismatch!')
            return
        }

        try {
            setSaving(true)
            const { data } = await axiosInstance.put(`/admin/users/${uid}`, {
                password: password,
                name: `${user.firstname} ${user.lastname}`.trim(),
                emailID: user.email,
                phonenumber: user.phonenumber,
                balance: parseFloat(user.wallet) || 0
            })

            if (data.success) {
                toast.success('Password Update Success')
                toast.warning('Update Email Sent')
                setPassword('')
                setConfirmPassword('')
            } else {
                toast.error('Failed to update password')
            }
        } catch (error) {
            console.error('Error updating password:', error)
            toast.error('Failed to update password')
        } finally {
            setSaving(false)
        }
    }

    // Save user changes
    const saveUserChanges = async () => {
        try {
            setSaving(true)

            // Upload profile photo if there are new images
            let profilePhotoUrl = user.profilePhoto
            if (uploadRef.current) {
                try {
                    const uploadedImages = await uploadRef.current.uploadImageFunction()
                    if (uploadedImages && uploadedImages.length > 0) {
                        profilePhotoUrl = uploadedImages[0].imgUrl
                        console.log('Profile photo uploaded:', profilePhotoUrl)
                    }
                } catch (uploadError) {
                    console.error('Error uploading profile photo:', uploadError)
                    toast.error('Failed to upload profile photo')
                    return
                }
            }

            const updateData = {
                name: `${user.firstname} ${user.lastname}`.trim(),
                emailID: user.email,
                phonenumber: user.phonenumber,
                balance: parseFloat(user.wallet) || 0,
                profilePhoto: profilePhotoUrl
            }

            console.log('Saving user changes with data:', updateData)
            console.log('Wallet value:', user.wallet)
            console.log('Parsed balance:', parseFloat(user.wallet) || 0)
            console.log('Profile photo URL:', profilePhotoUrl)

            const { data } = await axiosInstance.put(`/admin/users/${uid}`, updateData)

            console.log('Update response:', data)

            if (data.success) {
                toast.success('User updated successfully')
                // Refresh user data to show updated values
                const { data: updatedUser } = await axiosInstance.get(`/admin/users/${uid}`)
                if (updatedUser.success) {
                    const userData = updatedUser.data
                    setUser(prev => ({
                        ...prev,
                        wallet: userData.balance || '',
                        firstname: userData.name?.split(' ')[0] || '',
                        lastname: userData.name?.split(' ').slice(1).join(' ') || '',
                        phonenumber: userData.phonenumber || '',
                        email: userData.emailID || '',
                        profilePhoto: userData.profilePhoto || ''
                    }))
                }
            } else {
                toast.error(data.message || 'Failed to update user')
            }
        } catch (error) {
            console.error('Error updating user:', error)
            console.error('Error response:', error.response?.data)
            toast.error(error.response?.data?.message || 'Failed to update user')
        } finally {
            setSaving(false)
        }
    }

    // Delete user
    const deleteUser = async () => {
        try {
            setSaving(true)
            const { data } = await axiosInstance.delete(`/admin/users/${uid}`)
            if (data.success) {
                toast.success('User deleted successfully')
                navigate('/users')
            } else {
                toast.error('Failed to delete user')
            }
        } catch (error) {
            console.error('Error deleting user:', error)
            toast.error('Failed to delete user')
        } finally {
            setSaving(false)
        }
    }

    // Verification management handlers
    const handleRemoveEmailVerification = async () => {
        try {
            setSaving(true)
            const { data } = await axiosInstance.post(`/admin/users/${uid}/remove-email-verification`)
            if (data.success) {
                toast.success(data.message)
                setUser(prev => ({ ...prev, verifiedEmail: 0 }))
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error removing email verification:', error)
            toast.error('Failed to remove email verification')
        } finally {
            setSaving(false)
        }
    }

    const handleRemovePhoneVerification = async () => {
        try {
            setSaving(true)
            const { data } = await axiosInstance.post(`/admin/users/${uid}/remove-phone-verification`)
            if (data.success) {
                toast.success(data.message)
                setUser(prev => ({ ...prev, verifiedPhone: 0 }))
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error removing phone verification:', error)
            toast.error('Failed to remove phone verification')
        } finally {
            setSaving(false)
        }
    }

    const handleSendVerificationEmail = async () => {
        try {
            setSaving(true)
            const { data } = await axiosInstance.post(`/admin/users/${uid}/send-verification-email`)
            if (data.success) {
                toast.success('Verification email sent successfully')
            } else {
                toast.error(data.message || 'Failed to send verification email')
            }
        } catch (error) {
            console.error('Error sending verification email:', error)
            toast.error('Failed to send verification email')
        } finally {
            setSaving(false)
        }
    }

    const handleSendPhoneVerificationOtp = async () => {
        try {
            setSaving(true)
            const { data } = await axiosInstance.post(`/admin/users/${uid}/send-phone-verification-otp`)
            if (data.success) {
                toast.success('Verification OTP sent successfully')
            } else {
                toast.error(data.message || 'Failed to send verification OTP')
            }
        } catch (error) {
            console.error('Error sending phone verification OTP:', error)
            toast.error('Failed to send verification OTP')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Layout active={'admin-users-edit'} title={'Edit User'}>
                <div className="flex-center h-64">
                    <div className="text-lg">Loading user details for UID: {uid}...</div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout active={'admin-users-edit'} title={'Edit User'}>
            <div className="grid grid-cols-6 gap-6 h-full">
                <section className='col-span-4 w-full'>
                    <div className="flex flex-col gap-3">
                        <Container gap={3} label={'Basic Information'}>
                            <div className="grid grid-cols-2 gap-3">
                                <InputUi
                                    value={user.firstname}
                                    label={'First Name'}
                                    datafunction={(e) => updateFunction(e, 'firstname')}
                                />
                                <InputUi
                                    value={user.lastname}
                                    label={'Last Name'}
                                    datafunction={(e) => updateFunction(e, 'lastname')}
                                />
                                <InputUi
                                    value={user.phonenumber}
                                    label={'Phone Number'}
                                    type='number'
                                    datafunction={(e) => updateFunction(e, 'phonenumber')}
                                />
                                <InputUi
                                    value={user.email}
                                    label={'Email ID'}
                                    type='email'
                                    datafunction={(e) => updateFunction(e, 'email')}
                                />
                                <InputUi
                                    value={user.wallet}
                                    label={'Wallet Balance'}
                                    type='number'
                                    datafunction={(e) => updateFunction(e, 'wallet')}
                                />
                                <InputUi
                                    value={user.uid}
                                    label={'UID (User ID)'}
                                    type='text'
                                    disabled={true}
                                    datafunction={(e) => updateFunction(e, 'uid')}
                                />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    onClick={saveUserChanges}
                                    disabled={saving}
                                    style={{ fontFamily: 'var(--f2)' }}
                                    className='primary-button disabled:opacity-50'
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </Container>

                        <Container gap={3} label={'Security Section'}>
                            <div className="grid grid-cols-2 gap-3">
                                <InputUi
                                    value={password}
                                    label={'Enter New Password'}
                                    type='password'
                                    datafunction={(e) => setPassword(e.target.value)}
                                />
                                <InputUi
                                    value={confirmPassword}
                                    label={'Confirm Password'}
                                    type='password'
                                    datafunction={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <div className="flex item-center justify-end">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button
                                            style={{ fontFamily: 'var(--f2)' }}
                                            className='primary-button'
                                            disabled={!password || !confirmPassword}
                                        >
                                            Change & Notify User
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white dark:bg-black dark:text-white">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>You are about to reset the password</AlertDialogTitle>
                                            <AlertDialogDescription style={{ fontFamily: 'var(--f2)' }}>
                                                This action will trigger security patch which will disable the user to change password for the next 72 Hours.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="text-white dark:bg-cyan-500"
                                                onClick={updateSecurityFunction}
                                                disabled={saving}
                                            >
                                                {saving ? 'Updating...' : 'Continue'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </Container>

                        {/* <OrderTable /> */}
                        <ApexChartComponent />
                    </div>
                </section>

                <section className='col-span-2 gap-2'>
                    <div className="flex flex-col gap-2">
                        <Container label={'Profile Photo'}>
                            <div className="w-full">
                                <UploadImages
                                    ref={uploadRef}
                                    maxImages={1}
                                    defaultImages={user.profilePhoto ? [{ imgUrl: user.profilePhoto, imgAlt: 'Profile Photo' }] : []}
                                    providedName="profilePhoto"
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    Click to upload a profile photo. Only one image allowed.
                                </p>
                            </div>
                        </Container>

                        <Container label={'Address'}>
                            <AddressList addressprop={addresses} loading={addressLoading} />
                        </Container>

                        <Container label={'Verification Management'}>
                            <div className="flex flex-col gap-3">
                                <section className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Email Status:</span>
                                        <span className={`px-2 py-1 rounded text-xs ${user.verifiedEmail ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.verifiedEmail ? 'Verified' : 'Not Verified'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {user.verifiedEmail === 1 && (
                                            <button
                                                onClick={() => handleRemoveEmailVerification()}
                                                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                disabled={saving}
                                            >
                                                Remove Verification
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleSendVerificationEmail()}
                                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                            disabled={saving}
                                        >
                                            Send Verification Email
                                        </button>
                                    </div>
                                </section>

                                <section className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Phone Status:</span>
                                        <span className={`px-2 py-1 rounded text-xs ${user.verifiedPhone ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.verifiedPhone ? 'Verified' : 'Not Verified'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {user.verifiedPhone === 1 && (
                                            <button
                                                onClick={() => handleRemovePhoneVerification()}
                                                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                disabled={saving}
                                            >
                                                Remove Verification
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleSendPhoneVerificationOtp()}
                                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                            disabled={saving}
                                        >
                                            Send Verification OTP
                                        </button>
                                    </div>
                                </section>
                            </div>
                        </Container>

                        <Container label={'Session Details'} containerclass={'mb-10 bg-white'}>
                            <div className="flex flex-col gap-2">
                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">Last Login</p>
                                    <p className="text-secondary-text">{user.lastLogin}</p>
                                </section>

                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">Refresh Token</p>
                                    <p className="text-secondary-text max-w-[70%] truncate">{user.refreshToken}</p>
                                </section>

                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">Device</p>
                                    <p className="text-secondary-text">{user.device}</p>
                                </section>

                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">Registered On</p>
                                    <p className="text-secondary-text">{user.createdOn}</p>
                                </section>

                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">Email Verified</p>
                                    <p className={`${user.verifiedEmail ? 'text-green-500' : 'text-red-500'}`}>
                                        {user.verifiedEmail ? 'Verified' : 'Not Verified'}
                                    </p>
                                </section>

                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">Phone Verified</p>
                                    <p className={`${user.verifiedPhone ? 'text-green-500' : 'text-red-500'}`}>
                                        {user.verifiedPhone ? 'Verified' : 'Not Verified'}
                                    </p>
                                </section>

                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">Security Status</p>
                                    <p className={`${user.securityStatus === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                                        {user.securityStatus === 'active' ? 'Active' : 'Issue Found'}
                                    </p>
                                </section>

                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">User Status</p>
                                    <p className="text-secondary-text">{user.status}</p>
                                </section>
                            </div>
                        </Container>

                        <Container label={'Danger Zone'} containerclass={'bg-red-50 border-red-200'}>
                            <div className="flex flex-col gap-2">
                                <p className="text-red-600 font-semibold text-sm mb-2">Irreversible Actions</p>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button
                                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                                            disabled={saving}
                                        >
                                            Delete User
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white dark:bg-black dark:text-white">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-red-600">Delete User Account</AlertDialogTitle>
                                            <AlertDialogDescription style={{ fontFamily: 'var(--f2)' }}>
                                                This action cannot be undone. This will permanently delete the user account and all associated data.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-red-600 text-white hover:bg-red-700"
                                                onClick={deleteUser}
                                                disabled={saving}
                                            >
                                                {saving ? 'Deleting...' : 'Delete User'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </Container>
                    </div>
                </section>

                {/* Orders Section */}
                <section className="col-span-6">
                    <Container containerclass="bg-white rounded-lg shadow-sm">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">User Orders</h2>
                            <UserOrdersSection uid={uid} />
                        </div>
                    </Container>
                </section>
            </div>
        </Layout>
    )
}

export default EditUser
