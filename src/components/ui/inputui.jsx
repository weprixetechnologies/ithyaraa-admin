import React from 'react'

const InputUi = ({ datafunction, label, placeholder, isInput = true, type = 'text', value, labelClassp = 'text-dark-secondary-text ', fieldClass = " h-[35px]" }) => {
    return (

        <label htmlFor="" className='w-full '>
            {
                label &&
                <p className={`${labelClassp}`}>{label}</p>
            }
            {
                isInput && <input style={{ fontFamily: 'var(--f2)' }} className={`w-full p-2 rounded-[10px] my-1 border border-grey text-xs tracking-wideset ${fieldClass}`} value={value} onChange={(e) => datafunction(e)} type={type} placeholder={placeholder || `Enter Your ${label}`} />
            }
            {
                !isInput && <textarea style={{ fontFamily: 'var(--f2)' }} className={`w-full p-2 rounded-[10px] border my-1  border-grey text-xs tracking-wideset ${fieldClass}`} value={value} onChange={(e) => datafunction(e)} placeholder={placeholder || `Enter Your ${label}`}></textarea>
            }

        </label>

    )
}

export default InputUi