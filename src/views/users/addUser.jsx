import React, { useState } from 'react'
import Layout from './../../layout'
import InputUi from '../../components/ui/inputui'
import Container from '../../components/ui/container'
import AddressList from '../../components/address/address.list'
import OrderTable from '@/components/usersComponents/orderstable.component'
import { Skeleton } from "@/components/ui/skeleton"
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


const AddUser = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    const [user, setUser] = useState({
        firstname: 'Ronit', phonenumber: '7439398783', email: 'rseditz57@gmail.com', wallet: '7000', uid: 'ITHY98BGU235',
        lastname: 'Sarkar', lastLogin: '17:12:00 28 July', refreshToken: 'ng_852bJi5234vui87ygbbvfyu', device: 'MacInfoTech Browser', createdOn: '28 July 2025',
        securityStatus: 'active', status: 'Normal'
    })
    const [password, setPassword] = useState()
    const [confirmPassword, setConfirmPassword] = useState()

    //function
    const updateFunction = (data, name) => {
        setUser(prev => ({
            ...prev,
            [name]: data.target.value
        }));
        console.log(user);

    };

    const updateSecurityFunction = () => {
        if (confirmPassword == password) {
            toast.success('Password Update Success')
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
                        <Container gap={10} label={'Basic Information'}>
                            <div className="grid grid-cols-2 gap-3">
                                <InputUi value={user.firstname} label={'First Name'} datafunction={(e) => updateFunction(e, 'firstname')} />
                                <InputUi value={user.lastname} label={'Last Name'} datafunction={(e) => updateFunction(e, 'lastname')} />
                                <InputUi value={user.phonenumber} label={'Phone Number'} type='number' datafunction={(e) => updateFunction(e, 'phonenumber')} />
                                <InputUi value={user.email} label={'Email ID'} type='email' datafunction={(e) => updateFunction(e, 'email')} />
                                <InputUi value={user.wallet} label={'Wallet Balance'} type='wallet' datafunction={(e) => updateFunction(e, 'wallet')} />
                                <InputUi value={user.uid} label={'UID (User ID)'} type='uid' datafunction={(e) => updateFunction(e, 'uid')} />
                            </div>

                        </Container>
                        <Container gap={10} label={'Security Section'}>
                            <div className="grid grid-cols-2 gap-3">
                                <InputUi value={password} label={'Enter Password'} datafunction={(e) => setPassword(e.target.value)} />
                                <InputUi value={user.confirmPassword} label={'Confirm Password'} datafunction={(e) => setConfirmPassword(e.target.value)} />
                            </div>
                            <div className="flex item-center justify-end">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button style={{ fontFamily: 'var(--f2)' }} className='primary-button'>Change & Notify User</button>

                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white dark:bg-black dark:text-white">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>You are about to reset the password</AlertDialogTitle>
                                            <AlertDialogDescription style={{ fontFamily: 'var(--f2' }}>
                                                This action will trigger security patch which will disable the user to change password for the next 72 Hours.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction className="text-white dark:bg-cyan-500" onClick={updateSecurityFunction}>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </Container>

                        <OrderTable />
                        <ApexChartComponent />
                    </div>

                </section>
                <section className='col-span-2 gap-2'>
                    <div className="flex flex-col gap-2">
                        <Container label={'Profile Photo'}>
                            <div className="flex-center">
                                {!isLoaded && (
                                    <Skeleton className="absolute w-60 h-60 rounded-full" />
                                )}
                                <img
                                    src="https://picsum.photos/200/300"
                                    className="w-60 h-60 rounded-full transition-opacity duration-300"
                                    alt="profile"
                                    onLoad={() => {
                                        setIsLoaded(true); console.log('image loaded');
                                    }}
                                    style={{ opacity: isLoaded ? 1 : 0 }}
                                />
                            </div>
                        </Container>
                        <Container label={'Address'}>
                            <AddressList />
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

                    </div>
                </section>
            </div>
        </Layout>
    )
}

export default AddUser