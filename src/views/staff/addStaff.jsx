
import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from './../../layout'
import InputUi from '../../components/ui/inputui'
import Container from '../../components/ui/container'
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
import UploadImages from '@/components/ui/uploadImages'

const AddStaff = () => {
    const navigate = useNavigate()
    const uploadRef = useRef()
    const [loading, setLoading] = useState(false)

    const [user, setUser] = useState({
        firstname: '',
        lastname: '',
        phonenumber: '',
        email: '',
        role: 'manager' // Default to manager
    })
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errors, setErrors] = useState({})

    const validateForm = () => {
        const newErrors = {}

        if (!user.firstname.trim()) newErrors.firstname = 'First name is required'
        if (!user.lastname.trim()) newErrors.lastname = 'Last name is required'
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

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const updateFunction = (e, name) => {
        setUser(prev => ({ ...prev, [name]: e.target.value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const createStaff = async () => {
        if (!validateForm()) {
            toast.error('Please fix the form errors')
            return
        }

        try {
            setLoading(true)

            let profilePhotoUrl = ''
            if (uploadRef.current) {
                const uploadedImages = await uploadRef.current.uploadImageFunction()
                if (uploadedImages && uploadedImages.length > 0) {
                    profilePhotoUrl = uploadedImages[0].imgUrl
                }
            }

            const staffData = {
                name: `${user.firstname} ${user.lastname}`.trim(),
                email: user.email,
                phonenumber: user.phonenumber,
                password: password,
                role: user.role,
                profilePhoto: profilePhotoUrl,
                referCode: 'ITHY-STAFF'
            }

            const response = await axiosInstance.post('/user/create-user', staffData)

            if (response.data.success) {
                toast.success(`${user.role.charAt(0).toUpperCase() + user.role.slice(1)} created successfully!`)
                navigate('/staff/list')
            } else {
                toast.error(response.data.message || 'Failed to create staff')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create staff member')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout active={'admin-staff-add'} title={'Add Staff Member'}>
            <div className="max-w-4xl mx-auto py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <Container label={'Basic Information'}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputUi
                                        value={user.firstname}
                                        label={'First Name'}
                                        datafunction={(e) => updateFunction(e, 'firstname')}
                                    />
                                    {errors.firstname && <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>}
                                </div>
                                <div>
                                    <InputUi
                                        value={user.lastname}
                                        label={'Last Name'}
                                        datafunction={(e) => updateFunction(e, 'lastname')}
                                    />
                                    {errors.lastname && <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>}
                                </div>
                                <div>
                                    <InputUi
                                        value={user.phonenumber}
                                        label={'Phone Number'}
                                        type='number'
                                        datafunction={(e) => updateFunction(e, 'phonenumber')}
                                    />
                                    {errors.phonenumber && <p className="text-red-500 text-xs mt-1">{errors.phonenumber}</p>}
                                </div>
                                <div>
                                    <InputUi
                                        value={user.email}
                                        label={'Email ID'}
                                        type='email'
                                        datafunction={(e) => updateFunction(e, 'email')}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[12px] font-semibold text-unique uppercase mb-2 block">Role</label>
                                    <select
                                        value={user.role}
                                        onChange={(e) => updateFunction(e, 'role')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-secondary-text outline-none focus:border-blue-500"
                                    >
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Managers have limited access, while Admins have full access.
                                    </p>
                                </div>
                            </div>
                        </Container>

                        <Container label={'Security'}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputUi
                                        value={password}
                                        label={'Password'}
                                        type='password'
                                        datafunction={(e) => setPassword(e.target.value)}
                                    />
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>
                                <div>
                                    <InputUi
                                        value={confirmPassword}
                                        label={'Confirm Password'}
                                        type='password'
                                        datafunction={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                                </div>
                            </div>
                        </Container>

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => navigate('/staff/list')}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button
                                        className='px-8 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors'
                                        disabled={loading}
                                    >
                                        {loading ? 'Creating...' : 'Create Staff Member'}
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will create a new account with <strong>{user.role}</strong> privileges.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={createStaff} className="bg-blue-600 text-white hover:bg-blue-700">
                                            Confirm
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Container label={'Profile Picture'}>
                            <UploadImages
                                ref={uploadRef}
                                maxImages={1}
                                defaultImages={[]}
                                providedName="profilePhoto"
                            />
                            <p className="text-[10px] text-gray-400 mt-2 text-center">
                                Square image recommended (e.g. 512x512)
                            </p>
                        </Container>

                        <Container label={'Preview'}>
                            <div className="flex flex-col items-center gap-3 py-4">
                                <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${user.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`}>
                                    {user.firstname ? user.firstname.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg">{user.firstname || 'First'} {user.lastname || 'Last'}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {user.role}
                                    </span>
                                </div>
                                <div className="w-full text-xs space-y-2 mt-4 text-gray-600 border-t pt-4">
                                    <div className="flex justify-between">
                                        <span>Email:</span>
                                        <span className="font-medium truncate max-w-[120px]">{user.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Phone:</span>
                                        <span className="font-medium">{user.phonenumber || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </Container>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default AddStaff
