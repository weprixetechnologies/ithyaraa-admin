import React, { useState, useRef, useEffect } from 'react';
import './ui-component.css';

const SelectCustomLabelledSearchable = ({
    label = '',
    options = [],
    value,
    selectFunction,
    placeholder = '-- Select --',
    width = 100,
    height = 40,
    isLabel = true,
    disabled = false,
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        selectFunction(option.value);
        setShowDropdown(false);
        setSearchTerm('');
    };

    const selectedLabel = options.find(opt => opt.value === value)?.label || '';

    return (
        <div className="labelcontainer-custom" style={{ width: `${width}%`, position: 'relative' }} ref={dropdownRef}>
            {isLabel && <p className="p-customlabbelled">{label}</p>}

            <div
                className="customselect"
                style={{
                    height: `${height}px`,
                    padding: '5px 10px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    background: disabled ? '#f0f0f0' : '#fff'
                }}
                onClick={() => !disabled && setShowDropdown(prev => !prev)}
            >
                {selectedLabel || placeholder}
            </div>

            {showDropdown && !disabled && (
                <div
                    className="dropdown-menu"
                    style={{
                        position: 'absolute',
                        top: `${height + 5}px`,
                        left: 0,
                        width: '100%',
                        border: '1px solid #ccc',
                        background: '#fff',
                        zIndex: 10,
                        borderRadius: '5px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        maxHeight: '200px',
                        overflowY: 'auto',
                    }}
                >
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        style={{
                            width: '95%',
                            margin: '5px',
                            padding: '5px',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    />

                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleSelect(option)}
                                style={{
                                    padding: '8px 10px',
                                    cursor: 'pointer',
                                    backgroundColor: option.value === value ? '#f0f0f0' : '#fff'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = option.value === value ? '#f0f0f0' : '#fff'}
                            >
                                {option.label}
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '10px', color: '#999' }}>No options found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SelectCustomLabelledSearchable;
