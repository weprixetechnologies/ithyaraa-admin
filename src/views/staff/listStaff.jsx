
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Container from '@/components/ui/container'
import React, { useEffect, useState, useCallback } from 'react'
import Layout from 'src/layout'
import { MdEdit, MdDelete } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import InputUi from '@/components/ui/inputui';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axiosInstance from '@/lib/axiosInstance';

const ListStaff = () => {
    const [userlist, setUserList] = useState([])
    const [loadingAPI, setLoadingAPI] = useState(true)
    const [error, setError] = useState('')
    const [filters, setFilters] = useState({
        search: '',
        role: 'admin,manager',
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
                setError('Failed to fetch staff')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch staff')
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
            page: 1 
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

    return (

        <Layout active={'admin-staff-list'} title={'Staff Management'}>
            <Container containerclass={'bg-transaparent'}>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-4 flex-grow max-w-2xl">
                        <InputUi
                            placeholder={'Search staff by Name, Email, Phone, or UID'}
                            value={filters.search}
                            datafunction={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                        <select
                            value={filters.role}
                            onChange={(e) => handleFilterChange('role', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-secondary-text"
                        >
                            <option value="admin,manager">All Staff</option>
                            <option value="admin">Admins</option>
                            <option value="manager">Managers</option>
                        </select>
                        <button
                            onClick={fetchUsers}
                            className="shrink-0 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                            Search
                        </button>
                    </div>
                    <button
                        onClick={() => navigate('/staff/add')}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                        + Add Staff
                    </button>
                </div>

            </Container>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-6">
                    {error}
                </div>
            )}

            <Container containerclass="bg-transparent">
                <Table className="border-separate border-spacing-y-2 ">
                    <TableHeader>
                        <TableRow className=" text-unique text-[16px] uppercase">
                            <TableHead className="pl-5">UID</TableHead>
                            <TableHead className="text-left pl-10">Name/Role</TableHead>
                            <TableHead className="text-left">Phone Number</TableHead>
                            <TableHead className="text-center">Email ID</TableHead>
                            <TableHead className="text-center">Joined On</TableHead>
                            <TableHead className="pr-5 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="bg-white">

                        {
                            loadingAPI && userlist?.length === 0 && <TableRow>
                                <TableCell colSpan={6} className='rounded-[10px]'>
                                    <div className="flex justify-center items-center py-20">
                                        <DotLottieReact
                                            src="https://lottie.host/15a4b106-bbe8-40d8-bb4e-834fb23fceae/I9HKWeP6l2.lottie"
                                            loop
                                            autoplay
                                            style={{ height: '200px', width: 'auto' }}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        }

                        {userlist?.length > 0 && !loadingAPI &&
                            userlist?.map((user) => (
                                <TableRow key={user.uid} className="rounded-full bg-white shadow-lg shadow-cyan-500/50">
                                    <TableCell className="rounded-l-[10px] font-bold py-5 pl-5 ">{user.uid}</TableCell>
                                    <TableCell className="text-center py-5 pl-10">
                                        <div className="flex gap-2 justify-start items-center">
                                            <div className={`h-[35px] w-[35px] rounded-full flex items-center justify-center font-bold text-white ${user.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`}>
                                                {user.role === 'admin' ? 'A' : 'M'}
                                            </div>
                                            <div className="flex flex-col justify-start items-start">
                                                <p className='font-medium '>{user.username || 'N/A'}</p>
                                                <p className={`text-xs uppercase font-bold ${user.role === 'admin' ? 'text-red-500' : 'text-blue-500'}`}>
                                                    {user.role}
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
                                    <TableCell className=" text-center py-5">{formatDate(user.createdOn)}</TableCell>
                                    <TableCell className="rounded-r-[10px] text-center pr-5">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                className='bg-green-600 cursor border-none text-white p-2 rounded-full hover:bg-green-700 transition-colors'
                                                onClick={() => navigate(`/staff/edit/${user.uid}`)}
                                                title="Edit Staff"
                                            >
                                                <MdEdit style={{ width: '16px', height: '16px' }} />
                                            </button>
                                            <button
                                                className='bg-red-600 cursor border-none text-white p-2 rounded-full hover:bg-red-700 transition-colors'
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to delete this ${user.role}?`)) {
                                                        // Handle delete logic here
                                                        axiosInstance.delete(`/admin/users/${user.uid}`)
                                                            .then(() => {
                                                                setUserList(prev => prev.filter(u => u.uid !== user.uid));
                                                            });
                                                    }
                                                }}
                                                title="Delete Staff"
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
                                <TableCell colSpan={6}>
                                    <div className="text-center py-20 text-lg text-muted-foreground bg-white rounded-lg">
                                        🚫 No Staff Members Found
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}


                    </TableBody>

                </Table>

                {/* Pagination */}
                {!loadingAPI && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6 pb-10">
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrev}
                            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-secondary-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background"
                        >
                            Previous
                        </button>

                        {Array.from({ length: pagination.totalPages }, (_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-2 border rounded-lg ${page === pagination.currentPage
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'border-gray-300 bg-white text-secondary-text hover:bg-background'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={!pagination.hasNext}
                            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-secondary-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background"
                        >
                            Next
                        </button>
                    </div>
                )}
            </Container>
        </Layout >
    )
}

export default ListStaff
