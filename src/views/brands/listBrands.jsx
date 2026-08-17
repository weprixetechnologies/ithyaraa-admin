
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Container from '@/components/ui/container'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import Layout from 'src/layout'
import { MdEdit, MdDelete, MdAdd, MdSearch } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import InputUi from '@/components/ui/inputui';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-toastify';

const ListBrands = () => {
    const navigate = useNavigate()
    const [brandList, setBrandList] = useState([])
    const [loadingAPI, setLoadingAPI] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    
    // Existing logic for modal and add (kept for consistency with original file structure)
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

    // Filtered brands for search
    const filteredBrands = useMemo(() => {
        if (!searchTerm) return brandList;
        const term = searchTerm.toLowerCase();
        return brandList.filter(brand => 
            brand.name?.toLowerCase().includes(term) || 
            brand.username?.toLowerCase().includes(term) || 
            brand.emailID?.toLowerCase().includes(term) ||
            brand.uid?.toString().includes(term)
        );
    }, [brandList, searchTerm]);

    const handleAddBrand = async () => {
        if (!newBrand.name || !newBrand.email || !newBrand.password) {
            toast.error('Please fill all fields')
            return
        }

        setSubmitting(true)
        try {
            const { data } = await axiosInstance.post('/admin/brands', newBrand)
            if (data.success) {
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
                fetchBrands()
            } else {
                toast.error(data.message || 'Failed to delete brand')
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete brand')
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <Layout active={'admin-brands-list'} title={'Brands Management'}>
            <Container containerclass={'bg-transaparent'}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-gray-800">Brands Directory</h1>
                        <p className="text-sm text-gray-500">Manage and oversee all registered brand partners</p>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-grow md:w-80">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                            <input 
                                type="text"
                                placeholder="Search by name, email or UID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                            />
                        </div>
                        <button
                            onClick={() => navigate('/brands/add')}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md shadow-blue-200 transition-all whitespace-nowrap text-sm"
                        >
                            <MdAdd className="text-xl" />
                            Add New Brand
                        </button>
                    </div>
                </div>
            </Container>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-3 rounded-lg mb-6 mx-6 shadow-sm">
                    {error}
                </div>
            )}

            <Container containerclass="bg-transparent overflow-hidden">
                <div className="min-w-full inline-block align-middle">
                    <Table className="border-separate border-spacing-y-3">
                        <TableHeader>
                            <TableRow className="border-none">
                                <TableHead className="pl-6 text-gray-500 font-bold text-xs uppercase tracking-wider">UID</TableHead>
                                <TableHead className="text-left text-gray-500 font-bold text-xs uppercase tracking-wider">Brand Information</TableHead>
                                <TableHead className="text-center text-gray-500 font-bold text-xs uppercase tracking-wider">GSTIN</TableHead>
                                <TableHead className="text-center text-gray-500 font-bold text-xs uppercase tracking-wider">Status</TableHead>
                                <TableHead className="text-center text-gray-500 font-bold text-xs uppercase tracking-wider">Commission</TableHead>
                                <TableHead className="text-center text-gray-500 font-bold text-xs uppercase tracking-wider">Joined On</TableHead>
                                <TableHead className="pr-6 text-center text-gray-500 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loadingAPI && brandList?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-20">
                                        <div className="flex flex-col items-center justify-center">
                                            <DotLottieReact
                                                src="https://lottie.host/15a4b106-bbe8-40d8-bb4e-834fb23fceae/I9HKWeP6l2.lottie"
                                                loop
                                                autoplay
                                                style={{ height: '200px', width: 'auto' }}
                                            />
                                            <p className="text-gray-400 mt-4 animate-pulse">Loading brands directory...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}

                            {filteredBrands?.length > 0 && !loadingAPI &&
                                filteredBrands.map((brand) => (
                                    <TableRow key={brand.uid} className="bg-white border-none shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.08)] transition-all group">
                                        <TableCell className="rounded-l-xl font-mono text-[11px] text-gray-400 pl-6 py-4">
                                            {brand.uid}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex gap-3 items-center">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden shadow-sm">
                                                    {brand.profilePhoto ? (
                                                        <img
                                                            src={brand.profilePhoto}
                                                            alt={brand.name || brand.username}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-white font-bold text-base">
                                                            {brand.name?.charAt(0)?.toUpperCase() || brand.username?.charAt(0)?.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className='font-bold text-gray-800 text-sm leading-tight'>{brand.name || 'Unnamed Brand'}</p>
                                                    <p className='text-xs text-blue-500 font-medium'>{brand.emailID || 'No email'}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center py-4 font-mono text-[11px] text-gray-600">
                                            {brand.gstin || <span className="text-gray-300 italic">Not Provided</span>}
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${brand.verifiedEmail
                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                }`}>
                                                {brand.verifiedEmail ? 'Verified' : 'Pending'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-bold text-gray-700">
                                                    {brand.commissionPercentage !== null ? `${brand.commissionPercentage}%` : 'TBD'}
                                                </span>
                                                <span className="text-[10px] text-gray-400 uppercase font-medium">Comm.</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center py-4 text-xs font-medium text-gray-500">
                                            {formatDate(brand.createdOn || brand.joinedOn)}
                                        </TableCell>
                                        <TableCell className="rounded-r-xl py-4 pr-6">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    className='w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all transform hover:scale-110'
                                                    onClick={() => navigate(`/brands/edit/${brand.uid}`)}
                                                    title="Edit Brand"
                                                >
                                                    <MdEdit className="text-lg" />
                                                </button>
                                                <button
                                                    className='w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all transform hover:scale-110'
                                                    onClick={() => handleDeleteBrand(brand.uid)}
                                                    title="Delete Brand"
                                                >
                                                    <MdDelete className="text-lg" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }

                            {!loadingAPI && filteredBrands?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-20">
                                        <div className="text-center flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <MdSearch className="text-3xl text-gray-300" />
                                            </div>
                                            <p className="text-lg font-bold text-gray-400">No brands found</p>
                                            <p className="text-sm text-gray-300">Try adjusting your search terms</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Container>

            {/* Existing Modal kept for safety, though button navigates away */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl scale-in group">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">Add New Brand</h2>

                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Brand Name</label>
                                <InputUi
                                    placeholder="Enter brand name"
                                    value={newBrand.name}
                                    onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Official Email</label>
                                <InputUi
                                    type="email"
                                    placeholder="Enter official email"
                                    value={newBrand.email}
                                    onChange={(e) => setNewBrand({ ...newBrand, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Access Password</label>
                                <InputUi
                                    type="password"
                                    placeholder="Set temporary password"
                                    value={newBrand.password}
                                    onChange={(e) => setNewBrand({ ...newBrand, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => {
                                    setShowAddModal(false)
                                    setNewBrand({ name: '', email: '', password: '' })
                                }}
                                className="flex-1 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-50 border border-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddBrand}
                                disabled={submitting}
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
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
