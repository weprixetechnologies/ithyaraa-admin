
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Container from '@/components/ui/container'
import React, { useEffect, useState, useCallback } from 'react'
import Layout from 'src/layout'
import { MdEdit, MdDelete } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import InputUi from '@/components/ui/inputui';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Skeleton } from '@/components/ui/skeleton';
import axiosInstance from '@/lib/axiosInstance';

const ListUsersc = () => {
    const [loadingImage, setLoading] = useState(true)
    const [userlist, setUserList] = useState([])
    const [loadingAPI, setLoadingAPI] = useState(true)
    const [error, setError] = useState('')
    const [filters, setFilters] = useState({
        search: '',
        verifiedEmail: '',
        verifiedPhone: '',
        dateFrom: '',
        dateTo: '',
        page: 1,
        limit: 10
    })
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        hasNext: false,
        hasPrev: false
    })

    const fetchUsers = useCallback(async () => {
        try {
            setLoadingAPI(true)
            setError('')
            const params = new URLSearchParams()
            Object.keys(filters).forEach(key => {
                if (filters[key]) params.append(key, filters[key])
            })

            const { data } = await axiosInstance.get(`/admin/users?${params}`)
            if (data.success) {
                setUserList(data.data)
                setPagination(data.pagination)
            } else {
                setError('Failed to fetch users')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users')
        } finally {
            setLoadingAPI(false)
        }
    }, [filters])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const navigate = useNavigate()

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filtering
        }))
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
        return `₹${price?.toLocaleString('en-IN') || '0'}`
    }

    return (

        <Layout active={'admin-users-all'} title={'List of Users'}>
            <Container containerclass={'bg-transaparent'}>
                <div className="space-y-4">
                    {/* Search and Basic Filters */}
                    <div className="flex w-full items-center gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow w-full">
                            <InputUi
                                placeholder={'Search by Name, Email, Phone, or UID'}
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                            <select
                                value={filters.verifiedPhone}
                                onChange={(e) => handleFilterChange('verifiedPhone', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                            >
                                <option value="">All Phone Status</option>
                                <option value="1">Verified</option>
                                <option value="0">Not Verified</option>
                            </select>
                            <select
                                value={filters.verifiedEmail}
                                onChange={(e) => handleFilterChange('verifiedEmail', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                            >
                                <option value="">All Email Status</option>
                                <option value="1">Verified</option>
                                <option value="0">Not Verified</option>
                            </select>
                        </div>
                        <button
                            onClick={fetchUsers}
                            className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded text-[12px] hover:bg-blue-700"
                        >
                            Search
                        </button>
                    </div>

                    {/* Advanced Filters */}
                    <div className="flex w-full items-center gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow w-full">
                            <InputUi
                                type='date'
                                placeholder={'From Date'}
                                value={filters.dateFrom}
                                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            />
                            <InputUi
                                type='date'
                                placeholder={'To Date'}
                                value={filters.dateTo}
                                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setFilters({
                                search: '',
                                verifiedEmail: '',
                                verifiedPhone: '',
                                dateFrom: '',
                                dateTo: '',
                                page: 1,
                                limit: 10
                            })}
                            className="shrink-0 px-4 py-2 bg-gray-500 text-white rounded text-[12px] hover:bg-gray-600"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

            </Container>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <Container containerclass="bg-transparent">
                <Table className="border-separate border-spacing-y-2 ">
                    <TableHeader>
                        <TableRow className=" text-unique text-[16px] uppercase">
                            <TableHead className="pl-5">UID</TableHead>
                            <TableHead className="text-left pl-10">Profile</TableHead>
                            <TableHead className="text-left">Phone Number</TableHead>
                            <TableHead className="text-center">Email ID</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Wallet</TableHead>
                            <TableHead className="text-center">Joined On</TableHead>
                            <TableHead className="pr-5 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="bg-white">

                        {
                            loadingAPI && userlist?.length === 0 && <TableRow>
                                <TableCell colSpan={8} className='rounded-[10px]'>

                                    <DotLottieReact
                                        src="https://lottie.host/15a4b106-bbe8-40d8-bb4e-834fb23fceae/I9HKWeP6l2.lottie"
                                        loop
                                        autoplay
                                        style={{ height: '200px', width: 'auto' }}
                                    />
                                </TableCell>
                            </TableRow>
                        }

                        {userlist?.length > 0 && !loadingAPI &&
                            userlist?.map((user, index) => (
                                <TableRow key={user.uid} className="rounded-full bg-white  shadow-lg shadow-cyan-500/50">
                                    <TableCell className="rounded-l-[10px] font-bold py-5 pl-5 ">{user.uid}</TableCell>
                                    <TableCell className="text-center py-5 pl-10">
                                        <div className="flex gap-2 justify-start items-center">
                                            <div className="h-[35px] w-[35px] rounded-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-600 font-semibold text-sm">
                                                    {user.username?.charAt(0)?.toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col justify-start items-start text-right">
                                                <p className='text-right font-medium '>{user.username || 'N/A'}</p>
                                                <p className='font-light text-secondary-text max-w-[350px] truncate overflow-hidden whitespace-nowrap'>
                                                    {user.verifiedEmail ? '✓ Email Verified' : '✗ Email Not Verified'}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className=" text-left py-5 ">{user.phonenumber || 'N/A'}</TableCell>
                                    <TableCell
                                        className=" text-center py-5 max-w-[200px] truncate overflow-hidden whitespace-nowrap"
                                    >
                                        {user.emailID || 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center py-5 font-medium">
                                        {formatPrice(user.balance || 0)}
                                    </TableCell>
                                    <TableCell className=" text-center py-5">{formatDate(user.createdOn)}</TableCell>
                                    <TableCell className="rounded-r-[10px] text-center pr-5">
                                        <div className="flex-center gap-2">
                                            <button
                                                className='bg-green-600 cursor border-none text-white p-2 rounded-full flex-center hover:bg-green-700'
                                                onClick={() => navigate(`/users/edit/${user.uid}`)}
                                                title="Edit User"
                                            >
                                                <MdEdit style={{ width: '16px', height: '16px' }} />
                                            </button>
                                            <button
                                                className='bg-red-600 cursor border-none text-white p-2 rounded-full flex-center hover:bg-red-700'
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this user?')) {
                                                        // Handle delete
                                                        console.log('Delete user:', user.uid)
                                                    }
                                                }}
                                                title="Delete User"
                                            >
                                                <MdDelete style={{ width: '16px', height: '16px' }} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                        {!loadingAPI && userlist?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <div className="text-center py-8 text-lg text-muted-foreground">
                                        🚫 No Users Found
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}


                    </TableBody>

                </Table>

                {/* Pagination */}
                {!loadingAPI && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrev}
                            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>

                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-2 border rounded-lg ${page === pagination.currentPage
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={!pagination.hasNext}
                            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Pagination Info */}
                {!loadingAPI && (
                    <div className="text-center mt-4 text-sm text-gray-600">
                        Showing {userlist.length} of {pagination.totalUsers} users
                    </div>
                )}
            </Container>
        </Layout >
    )
}

export default ListUsersc