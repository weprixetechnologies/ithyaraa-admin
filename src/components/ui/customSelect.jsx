import React from 'react';
import './ui-component.css';

const SelectCustomLabelled = ({
    isLabel = true,
    value,
    selectFunction,
    label = '',
    options = [],
    labelClasses = "",
    pClasses = "",
    selectClasses = "",
    htmlFor,
    height = 40,
    width = 100,
    required = false,
    disabled = false,
    name = htmlFor,
    showPlaceholder = true,
    placeholder = "-- Select --",
}) => {
    return (
        <div className="labelcontainer-custom">
            <label htmlFor={htmlFor} className={labelClasses}>
                {isLabel && (
                    <p className={`${pClasses} p-customlabbelled`}>{label}</p>
                )}

                <select
                    id={htmlFor}
                    name={name}
                    className={`${selectClasses} customselect`}
                    style={{ height: `${height}px`, width: `${width}%` }}
                    value={value}
                    onChange={(e) => selectFunction(e.target.value)}
                    required={required}
                    disabled={disabled}
                >
                    {showPlaceholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options?.length > 0 ? (
                        options?.map((option, index) => (
                            <option
                                key={index}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))
                    ) : (
                        <option disabled>No options available</option>
                    )}
                </select>
            </label>
        </div>
    );
};

export default SelectCustomLabelled;
