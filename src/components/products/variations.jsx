import React, { useEffect, useState } from 'react'
import InputUi from '../ui/inputui'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import GenerateVariations from './generateVariations'

const VariationsComponent = ({ setProducts, products }) => {
    const predefinedAttributes = [
        { name: 'Size', values: ['S', 'M', 'L'] },
        { name: 'Color', values: ['Red', 'Green', 'Blue'] },
        { name: 'Material', values: ['Cotton', 'Wool', 'Silk'] }
    ]

    const [attributes, setAttributes] = useState([])
    const [newAttribute, setNewAttribute] = useState('')
    const [selectedAttribute, setSelectedAttribute] = useState('')
    const [valueInputs, setValueInputs] = useState({}) // { size: '', color: '' }


    useEffect(() => {
        setProducts(prev => ({
            ...prev,
            attributes: attributes,
        }));
    }, [attributes]);

    const handleAddAttribute = (name, values = []) => {
        if (!name.trim()) return
        if (attributes.find(attr => attr.name === name)) return

        setAttributes(prev => [...prev, { name, values }])
        setSelectedAttribute('')
        setNewAttribute('')
    }

    const handleLoadExisting = () => {
        const existing = predefinedAttributes.find(attr => attr.name === selectedAttribute)
        if (existing) {
            handleAddAttribute(existing.name, existing.values)
        }
    }

    const handleAddValue = (attributeName) => {
        const value = valueInputs[attributeName]?.trim()
        if (!value) return

        setAttributes(prev =>
            prev.map(attr =>
                attr.name === attributeName && !attr.values.includes(value)
                    ? { ...attr, values: [...attr.values, value] }
                    : attr
            )
        )

        setValueInputs(prev => ({ ...prev, [attributeName]: '' }))
    }

    const handleRemoveValue = (attributeName, value) => {
        setAttributes(prev =>
            prev.map(attr =>
                attr.name === attributeName
                    ? { ...attr, values: attr.values.filter(v => v !== value) }
                    : attr
            )
        )
    }

    const handleRemoveAttribute = (name) => {
        setAttributes(prev => prev.filter(attr => attr.name !== name))
        setValueInputs(prev => {
            const updated = { ...prev }
            delete updated[name]
            return updated
        })
    }

    return (
        <div className="flex flex-col gap-6">

            {/* Add New or Existing Attribute */}
            <div className="grid grid-cols-4 gap-2 items-center">
                <Select onValueChange={(val) => setSelectedAttribute(val)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Attribute" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectGroup>
                            <SelectLabel>Existing Attributes</SelectLabel>
                            {predefinedAttributes.map((attr, index) => (
                                <SelectItem key={index} value={attr.name}>
                                    {attr.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <InputUi
                    placeholder="Enter New Attribute Name"
                    value={newAttribute}
                    datafunction={(e) => setNewAttribute(e.target.value)}
                />

                <div className="col-span-2 flex gap-2">
                    <button
                        className="h-[30px] text-xs bg-primary px-5 text-white border-primary border rounded-lg"
                        onClick={() => handleAddAttribute(newAttribute)}
                    >
                        Create New
                    </button>

                    <button
                        className="h-[30px] text-xs text-primary px-5 bg-white border border-primary rounded-lg"
                        onClick={handleLoadExisting}
                    >
                        Load Existing
                    </button>
                </div>
            </div>

            {/* Render Each Attribute Section */}
            {attributes.map((attr, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 items-start">
                    {/* Attribute Name with Remove Button */}
                    <div className="col-span-2">
                        <div className="flex items-center justify-between pr-2">

                            <button onClick={() => handleRemoveAttribute(attr.name)} className="text-dark-text font-semibold text-base py-2 px-3 hover:bg-red-500 hover:text-white rounded-lg" style={{ fontFamily: 'var(--f2)' }}>{attr.name}</button>
                        </div>
                    </div>

                    {/* Values & Input */}
                    <div className="col-span-4">
                        {/* Display Added Values */}
                        <div className="bg-secondary-text w-full min-h-10 rounded-lg p-2 flex flex-wrap gap-2">
                            {attr.values.length > 0 ? (
                                attr.values.map((val, i) => (
                                    <div
                                        key={i}
                                        className="text-base px-3 py-1 bg-white rounded-lg flex items-center gap-2"
                                    >
                                        {val}
                                        <button
                                            className="text-red-500 text-xs"
                                            onClick={() => handleRemoveValue(attr.name, val)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <span className="text-xs text-gray-500">No values added</span>
                            )}
                        </div>

                        {/* Input for new value */}
                        <div className="grid grid-cols-6 items-center gap-2 mt-2">
                            <div className="col-span-4">
                                <InputUi
                                    placeholder="Enter New Values"
                                    value={valueInputs[attr.name] || ''}
                                    datafunction={(e) =>
                                        setValueInputs(prev => ({
                                            ...prev,
                                            [attr.name]: e.target.value
                                        }))
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddValue(attr.name)
                                    }}
                                />
                            </div>

                            <div className="col-span-2">
                                <button
                                    className="h-[30px] text-xs text-primary px-3 bg-white border border-primary rounded-lg w-full"
                                    onClick={() => handleAddValue(attr.name)}
                                >
                                    Add Value
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <section className='flex flex-col gap-2 mt-5'>
                <GenerateVariations attributes={attributes} setProducts={setProducts} products={products} />
            </section>

        </div>
    )
}

export default VariationsComponent
