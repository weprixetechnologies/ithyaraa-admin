import React, { useState, useEffect } from 'react'


const AddressList = ({ addressprop, loading = false }) => {
    const [addresslist, setAddressList] = useState(addressprop || [])

    // Update address list when prop changes
    useEffect(() => {
        setAddressList(addressprop || [])
    }, [addressprop])

    if (loading) {
        return (
            <div className='px-1.2 flex w-full flex-col gap-1.5'>
                <div className='p-3 bg-gray-100 rounded-lg animate-pulse'>
                    <div className='h-4 bg-gray-300 rounded w-1/3 mb-2'></div>
                    <div className='space-y-2'>
                        <div className='h-3 bg-gray-300 rounded w-full'></div>
                        <div className='h-3 bg-gray-300 rounded w-3/4'></div>
                        <div className='h-3 bg-gray-300 rounded w-1/2'></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!addresslist || addresslist.length === 0) {
        return (
            <div className='px-1.2 flex w-full flex-col gap-1.5'>
                <div className='p-3 bg-gray-100 rounded-lg text-center'>
                    <p className='text-gray-600 text-sm'>No addresses found</p>
                </div>
            </div>
        )
    }

    return (
        <div className='px-1.2 flex w-full flex-col gap-1.5'>
            {addresslist.map((i, index) => (
                <section key={index} className='p-3 bg-primary-dark rounded-lg'>
                    <p className='font-medium text-white text-lg'>{i.type || 'Address'}</p>
                    <section className='flex flex-col gap-1'>
                        <div className="flex justify-start gap-1 items-start">
                            <p className='text-light-cerulean-text text-semibold'>Address Line 1 : </p>
                            <p className='text-white'>{i.line1 || 'N/A'}</p>
                        </div>
                        {i.line2 && (
                            <div className="flex justify-start gap-1 items-start">
                                <p className='text-light-cerulean-text text-regular'>Address Line 2 : </p>
                                <p className='text-white'>{i.line2}</p>
                            </div>
                        )}
                        <div className="flex justify-start gap-1 items-start">
                            <p className='text-light-cerulean-text text-regular'>Pincode : </p>
                            <p className='text-white'>{i.pincode || 'N/A'}</p>
                        </div>
                        <div className="flex justify-start gap-1 items-start">
                            <p className='text-light-cerulean-text text-regular'>City / Town : </p>
                            <p className='text-white'>{i.city || 'N/A'}</p>
                        </div>
                        <div className="flex justify-start gap-1 items-start">
                            <p className='text-light-cerulean-text text-regular'>State : </p>
                            <p className='text-white'>{i.state || 'N/A'}</p>
                        </div>
                        {i.landmark && (
                            <div className="flex justify-start gap-1 items-start">
                                <p className='text-light-cerulean-text text-regular'>Landmark : </p>
                                <p className='text-white'>{i.landmark}</p>
                            </div>
                        )}
                    </section>
                </section>
            ))}
        </div>
    )
}

export default AddressList