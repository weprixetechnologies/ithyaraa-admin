import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Container from '@/components/ui/container'
import React, { useEffect, useState, useCallback } from 'react'
import Layout from 'src/layout'
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import InputUi from '@/components/ui/inputui';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Skeleton } from '@/components/ui/skeleton';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-toastify';

const ListBrands = () => {
    const navigate = useNavigate()
    const [loadingImage, setLoading] = useState(true)
    const [brandList, setBrandList] = useState([])
    const [loadingAPI, setLoadingAPI] = useState(true)
    const [error, setError] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [newBrand, setNewBrand] = useState({
        name: '',
        email: '',
        password: ''
    })
    const [submitting, setSubmitting] = useState(false)

    const fetchBrands = useCallback(async () => {
        try {
            setLoadingAPI(true)
            setError('')
            const { data } = await axiosInstance.get('/admin/brands')
            if (data.success) {
                setBrandList(data.data)
            } else {
                setError('Failed to fetch brands')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch brands')
        } finally {
            setLoadingAPI(false)
        }
    }, [])

    useEffect(() => {
        fetchBrands()
    }, [fetchBrands])

    const handleAddBrand = async () => {
        if (!newBrand.name || !newBrand.email || !newBrand.password) {
            toast.error('Please fill all fields')
            return
        }

        setSubmitting(true)
        try {
            const { data } = await axiosInstance.post('/admin/brands', newBrand)
            if (data.success) {
                // toast.success('Brand created successfully')
                setShowAddModal(false)
                setNewBrand({ name: '', email: '', password: '' })
                fetchBrands()
            } else {
                toast.error(data.message || 'Failed to create brand')
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create brand')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteBrand = async (uid) => {
        if (!window.confirm('Are you sure you want to delete this brand?')) {
            return
        }

        try {
            const { data } = await axiosInstance.delete(`/admin/brands/${uid}`)
            if (data.success) {
                // toast.success('Brand deleted successfully')
                fetchBrands()
            } else {
                toast.error(data.message || 'Failed to delete brand')
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete brand')
        }
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
        <Layout active={'admin-brands-list'} title={'List of Brands'}>
            <Container containerclass={'bg-transaparent'}>
                <div className="mb-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Brands Management</h1>
                    <button
                        onClick={() => navigate('/brands/add')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <MdAdd className="text-xl" />
                        Add Brand
                    </button>
                </div>
            </Container>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <Container containerclass="bg-transparent">
                <Table className="border-separate border-spacing-y-2">
                    <TableHeader>
                        <TableRow className="text-unique text-[16px] uppercase">
                            <TableHead className="pl-5">UID</TableHead>
                            <TableHead className="text-left pl-10">Brand Info</TableHead>
                            <TableHead className="text-center">Email ID</TableHead>
                            <TableHead className="text-center">GSTIN</TableHead>
                            <TableHead className="text-center">Verified</TableHead>
                            <TableHead className="text-center">Joined On</TableHead>
                            <TableHead className="pr-5 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="bg-white">
                        {loadingAPI && brandList?.length === 0 && (
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

                        {brandList?.length > 0 && !loadingAPI &&
                            brandList.map((brand) => (
                                <TableRow key={brand.uid} className="rounded-full bg-white shadow-lg shadow-cyan-500/50">
                                    <TableCell className="rounded-l-[10px] font-bold py-5 pl-5">
                                        {brand.uid}
                                    </TableCell>
                                    <TableCell className="text-center py-5 pl-10">
                                        <div className="flex gap-2 justify-start items-center">
                                            <div className="h-[35px] w-[35px] rounded-full bg-purple-200 flex items-center justify-center overflow-hidden">
                                                {brand.profilePhoto ? (
                                                    <img
                                                        src={brand.profilePhoto}
                                                        alt={brand.name || brand.username}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-purple-600 font-semibold text-sm">
                                                        {brand.username?.charAt(0)?.toUpperCase() || 'B'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col justify-start items-start text-right">
                                                <p className='text-right font-medium'>{brand.name || brand.username || 'N/A'}</p>
                                                <p className='font-light text-secondary-text'>
                                                    @{brand.username}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-5 max-w-[200px] truncate overflow-hidden whitespace-nowrap">
                                        {brand.emailID || 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        {brand.gstin || 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <span className={`px-2 py-1 rounded-full text-xs ${brand.verifiedEmail
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {brand.verifiedEmail ? 'Verified' : 'Not Verified'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        {formatDate(brand.createdOn || brand.joinedOn)}
                                    </TableCell>
                                    <TableCell className="rounded-r-[10px] text-center pr-5">
                                        <div className="flex-center gap-2">
                                            <button
                                                className='bg-green-600 cursor border-none text-white p-2 rounded-full flex-center hover:bg-green-700'
                                                onClick={() => navigate(`/brands/edit/${brand.uid}`)}
                                                title="Edit Brand"
                                            >
                                                <MdEdit style={{ width: '16px', height: '16px' }} />
                                            </button>
                                            <button
                                                className='bg-red-600 cursor border-none text-white p-2 rounded-full flex-center hover:bg-red-700'
                                                onClick={() => handleDeleteBrand(brand.uid)}
                                                title="Delete Brand"
                                            >
                                                <MdDelete style={{ width: '16px', height: '16px' }} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        }

                        {!loadingAPI && brandList?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <div className="text-center py-8 text-lg text-muted-foreground">
                                        🚫 No Brands Found
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Container>

            {/* Add Brand Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Add New Brand</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Brand Name
                                </label>
                                <InputUi
                                    placeholder="Enter brand name"
                                    value={newBrand.name}
                                    onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <InputUi
                                    type="email"
                                    placeholder="Enter email"
                                    value={newBrand.email}
                                    onChange={(e) => setNewBrand({ ...newBrand, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <InputUi
                                    type="password"
                                    placeholder="Enter password"
                                    value={newBrand.password}
                                    onChange={(e) => setNewBrand({ ...newBrand, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddModal(false)
                                    setNewBrand({ name: '', email: '', password: '' })
                                }}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddBrand}
                                disabled={submitting}
                                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? 'Creating...' : 'Create Brand'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    )
}

export default ListBrands

