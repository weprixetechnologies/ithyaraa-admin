import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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

const AddBrand = () => {
    const navigate = useNavigate()
    const uploadRef = useRef()
    const [loading, setLoading] = useState(false)

    const [brand, setBrand] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        gstin: '',
        brandID: ''
    })

    const [errors, setErrors] = useState({})

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
        if (!brand.password) {
            newErrors.password = 'Password is required'
        } else if (brand.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }
        if (brand.password !== brand.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
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

    // Create brand function
    const createBrand = async () => {
        if (!validateForm()) {
            toast.error('Please fix the form errors')
            return
        }

        try {
            setLoading(true)

            // Upload brand logo if there are new images
            let brandLogoUrl = ''
            if (uploadRef.current) {
                try {
                    const uploadedImages = await uploadRef.current.uploadImageFunction()
                    if (uploadedImages && uploadedImages.length > 0) {
                        brandLogoUrl = uploadedImages[0].imgUrl
                        console.log('Brand profile photo uploaded:', brandLogoUrl)
                    }
                } catch (uploadError) {
                    console.error('Error uploading brand profile photo:', uploadError)
                    toast.error('Failed to upload brand profile photo')
                    return
                }
            }

            const brandData = {
                name: brand.name,
                email: brand.email,
                password: brand.password,
                gstin: brand.gstin || null,
                profilePhoto: brandLogoUrl // Store only as profilePhoto
            }

            console.log('Creating brand with data:', brandData)

            const response = await axiosInstance.post('/admin/brands', brandData)

            if (response.data.success) {
                toast.success('Brand created successfully!')
                toast.info('Verification email sent to brand')

                // Reset form
                setBrand({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    gstin: '',
                    brandID: ''
                })
                setErrors({})

                // Reset upload component
                if (uploadRef.current) {
                    uploadRef.current.reset()
                }

                // Navigate to brands list
                navigate('/brands/list')
            } else {
                toast.error(response.data.message || 'Failed to create brand')
            }
        } catch (error) {
            console.error('Error creating brand:', error)
            const errorMessage = error.response?.data?.message || 'Failed to create brand'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout active={'admin-brands-add'} title={'Add Brand'}>
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
                                        label={'Brand ID (Auto-generated)'}
                                        type='text'
                                        disabled={true}
                                        datafunction={(e) => updateFunction(e, 'brandID')}
                                    />
                                    <p className="text-gray-500 text-xs mt-1">Brand ID will be auto-generated</p>
                                </div>
                            </div>
                        </Container>

                        <Container gap={3} label={'Security Section'}>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <InputUi
                                        value={brand.password}
                                        label={'Enter Password'}
                                        type='password'
                                        datafunction={(e) => {
                                            setBrand(prev => ({ ...prev, password: e.target.value }))
                                            if (errors.password) {
                                                setErrors(prev => ({ ...prev, password: '' }))
                                            }
                                        }}
                                    />
                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                </div>
                                <div>
                                    <InputUi
                                        value={brand.confirmPassword}
                                        label={'Confirm Password'}
                                        type='password'
                                        datafunction={(e) => {
                                            setBrand(prev => ({ ...prev, confirmPassword: e.target.value }))
                                            if (errors.confirmPassword) {
                                                setErrors(prev => ({ ...prev, confirmPassword: '' }))
                                            }
                                        }}
                                    />
                                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                                </div>
                            </div>
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
                                            {loading ? 'Creating Brand...' : 'Create Brand'}
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white dark:bg-black dark:text-white">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Create New Brand</AlertDialogTitle>
                                            <AlertDialogDescription style={{ fontFamily: 'var(--f2)' }}>
                                                Are you sure you want to create this brand? A verification email will be sent to the brand's email address.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="text-white dark:bg-cyan-500"
                                                onClick={createBrand}
                                                disabled={loading}
                                            >
                                                {loading ? 'Creating...' : 'Create Brand'}
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
                                    defaultImages={[]}
                                    providedName="profilePhoto"
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    Click to upload a brand profile photo. Only one image allowed.
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
                                    <p className="w-40 text-black font-semibold">Status</p>
                                    <p className="text-green-500">
                                        New Brand
                                    </p>
                                </section>

                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">Verification</p>
                                    <p className="text-yellow-500">
                                        Pending
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

export default AddBrand

