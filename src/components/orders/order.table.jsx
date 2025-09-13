import React, { useState } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Container from '../ui/container';
// import { MdEdit } from "react-icons/md";
// import { IoMdEye } from 'react-icons/io';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useNavigate } from 'react-router-dom';

const OrderItemTable = ({ items }) => {

    const [orderList, setOrderList] = useState(items)
    const [loadingAPI, setLoadingAPI] = useState(false)


    // useEffect(() => {
    //     setTimeout(() => {
    //         setOrderList(orderDetailList)
    //         setLoadingAPI(false)
    //     }, 5000);
    // }, []);
    const navigate = useNavigate()

    return (

        <Container >
            <Table className="border-separate border-spacing-y-2 ">
                <TableHeader>
                    <TableRow className=" text-unique text-[16px] capitalize">
                        <TableHead className="pl-5">ID</TableHead>
                        <TableHead className="text-left pl-5">Product ID</TableHead>
                        <TableHead className="text-center ">Quantity</TableHead>
                        <TableHead className="text-center">Vendor</TableHead>
                        <TableHead className="text-center">Variation</TableHead>
                        <TableHead className="text-center">Type</TableHead>
                        <TableHead className="text-center">Amount</TableHead>
                        <TableHead className="text-center">Discount</TableHead>
                        <TableHead className="pr-5 text-center">Total</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody className="bg-white">

                    {
                        loadingAPI && orderList?.length === 0 && <TableRow>
                            <TableCell colSpan={7} className='rounded-[10px]'>

                                <DotLottieReact
                                    src="https://lottie.host/15a4b106-bbe8-40d8-bb4e-834fb23fceae/I9HKWeP6l2.lottie"
                                    loop
                                    autoplay
                                    style={{ height: '200px', width: 'auto' }}
                                />
                            </TableCell>
                        </TableRow>
                    }

                    {orderList?.length > 0 && !loadingAPI &&
                        orderList?.map((i, index) => (
                            <TableRow key={index} className="rounded-full bg-primary-dark text-white">
                                <TableCell className="rounded-l-[10px] font-bold py-5 pl-5 ">{i.id}</TableCell>
                                <TableCell className="text-center py-5 pl-5 min-w-[200px]">
                                    <div className="flex gap-2 justify-start items-center">
                                        <img src={i.featuredImage} className="h-[35px] w-[35px]  rounded-full" />
                                        <div className="flex flex-col justify-start items-start text-right">

                                            <p className='text-left font-medium '>{i.name}</p>
                                            <p className='font-light text-white max-w-[350px] truncate overflow-hidden whitespace-nowrap hover:text-dark-secondary-text cursor-pointer'>{i.productID}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className=" text-center py-5 ">{i.quantity}</TableCell>
                                <TableCell className=" text-center py-5 ">{i.vendor}</TableCell>
                                <TableCell className=" text-center py-5 ">{i.variationSlug}</TableCell>
                                <TableCell className=" text-center py-5 ">{i.type}</TableCell>
                                <TableCell className=" text-center py-5 ">{i.regularPrice}</TableCell>
                                <TableCell
                                    className=" text-center py-5 max-w-[200px] truncate overflow-hidden whitespace-nowrap"
                                >
                                    {i.discount}
                                </TableCell>
                                <TableCell className=" text-center py-5 rounded-r-[10px]">{i.total}</TableCell>

                            </TableRow>
                        ))
                    }
                    {!loadingAPI && orderList?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7}>
                                <div className="text-center py-8 text-lg text-muted-foreground">
                                    🚫 No Orders Found
                                </div>
                            </TableCell>
                        </TableRow>
                    )}


                </TableBody>

            </Table>
        </Container>

    )
}


export default OrderItemTable