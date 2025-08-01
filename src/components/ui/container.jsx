import React from 'react'

const Container = ({ children, gap = 10, label, containerclass }) => {
    return (
        <div className={`py-3 px-3.5 rounded-lg  ${containerclass || 'bg-white'}`}>
            {
                label && <>
                    <p className='text-lg py-2 font-medium text-secondary-text'>{label}</p>
                    <hr />
                    <div className="my-2"></div></>
            }

            <div className={`flex w-full h-full gap-[${gap}px]`}></div>
            {children}
        </div>
    )
}

export default Container