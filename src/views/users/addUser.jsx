import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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


const AddUser = () => {
    const navigate = useNavigate()
    const uploadRef = useRef()
    const [isLoaded, setIsLoaded] = useState(false)
    const [loading, setLoading] = useState(false)

    const [user, setUser] = useState({
        firstname: '',
        lastname: '',
        phonenumber: '',
        email: '',
        wallet: '0',
        uid: '',
        profilePhoto: ''
    })
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errors, setErrors] = useState({})

    // Form validation
    const validateForm = () => {
        const newErrors = {}

        if (!user.firstname.trim()) {
            newErrors.firstname = 'First name is required'
        }
        if (!user.lastname.trim()) {
            newErrors.lastname = 'Last name is required'
        }
        if (!user.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(user.email)) {
            newErrors.email = 'Email is invalid'
        }
        if (!user.phonenumber.trim()) {
            newErrors.phonenumber = 'Phone number is required'
        } else if (!/^\d{10}$/.test(user.phonenumber)) {
            newErrors.phonenumber = 'Phone number must be 10 digits'
        }
        if (!password) {
            newErrors.password = 'Password is required'
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }
        if (user.wallet && isNaN(parseFloat(user.wallet))) {
            newErrors.wallet = 'Wallet balance must be a number'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Update user data
    const updateFunction = (data, name) => {
        setUser(prev => ({
            ...prev,
            [name]: data.target.value
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    // Create user function
    const createUser = async () => {
        if (!validateForm()) {
            toast.error('Please fix the form errors')
            return
        }

        try {
            setLoading(true)

            // Upload profile photo if there are new images
            let profilePhotoUrl = ''
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

            const userData = {
                name: `${user.firstname} ${user.lastname}`.trim(),
                email: user.email,
                phonenumber: user.phonenumber,
                password: password,
                wallet: parseFloat(user.wallet) || 0,
                referCode: 'ITHY-ADMIN',
                profilePhoto: profilePhotoUrl
            }

            console.log('Creating user with data:', userData)

            const response = await axiosInstance.post('/user/create-user', userData)

            if (response.data.success) {
                // toast.success('User created successfully!')
                toast.info('Verification email sent to user')

                // Reset form
                setUser({
                    firstname: '',
                    lastname: '',
                    phonenumber: '',
                    email: '',
                    wallet: '0',
                    uid: '',
                    profilePhoto: ''
                })
                setPassword('')
                setConfirmPassword('')
                setErrors({})

                // Reset upload component
                if (uploadRef.current) {
                    uploadRef.current.reset()
                }

                // Navigate to users list
                navigate('/users/list')
            } else {
                toast.error(response.data.message || 'Failed to create user')
            }
        } catch (error) {
            console.error('Error creating user:', error)
            const errorMessage = error.response?.data?.message || 'Failed to create user'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const updateSecurityFunction = () => {
        if (confirmPassword === password) {
            // toast.success('Password Update Success')
            toast.warning('Update Email Sent')
        } else {
            toast.error('Password Mismatch !')
        }
    }

    return (
        <Layout active={'admin-users-add'} title={'Add User'}>

            <div className="grid grid-cols-6 gap-6 h-full">
                <section className='col-span-4 w-full'>
                    <div className="flex flex-col gap-3">
                        <Container gap={3} label={'Basic Information'}>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <InputUi
                                        value={user.firstname}
                                        label={'First Name'}
                                        datafunction={(e) => updateFunction(e, 'firstname')}
                                    />
                                    {errors.firstname && <p className="text-red-500 text-sm mt-1">{errors.firstname}</p>}
                                </div>
                                <div>
                                    <InputUi
                                        value={user.lastname}
                                        label={'Last Name'}
                                        datafunction={(e) => updateFunction(e, 'lastname')}
                                    />
                                    {errors.lastname && <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>}
                                </div>
                                <div>
                                    <InputUi
                                        value={user.phonenumber}
                                        label={'Phone Number'}
                                        type='number'
                                        datafunction={(e) => updateFunction(e, 'phonenumber')}
                                    />
                                    {errors.phonenumber && <p className="text-red-500 text-sm mt-1">{errors.phonenumber}</p>}
                                </div>
                                <div>
                                    <InputUi
                                        value={user.email}
                                        label={'Email ID'}
                                        type='email'
                                        datafunction={(e) => updateFunction(e, 'email')}
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <InputUi
                                        value={user.wallet}
                                        label={'Wallet Balance'}
                                        type='number'
                                        datafunction={(e) => updateFunction(e, 'wallet')}
                                    />
                                    {errors.wallet && <p className="text-red-500 text-sm mt-1">{errors.wallet}</p>}
                                </div>
                                <div>
                                    <InputUi
                                        value={user.uid}
                                        label={'UID (Auto-generated)'}
                                        type='text'
                                        disabled={true}
                                        datafunction={(e) => updateFunction(e, 'uid')}
                                    />
                                    <p className="text-gray-500 text-xs mt-1">UID will be auto-generated</p>
                                </div>
                            </div>

                        </Container>
                        <Container gap={3} label={'Security Section'}>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <InputUi
                                        value={password}
                                        label={'Enter Password'}
                                        type='password'
                                        datafunction={(e) => {
                                            setPassword(e.target.value)
                                            if (errors.password) {
                                                setErrors(prev => ({ ...prev, password: '' }))
                                            }
                                        }}
                                    />
                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                </div>
                                <div>
                                    <InputUi
                                        value={confirmPassword}
                                        label={'Confirm Password'}
                                        type='password'
                                        datafunction={(e) => {
                                            setConfirmPassword(e.target.value)
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
                                    onClick={() => navigate('/users')}
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
                                            {loading ? 'Creating User...' : 'Create User'}
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white dark:bg-black dark:text-white">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Create New User</AlertDialogTitle>
                                            <AlertDialogDescription style={{ fontFamily: 'var(--f2)' }}>
                                                Are you sure you want to create this user? A verification email will be sent to the user's email address.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="text-white dark:bg-cyan-500"
                                                onClick={createUser}
                                                disabled={loading}
                                            >
                                                {loading ? 'Creating...' : 'Create User'}
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
                        <Container label={'Profile Photo'}>
                            <div className="w-full">
                                <UploadImages
                                    ref={uploadRef}
                                    maxImages={1}
                                    defaultImages={[]}
                                    providedName="profilePhoto"
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    Click to upload a profile photo. Only one image allowed.
                                </p>
                            </div>
                        </Container>
                        <Container label={'Address'}>
                            <AddressList addressprop={[]} loading={false} />
                        </Container>
                        <Container label={'User Information'} containerclass={'mb-10 bg-white'}>
                            <div className="flex flex-col gap-2">

                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">Full Name</p>
                                    <p className="text-secondary-text">
                                        {user.firstname && user.lastname
                                            ? `${user.firstname} ${user.lastname}`
                                            : 'Not provided'
                                        }
                                    </p>
                                </section>

                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">Email</p>
                                    <p className="text-secondary-text max-w-[70%] truncate">
                                        {user.email || 'Not provided'}
                                    </p>
                                </section>

                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">Phone</p>
                                    <p className="text-secondary-text">
                                        {user.phonenumber || 'Not provided'}
                                    </p>
                                </section>

                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">Wallet Balance</p>
                                    <p className="text-secondary-text">
                                        ₹{user.wallet || '0'}
                                    </p>
                                </section>

                                <section className="flex items-center gap-3">
                                    <p className="w-40 text-black font-semibold">Status</p>
                                    <p className="text-green-500">
                                        New User
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

export default AddUser