
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

const EditStaff = () => {
    const { uid } = useParams()
    const navigate = useNavigate()
    const uploadRef = useRef()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [user, setUser] = useState({
        firstname: '',
        lastname: '',
        phonenumber: '',
        email: '',
        role: 'manager',
        uid: '',
        profilePhoto: '',
        createdOn: ''
    })
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                setLoading(true)
                const { data } = await axiosInstance.get(`/admin/users/${uid}`)
                if (data.success) {
                    const userData = data.data
                    setUser({
                        firstname: userData.name?.split(' ')[0] || '',
                        lastname: userData.name?.split(' ').slice(1).join(' ') || '',
                        phonenumber: userData.phonenumber || '',
                        email: userData.emailID || '',
                        role: userData.role || 'manager',
                        uid: userData.uid || '',
                        profilePhoto: userData.profilePhoto || '',
                        createdOn: userData.createdOn || ''
                    })
                } else {
                    toast.error('Staff member not found')
                    navigate('/staff/list')
                }
            } catch (error) {
                toast.error('Failed to fetch staff details')
                navigate('/staff/list')
            } finally {
                setLoading(false)
            }
        }

        if (uid) fetchStaff()
    }, [uid, navigate])

    const updateFunction = (e, name) => {
        setUser(prev => ({ ...prev, [name]: e.target.value }))
    }

    const saveChanges = async () => {
        try {
            setSaving(true)

            let profilePhotoUrl = user.profilePhoto
            if (uploadRef.current) {
                const uploadedImages = await uploadRef.current.uploadImageFunction()
                if (uploadedImages && uploadedImages.length > 0) {
                    profilePhotoUrl = uploadedImages[0].imgUrl
                }
            }

            const updateData = {
                name: `${user.firstname} ${user.lastname}`.trim(),
                emailID: user.email,
                phonenumber: user.phonenumber,
                role: user.role,
                profilePhoto: profilePhotoUrl
            }

            const { data } = await axiosInstance.put(`/admin/users/${uid}`, updateData)

            if (data.success) {
                toast.success('Staff details updated')
                setUser(prev => ({ ...prev, profilePhoto: profilePhotoUrl }))
            } else {
                toast.error(data.message || 'Failed to update')
            }
        } catch (error) {
            toast.error('Failed to update staff member')
        } finally {
            setSaving(false)
        }
    }

    const updatePassword = async () => {
        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        try {
            setSaving(true)
            const { data } = await axiosInstance.put(`/admin/users/${uid}`, {
                password: password
            })

            if (data.success) {
                toast.success('Password updated successfully')
                setPassword('')
                setConfirmPassword('')
            } else {
                toast.error('Failed to update password')
            }
        } catch (error) {
            toast.error('Failed to update password')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Layout active={'admin-staff-list'} title={'Edit Staff'}>
                <div className="flex justify-center items-center h-64">
                    <p>Loading staff details...</p>
                </div>
            </Layout>
        )
    }

    return (
        <Layout active={'admin-staff-list'} title={'Edit Staff'}>
            <div className="max-w-5xl mx-auto py-6 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Container label={'Basic Information'}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                <div className="sm:col-span-2">
                                    <label className="text-[12px] font-semibold text-unique uppercase mb-2 block">Role</label>
                                    <select
                                        value={user.role}
                                        onChange={(e) => updateFunction(e, 'role')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-secondary-text outline-none focus:border-blue-500"
                                    >
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={saveChanges}
                                    className='px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50'
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </Container>

                        <Container label={'Change Password'}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputUi
                                    value={password}
                                    label={'New Password'}
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
                            <div className="flex justify-end mt-4">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button
                                            className='px-6 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors'
                                            disabled={!password || !confirmPassword || saving}
                                        >
                                            Reset Password
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Reset Staff Password</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to change the password for this staff member?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={updatePassword} className="bg-orange-500 text-white">
                                                Confirm Reset
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </Container>
                    </div>

                    <div className="space-y-6">
                        <Container label={'Profile Picture'}>
                            <UploadImages
                                ref={uploadRef}
                                maxImages={1}
                                defaultImages={user.profilePhoto ? [{ imgUrl: user.profilePhoto }] : []}
                                providedName="profilePhoto"
                            />
                        </Container>

                        <Container label={'Staff Details'}>
                            <div className="space-y-4 py-2">
                                <div className="flex flex-col items-center mb-4">
                                    <div className={`h-20 w-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-2 ${user.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`}>
                                        {user.firstname?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {user.role}
                                    </span>
                                </div>
                                <div className="text-sm space-y-3">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">UID:</span>
                                        <span className="font-mono font-medium">{user.uid}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Joined:</span>
                                        <span className="font-medium">{user.createdOn ? new Date(user.createdOn).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/staff/list')}
                                    className="w-full py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors mt-4"
                                >
                                    Back to List
                                </button>
                            </div>
                        </Container>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default EditStaff
