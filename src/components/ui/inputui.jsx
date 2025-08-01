import React from 'react'

const InputUi = ({ datafunction, label, placeholder, isInput = true, type = 'text', value }) => {
    return (

        <label htmlFor="" className='w-full '>
            {
                label &&
                <p className='text-dark-secondary-text'>{label}</p>
            }
            {
                isInput && <input style={{ fontFamily: 'var(--f2)' }} className='w-full max-h-[45px] min-h-[30px] p-2 rounded-[10px] my-1 border border-grey text-xs tracking-wideset' value={value} onChange={(e) => datafunction(e)} type={type} placeholder={placeholder || `Enter Your ${label}`} />
            }
            {
                !isInput && <textarea className='w-full max-h-[45px] min-h-[30px] p-2 rounded-[10px]' value={value} onChange={(e) => datafunction(e)}></textarea>
            }

        </label>

    )
}

export default InputUi