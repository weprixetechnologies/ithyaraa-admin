import React from 'react'

const Container = ({ children, gap = 3, label, containerclass }) => {
    return (
        <div className={`py-3 px-3.5 rounded-lg  ${containerclass || 'bg-white'}`}>
            {
                label && <>
                    <p className='text-lg py-2 font-medium text-secondary-text'>{label}</p>
                    <hr />
                    <div className="my-2"></div></>
            }

            <div className={`flex flex-col w-full h-full gap-${gap}`}>
                {children}
            </div>

        </div>
    )
}

export default Container