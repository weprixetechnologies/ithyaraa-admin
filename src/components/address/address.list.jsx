import React, { useState } from 'react'


const AddressList = ({ addressprop }) => {
    const address = [
        { type: 'Work', line1: '56 Subhas Nagar', line2: 'A.K MukherJee Road', landmark: 'Noapara', city: 'Kolkata', state: 'West Bengal', pincode: '700090' },
        { type: 'Home', line1: '1/2 - 2/1 Rabindra Nagar', line2: 'Gopalnagar Road', landmark: 'Barrackpore', city: 'Sodepur', state: 'West Bengal', pincode: '700001' },
    ]

    const [addresslist, setAddressList] = useState(addressprop || address)

    return (
        <div className='px-1.2 flex w-full flex-col gap-1.5'>

            {
                addresslist?.map((i, index) => (
                    <section key={index} className='p-3 bg bg-primary-dark rounded-lg'>
                        <p className='font-medium text-white text-lg'>{i.type}</p>
                        <section className='flex flex-col gap-1'>
                            <div className="flex justify-start gap-1 items-start">
                                <p className='text-light-cerulean-text text-semibold'>Address Line 1 : </p>
                                <p className='text-white'>{i.line1}</p>
                            </div>
                            <div className="flex justify-start gap-1 items-start">
                                <p className='text-light-cerulean-text text-regular'>Address Line 2 : </p>
                                <p className='text-white'>{i.line2}</p>
                            </div>
                            <div className="flex justify-start gap-1 items-start">
                                <p className='text-light-cerulean-text text-regular'>Pincode : </p>
                                <p className='text-white'>{i.pincode}</p>
                            </div>
                            <div className="flex justify-start gap-1 items-start">
                                <p className='text-light-cerulean-text text-regular'>City / Town : </p>
                                <p className='text-white'>{i.city}</p>
                            </div>
                            <div className="flex justify-start gap-1 items-start">
                                <p className='text-light-cerulean-text text-regular'>State : </p>
                                <p className='text-white'>{i.state}</p>
                            </div>
                        </section>

                    </section>
                ))
            }
        </div>
    )
}

export default AddressList