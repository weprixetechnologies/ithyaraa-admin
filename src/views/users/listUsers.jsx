
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Container from '@/components/ui/container'
import React, { useEffect, useState } from 'react'
import Layout from 'src/layout'
import { MdEdit } from "react-icons/md";
import { IoMdEye } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import InputUi from '@/components/ui/inputui';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Skeleton } from '@/components/ui/skeleton';

const ListUsersc = () => {
    const [loadingImage, setLoading] = useState(true)
    const [userlist, setUserList] = useState([])
    const [loadingAPI, setLoadingAPI] = useState(true)
    useEffect(() => {
        setTimeout(() => {
            setUserList([
                {
                    name: "Ronit Sarkar",
                    refreshToken: "ref_vj_835bk2l2nbrfoi35jeoo35jwtc_1",
                    uid: "UID001",
                    phonenumber: "+91 98765 43210",
                    email: "ronit.sarkar01@example.com",
                    createdOn: "2024-11-23T10:15:00Z",
                    profileId: "P001",
                    profilePhoto: "https://picsum.photos/seed/1/200/200"
                },
                {
                    name: "Ananya Mehta",
                    refreshToken: "ref_29xk38sduqhjwefj923fw_2",
                    uid: "UID002",
                    phonenumber: "+91 93456 78123",
                    email: "ananya.mehta@example.com",
                    createdOn: "2025-01-05T14:45:00Z",
                    profileId: "P002",
                    profilePhoto: "https://picsum.photos/seed/2/200/200"
                },
                {
                    name: "Rohit Sharma",
                    refreshToken: "ref_jf82jdf02nfd023_3",
                    uid: "UID003",
                    phonenumber: "+91 91234 56789",
                    email: "rohit.sharma@example.com",
                    createdOn: "2025-04-12T09:20:00Z",
                    profileId: "P003",
                    profilePhoto: "https://picsum.photos/seed/3/200/200"
                },
                {
                    name: "Sneha Kapoor",
                    refreshToken: "ref_lkdj23jnd23jkdf93_4",
                    uid: "UID004",
                    phonenumber: "+91 99887 76655",
                    email: "sneha.kapoor@example.com",
                    createdOn: "2024-09-19T17:00:00Z",
                    profileId: "P004",
                    profilePhoto: "https://picsum.photos/seed/4/200/200"
                },
                {
                    name: "Aman Verma",
                    refreshToken: "ref_8dsf9283jf8234jf_5",
                    uid: "UID005",
                    phonenumber: "+91 90012 34567",
                    email: "aman.verma@example.com",
                    createdOn: "2025-06-02T12:10:00Z",
                    profileId: "P005",
                    profilePhoto: "https://picsum.photos/seed/5/200/200"
                },
                {
                    name: "Isha Singh",
                    refreshToken: "ref_2938jdf98fjdf9023_6",
                    uid: "UID006",
                    phonenumber: "+91 78945 12365",
                    email: "isha.singh@example.com",
                    createdOn: "2024-12-11T08:35:00Z",
                    profileId: "P006",
                    profilePhoto: "https://picsum.photos/seed/6/200/200"
                },
                {
                    name: "Arjun Das",
                    refreshToken: "ref_sdf9238jdf032jf0_7",
                    uid: "UID007",
                    phonenumber: "+91 98700 11223",
                    email: "arjun.das@example.com",
                    createdOn: "2025-03-15T16:00:00Z",
                    profileId: "P007",
                    profilePhoto: "https://picsum.photos/seed/7/200/200"
                },
                {
                    name: "Neha Joshi",
                    refreshToken: "ref_jdf923jf023jf029_8",
                    uid: "UID008",
                    phonenumber: "+91 98123 45678",
                    email: "neha.joshi@example.com",
                    createdOn: "2025-05-01T11:30:00Z",
                    profileId: "P008",
                    profilePhoto: "https://picsum.photos/seed/8/200/200"
                },
                {
                    name: "Karan Bhatt",
                    refreshToken: "ref_sdf2093jdf209fj2_9",
                    uid: "UID009",
                    phonenumber: "+91 90901 01010",
                    email: "karan.bhatt@example.com",
                    createdOn: "2025-02-20T07:50:00Z",
                    profileId: "P009",
                    profilePhoto: "https://picsum.photos/seed/9/200/200"
                },
                {
                    name: "Priya Nair",
                    refreshToken: "ref_jdf0923jf0293jdf_10",
                    uid: "UID010",
                    phonenumber: "+91 91122 33445",
                    email: "priya.nair@example.com",
                    createdOn: "2025-07-10T13:15:00Z",
                    profileId: "P010",
                    profilePhoto: "https://picsum.photos/seed/10/200/200"
                }
            ]);
            setLoadingAPI(false)
        }, 5000);
    }, []);

    const navigate = useNavigate()

    return (

        <Layout active={'admin-users-all'} title={'List of Users'}>
            <Container containerclass={'bg-transaparent'}>
                <div className="flex w-full items-center gap-4">
                    <div className="grid grid-cols-3 gap-4 flex-grow w-full">
                        <InputUi placeholder={'Enter Refresh ID / Name / Email ID'} />
                        <InputUi placeholder={'Enter Phone Number / UID'} />
                        <InputUi type='date' placeholder={'Enter UID'} />
                    </div>
                    <button className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded text-[12px]">
                        Filter On Search
                    </button>
                </div>

            </Container>

            <Container containerclass="bg-transparent">
                <Table className="border-separate border-spacing-y-2 ">
                    <TableHeader>
                        <TableRow className=" text-unique text-[16px] uppercase">
                            <TableHead className="pl-5">UID</TableHead>
                            <TableHead className="text-left pl-10">Profile</TableHead>
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
                            userlist?.map((i, index) => (
                                <TableRow key={index} className="rounded-full bg-white  shadow-lg shadow-cyan-500/50">
                                    <TableCell className="rounded-l-[10px] font-bold py-5 pl-5 ">{i.uid}</TableCell>
                                    <TableCell className="text-center py-5 pl-10">
                                        <div className="flex gap-2 justify-start items-center">
                                            {loadingImage && (
                                                <Skeleton className="absolute h-[35px] w-[35px]  rounded-full" />
                                            )}
                                            <img src={i.profilePhoto} className="h-[35px] w-[35px]  rounded-full" />
                                            <div className="flex flex-col justify-start items-start text-right">

                                                <p className='text-right font-medium '>{i.name}</p>
                                                <p className='font-light text-secondary-text max-w-[350px] truncate overflow-hidden whitespace-nowrap hover:text-dark-secondary-text cursor-pointer'>{i.refreshToken}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className=" text-left py-5 ">{i.phonenumber}</TableCell>
                                    <TableCell
                                        className=" text-center py-5 max-w-[200px] truncate overflow-hidden whitespace-nowrap"
                                    >
                                        {i.email}
                                    </TableCell>
                                    <TableCell className=" text-center py-5">{i.createdOn}</TableCell>
                                    <TableCell className="rounded-r-[10px] text-center pr-5">
                                        <div className="flex-center gap-2">
                                            <button className='bg-green-600 cursor border-none text-white p-2 rounded-full flex-center' onClick={() => navigate('/users/add')}><MdEdit style={{ width: '16px', height: '16px' }} /></button>
                                            <button className='bg-blue-600 cursor border-none text-white p-2 rounded-full flex-center' onClick={() => navigate('/users/add')}><IoMdEye style={{ width: '16px', height: '16px' }} /></button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                        {!loadingAPI && userlist?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <div className="text-center py-8 text-lg text-muted-foreground">
                                        🚫 No Users Found
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}


                    </TableBody>

                </Table>
            </Container>
        </Layout >
    )
}

export default ListUsersc