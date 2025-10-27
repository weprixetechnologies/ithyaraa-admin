import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from './../../layout'
import InputUi from '../../components/ui/inputui'
import Container from '../../components/ui/container'
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
import axiosInstance from '@/lib/axiosInstance'

const EditBrand = () => {
    const navigate = useNavigate()
    const { uid } = useParams()
    const uploadRef = useRef()
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)

    const [brand, setBrand] = useState({
        name: '',
        email: '',
        gstin: '',
        uid: '',
        brandID: '',
        username: '',
        profilePhoto: ''
    })
    const [defaultProfilePhoto, setDefaultProfilePhoto] = useState([])

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    })

    const [bankDetails, setBankDetails] = useState({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        panNumber: '',
        address: ''
    })

    const [errors, setErrors] = useState({})
    const [passwordErrors, setPasswordErrors] = useState({})
    const [showPasswordSection, setShowPasswordSection] = useState(false)
    const [showBankSection, setShowBankSection] = useState(false)
    const [bankErrors, setBankErrors] = useState({})
    const [existingBankDetails, setExistingBankDetails] = useState([])
    const [loadingBankDetails, setLoadingBankDetails] = useState(false)

    // Fetch bank details for the brand
    const fetchBankDetails = async (brandUID) => {
        if (!brandUID) return

        try {
            setLoadingBankDetails(true)
            const { data } = await axiosInstance.get(`/admin/bank-details/${brandUID}/brand`)
            if (data.success) {
                setExistingBankDetails(data.data)
            }
        } catch (error) {
            console.error('Error fetching bank details:', error)
        } finally {
            setLoadingBankDetails(false)
        }
    }

    // Fetch brand data
    useEffect(() => {
        const fetchBrandData = async () => {
            try {
                setLoadingData(true)
                const { data } = await axiosInstance.get(`/admin/brands/${uid}`)

                if (data.success) {
                    setBrand({
                        name: data.data.name || '',
                        email: data.data.emailID || '',
                        gstin: data.data.gstin || '',
                        uid: data.data.uid || uid,
                        brandID: data.data.brandID || data.data.uid || uid,
                        username: data.data.username || '',
                        profilePhoto: data.data.profilePhoto || ''
                    })

                    // Set default profile photo if exists
                    if (data.data.profilePhoto) {
                        setDefaultProfilePhoto([data.data.profilePhoto])
                    }
                } else {
                    toast.error(data.message || 'Failed to load brand data')
                    navigate('/brands/list')
                }
            } catch (error) {
                console.error('Error fetching brand data:', error)
                toast.error('Failed to load brand data')
                navigate('/brands/list')
            } finally {
                setLoadingData(false)
            }
        }

        const fetchAllData = async () => {
            if (uid) {
                await fetchBrandData()
                fetchBankDetails(uid)
            }
        }

        fetchAllData()
    }, [uid, navigate])

    // Form validation
    const validateForm = () => {
        const newErrors = {}

        if (!brand.name.trim()) {
            newErrors.name = 'Brand name is required'
        }
        if (!brand.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(brand.email)) {
            newErrors.email = 'Email is invalid'
        }
        if (brand.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(brand.gstin)) {
            newErrors.gstin = 'Invalid GSTIN format'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Update brand data
    const updateFunction = (e, name) => {
        setBrand(prev => ({
            ...prev,
            [name]: e.target.value
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    // Validate password
    const validatePassword = () => {
        const newErrors = {}

        if (!passwordData.newPassword) {
            newErrors.newPassword = 'New password is required'
        } else if (passwordData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters'
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        setPasswordErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Validate bank details
    const validateBankDetails = () => {
        const newErrors = {}

        if (!bankDetails.accountHolderName.trim()) {
            newErrors.accountHolderName = 'Account holder name is required'
        }
        if (!bankDetails.accountNumber.trim()) {
            newErrors.accountNumber = 'Account number is required'
        }
        if (!bankDetails.ifscCode.trim()) {
            newErrors.ifscCode = 'IFSC code is required'
        }
        if (!bankDetails.bankName.trim()) {
            newErrors.bankName = 'Bank name is required'
        }

        setBankErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Add bank details function
    const addBankDetails = async () => {
        if (!validateBankDetails()) {
            toast.error('Please fix the bank details errors')
            return
        }

        try {
            setLoading(true)
            const { data } = await axiosInstance.post('/admin/bank-details', {
                brandID: uid,
                ...bankDetails,
                gstin: brand.gstin || null
            })

            if (data.success) {
                toast.success('Bank details added successfully!')
                setBankDetails({
                    accountHolderName: '',
                    accountNumber: '',
                    ifscCode: '',
                    bankName: '',
                    branchName: '',
                    panNumber: '',
                    address: ''
                })
                setShowBankSection(false)
                setBankErrors({})
                fetchBankDetails(uid) // Refresh bank details list
            } else {
                toast.error(data.message || 'Failed to add bank details')
            }
        } catch (error) {
            console.error('Error adding bank details:', error)
            const errorMessage = error.response?.data?.message || 'Failed to add bank details'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    // Reset password function
    const resetPassword = async () => {
        if (!validatePassword()) {
            toast.error('Please fix the password errors')
            return
        }

        try {
            setLoading(true)
            const { data } = await axiosInstance.put(`/admin/brands/${uid}/reset-password`, {
                newPassword: passwordData.newPassword
            })

            if (data.success) {
                toast.success('Password reset successfully!')
                setPasswordData({ newPassword: '', confirmPassword: '' })
                setShowPasswordSection(false)
                setPasswordErrors({})
            } else {
                toast.error(data.message || 'Failed to reset password')
            }
        } catch (error) {
            console.error('Error resetting password:', error)
            const errorMessage = error.response?.data?.message || 'Failed to reset password'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    // Update brand function
    const updateBrand = async () => {
        if (!validateForm()) {
            toast.error('Please fix the form errors')
            return
        }

        try {
            setLoading(true)

            // Upload brand profile photo if there are new images
            let brandLogoUrl = ''
            if (uploadRef.current && typeof uploadRef.current.uploadImageFunction === 'function') {
                try {
                    console.log('Attempting to upload profile photo...')
                    const uploadedImages = await uploadRef.current.uploadImageFunction()
                    console.log('Upload response:', uploadedImages)
                    if (uploadedImages && Array.isArray(uploadedImages) && uploadedImages.length > 0) {
                        brandLogoUrl = uploadedImages[0].imgUrl
                        console.log('Brand profile photo uploaded:', brandLogoUrl)
                    } else {
                        console.log('No images were uploaded or array is empty')
                    }
                } catch (uploadError) {
                    console.error('Error uploading brand profile photo:', uploadError)
                    // Don't fail the whole update if photo upload fails - just log it
                    console.log('Continuing without profile photo update')
                }
            } else {
                console.log('Upload ref not available or no upload function')
            }

            const brandData = {
                name: brand.name,
                email: brand.email,
                gstin: brand.gstin || null,
            }

            // Add profile photo URL if uploaded
            if (brandLogoUrl && brandLogoUrl.trim() !== '') {
                brandData.profilePhoto = brandLogoUrl
                console.log('Adding profilePhoto to update:', brandLogoUrl)
            } else {
                console.log('No profile photo to upload or update')
            }

            console.log('Final brand update data:', brandData)

            const response = await axiosInstance.put(`/admin/brands/${uid}`, brandData)

            if (response.data.success) {
                toast.success('Brand updated successfully!')

                // Refresh page to show updated data
                window.location.reload()
            } else {
                toast.error(response.data.message || 'Failed to update brand')
            }
        } catch (error) {
            console.error('Error updating brand:', error)
            const errorMessage = error.response?.data?.message || 'Failed to update brand'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    if (loadingData) {
        return (
            <Layout active="admin-brands-list" title="Edit Brand">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading brand data...</div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout active="admin-brands-list" title="Edit Brand">
            <div className="grid grid-cols-6 gap-6 h-full">
                <section className='col-span-4 w-full'>
                    <div className="flex flex-col gap-3">
                        <Container gap={3} label={'Basic Information'}>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <InputUi
                                        value={brand.name}
                                        label={'Brand Name'}
                                        datafunction={(e) => updateFunction(e, 'name')}
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <InputUi
                                        value={brand.email}
                                        label={'Email ID'}
                                        type='email'
                                        datafunction={(e) => updateFunction(e, 'email')}
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <InputUi
                                        value={brand.gstin}
                                        label={'GSTIN (Optional)'}
                                        type='text'
                                        placeholder='e.g., 27AABCU9603R1ZX'
                                        datafunction={(e) => updateFunction(e, 'gstin')}
                                    />
                                    {errors.gstin && <p className="text-red-500 text-sm mt-1">{errors.gstin}</p>}
                                    <p className="text-gray-500 text-xs mt-1">Format: 27AAAAA0000A1Z5</p>
                                </div>
                                <div>
                                    <InputUi
                                        value={brand.brandID}
                                        label={'Brand ID'}
                                        type='text'
                                        disabled={true}
                                        datafunction={(e) => updateFunction(e, 'brandID')}
                                    />
                                    <p className="text-gray-500 text-xs mt-1">Brand ID (cannot be changed)</p>
                                </div>
                            </div>
                        </Container>

                        <Container gap={3} label={'Reset Password'}>
                            <div className="mb-4">
                                <button
                                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    {showPasswordSection ? 'Cancel' : '+ Reset Password'}
                                </button>
                            </div>

                            {showPasswordSection && (
                                <div className="space-y-4">
                                    <div>
                                        <InputUi
                                            value={passwordData.newPassword}
                                            label={'New Password'}
                                            type="password"
                                            datafunction={(e) => {
                                                setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))
                                                if (passwordErrors.newPassword) {
                                                    setPasswordErrors(prev => ({ ...prev, newPassword: '' }))
                                                }
                                            }}
                                        />
                                        {passwordErrors.newPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>}
                                    </div>

                                    <div>
                                        <InputUi
                                            value={passwordData.confirmPassword}
                                            label={'Confirm New Password'}
                                            type="password"
                                            datafunction={(e) => {
                                                setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))
                                                if (passwordErrors.confirmPassword) {
                                                    setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }))
                                                }
                                            }}
                                        />
                                        {passwordErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>}
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={resetPassword}
                                            disabled={loading}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {loading ? 'Resetting...' : 'Reset Password'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Container>

                        <Container gap={3} label={'Add Bank Details'}>
                            <div className="mb-4">
                                <button
                                    onClick={() => setShowBankSection(!showBankSection)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    {showBankSection ? 'Cancel' : '+ Add Bank Details'}
                                </button>
                            </div>

                            {showBankSection && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <InputUi
                                                value={bankDetails.accountHolderName}
                                                label={'Account Holder Name'}
                                                datafunction={(e) => {
                                                    setBankDetails(prev => ({ ...prev, accountHolderName: e.target.value }))
                                                    if (bankErrors.accountHolderName) {
                                                        setBankErrors(prev => ({ ...prev, accountHolderName: '' }))
                                                    }
                                                }}
                                            />
                                            {bankErrors.accountHolderName && <p className="text-red-500 text-sm mt-1">{bankErrors.accountHolderName}</p>}
                                        </div>

                                        <div>
                                            <InputUi
                                                value={bankDetails.accountNumber}
                                                label={'Account Number'}
                                                datafunction={(e) => {
                                                    setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))
                                                    if (bankErrors.accountNumber) {
                                                        setBankErrors(prev => ({ ...prev, accountNumber: '' }))
                                                    }
                                                }}
                                            />
                                            {bankErrors.accountNumber && <p className="text-red-500 text-sm mt-1">{bankErrors.accountNumber}</p>}
                                        </div>

                                        <div>
                                            <InputUi
                                                value={bankDetails.ifscCode}
                                                label={'IFSC Code'}
                                                datafunction={(e) => {
                                                    setBankDetails(prev => ({ ...prev, ifscCode: e.target.value }))
                                                    if (bankErrors.ifscCode) {
                                                        setBankErrors(prev => ({ ...prev, ifscCode: '' }))
                                                    }
                                                }}
                                            />
                                            {bankErrors.ifscCode && <p className="text-red-500 text-sm mt-1">{bankErrors.ifscCode}</p>}
                                        </div>

                                        <div>
                                            <InputUi
                                                value={bankDetails.bankName}
                                                label={'Bank Name'}
                                                datafunction={(e) => {
                                                    setBankDetails(prev => ({ ...prev, bankName: e.target.value }))
                                                    if (bankErrors.bankName) {
                                                        setBankErrors(prev => ({ ...prev, bankName: '' }))
                                                    }
                                                }}
                                            />
                                            {bankErrors.bankName && <p className="text-red-500 text-sm mt-1">{bankErrors.bankName}</p>}
                                        </div>

                                        <div>
                                            <InputUi
                                                value={bankDetails.branchName}
                                                label={'Branch Name (Optional)'}
                                                datafunction={(e) => setBankDetails(prev => ({ ...prev, branchName: e.target.value }))}
                                            />
                                        </div>

                                        <div>
                                            <InputUi
                                                value={bankDetails.panNumber}
                                                label={'PAN Number (Optional)'}
                                                datafunction={(e) => setBankDetails(prev => ({ ...prev, panNumber: e.target.value }))}
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <InputUi
                                                value={bankDetails.address}
                                                label={'Address (Optional)'}
                                                datafunction={(e) => setBankDetails(prev => ({ ...prev, address: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={addBankDetails}
                                            disabled={loading}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {loading ? 'Adding...' : 'Add Bank Details'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Container>

                        {/* Existing Bank Details Section */}
                        <Container gap={3} label={'Existing Bank Details'}>
                            {loadingBankDetails ? (
                                <div className="text-center py-4 text-gray-500">Loading bank details...</div>
                            ) : existingBankDetails && existingBankDetails.length > 0 ? (
                                <div className="space-y-3">
                                    {existingBankDetails.map((bank, index) => (
                                        <div key={bank.bankDetailID} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-lg">{bank.bankName}</h4>
                                                    {bank.branchName && <p className="text-sm text-gray-600">{bank.branchName}</p>}
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs ${bank.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    bank.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {bank.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Account Holder:</p>
                                                    <p className="font-medium">{bank.accountHolderName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Account Number:</p>
                                                    <p className="font-medium font-mono">{bank.accountNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">IFSC Code:</p>
                                                    <p className="font-medium font-mono">{bank.ifscCode}</p>
                                                </div>
                                                {bank.panNumber && (
                                                    <div>
                                                        <p className="text-gray-600">PAN Number:</p>
                                                        <p className="font-medium">{bank.panNumber}</p>
                                                    </div>
                                                )}
                                                {bank.address && (
                                                    <div className="col-span-2">
                                                        <p className="text-gray-600">Address:</p>
                                                        <p className="font-medium">{bank.address}</p>
                                                    </div>
                                                )}
                                                <div className="col-span-2 text-xs text-gray-500">
                                                    Added on: {new Date(bank.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No bank details found for this brand
                                </div>
                            )}
                        </Container>

                        <Container gap={3} label={'Actions'}>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => navigate('/brands/list')}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button
                                            style={{ fontFamily: 'var(--f2)' }}
                                            className='primary-button'
                                            disabled={loading}
                                        >
                                            {loading ? 'Updating Brand...' : 'Update Brand'}
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white dark:bg-black dark:text-white">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Update Brand</AlertDialogTitle>
                                            <AlertDialogDescription style={{ fontFamily: 'var(--f2)' }}>
                                                Are you sure you want to update this brand's information?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="text-white dark:bg-cyan-500"
                                                onClick={updateBrand}
                                                disabled={loading}
                                            >
                                                {loading ? 'Updating...' : 'Update Brand'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </Container>
                    </div>
                </section>

                <section className='col-span-2 gap-2'>
                    <div className="flex flex-col gap-2">
                        <Container label={'Brand Profile Photo'}>
                            <div className="w-full">
                                <UploadImages
                                    ref={uploadRef}
                                    maxImages={1}
                                    defaultImages={defaultProfilePhoto}
                                    providedName="profilePhoto"
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    Click to upload a new brand profile photo. Only one image allowed.
                                </p>
                            </div>
                        </Container>

                        <Container label={'Brand Information'} containerclass={'mb-10 bg-white'}>
                            <div className="flex flex-col gap-2">
                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">Brand Name</p>
                                    <p className="text-secondary-text">
                                        {brand.name || 'Not provided'}
                                    </p>
                                </section>

                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">Username</p>
                                    <p className="text-secondary-text">
                                        @{brand.username}
                                    </p>
                                </section>

                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">Email</p>
                                    <p className="text-secondary-text max-w-[70%] truncate">
                                        {brand.email || 'Not provided'}
                                    </p>
                                </section>

                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">GSTIN</p>
                                    <p className="text-secondary-text">
                                        {brand.gstin || 'Not provided'}
                                    </p>
                                </section>

                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">Brand ID</p>
                                    <p className="text-secondary-text">
                                        {brand.brandID || brand.uid}
                                    </p>
                                </section>
                            </div>
                        </Container>
                    </div>
                </section>
            </div>
        </Layout>
    )
}

export default EditBrand

