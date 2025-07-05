import React from 'react';
import './ui-component.css';

const InputCustomLabelled = ({
    isLabel = true,
    value,
    inputFunction = () => { },
    label,
    placeholder,
    type = "text",
    labelClasses = "",
    pClasses = "",
    inputClasses = "",
    htmlFor,
    height = 40,
    width = 100,
    textareaclasses = "",
    isInput = true
}) => {
    return (
        <div className="labelcontainer-custom">
            <label htmlFor={htmlFor} className={labelClasses}>
                {
                    isLabel && <p className={`${pClasses} p-customlabbelled`}>{label}</p>
                }


                {isInput ? (
                    <input
                        className={`${inputClasses} custominput`}
                        style={{ height: `${height}px`, width: `${width}%` }}
                        id={htmlFor}
                        type={type}
                        onChange={(e) => inputFunction(e.target.value)}
                        placeholder={placeholder}
                        value={value}
                    />
                ) : (
                    <textarea
                        style={{ height: `${height}px`, width: `${width}%` }}
                        id={htmlFor}
                        placeholder={placeholder}
                        className={`${textareaclasses} textarea-custom`}
                        onChange={(e) => inputFunction(e.target.value)}
                        value={value}
                    />
                )}
            </label>
        </div>
    );
};

export default InputCustomLabelled;
