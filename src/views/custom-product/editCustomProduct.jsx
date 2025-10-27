import CategoryProduct from '@/components/products/categoryProduct';
import OfferProducts from '@/components/products/offersProducts';
import Pricing from '@/components/products/pricing';
import Container from '@/components/ui/container';
import InputUi from '@/components/ui/inputui';
import UploadImages from '@/components/ui/uploadImages';
import { getProductDetails } from '../../lib/api/productsApi';
import axiosInstance from '../../lib/axiosInstance';
import React, { useRef, useState, useEffect } from 'react'
import { toast } from 'react-toastify';
import Layout from 'src/layout'
import { useParams } from 'react-router-dom'

const EditCustomProduct = () => {
    const { productID } = useParams()
    const [product, setProduct] = useState({ type: 'customproduct', brand: 'inhouse' })
    const [customInputs, setCustomInputs] = useState([])
    const [loading, setLoading] = useState(true)
    const uploadRef = useRef();
    const galleryRef = useRef();

    // Load existing product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await getProductDetails(productID);
                console.log('Fetched product data:', data);

                // Safely parse JSON fields
                const parsedProduct = {
                    ...data,
                    featuredImage: parseJSONSafe(data.featuredImage),
                    galleryImage: parseJSONSafe(data.galleryImage),
                    categories: parseJSONSafe(data.categories),
                    custom_inputs: parseJSONSafe(data.custom_inputs)
                };

                setProduct(parsedProduct);

                // Set custom inputs if they exist
                if (parsedProduct.custom_inputs && Array.isArray(parsedProduct.custom_inputs)) {
                    setCustomInputs(parsedProduct.custom_inputs);
                }

                console.log('Parsed product:', parsedProduct);
            } catch (error) {
                console.error('Error fetching product details:', error);
                toast.error('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        if (productID) {
            fetchProduct();
        }
    }, [productID]);

    // Helper function to safely parse JSON
    const parseJSONSafe = (value) => {
        if (!value) return value;
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    };

    const updateFunction = (data, name) => {
        setProduct(prev => ({
            ...prev,
            [name]: data.target.value
        }));
        console.log(product);
    };

    // Add new custom input field
    const addCustomInput = () => {
        const newInput = {
            id: Date.now(),
            label: '',
            type: 'text',
            required: true,
            placeholder: '',
            options: [] // For select/dropdown type
        };
        setCustomInputs(prev => [...prev, newInput]);
    };

    // Remove custom input field
    const removeCustomInput = (id) => {
        setCustomInputs(prev => prev.filter(input => input.id !== id));
    };

    // Update custom input field
    const updateCustomInput = (id, field, value) => {
        setCustomInputs(prev => prev.map(input =>
            input.id === id ? { ...input, [field]: value } : input
        ));
    };

    // Add option for select/dropdown
    const addOption = (inputId) => {
        setCustomInputs(prev => prev.map(input =>
            input.id === inputId
                ? { ...input, options: [...input.options, ''] }
                : input
        ));
    };

    // Remove option for select/dropdown
    const removeOption = (inputId, optionIndex) => {
        setCustomInputs(prev => prev.map(input =>
            input.id === inputId
                ? { ...input, options: input.options.filter((_, index) => index !== optionIndex) }
                : input
        ));
    };

    // Update option for select/dropdown
    const updateOption = (inputId, optionIndex, value) => {
        setCustomInputs(prev => prev.map(input =>
            input.id === inputId
                ? {
                    ...input,
                    options: input.options.map((option, index) =>
                        index === optionIndex ? value : option
                    )
                }
                : input
        ));
    };

    const handleUpload = async () => {
        try {
            // Validate custom inputs
            if (customInputs.length === 0) {
                toast.error('Please add at least one custom input field');
                return;
            }

            // Validate each custom input
            for (let i = 0; i < customInputs.length; i++) {
                const input = customInputs[i];

                // Check if input has required properties
                if (!input.label || !input.label.trim()) {
                    toast.error(`Custom input ${i + 1}: Label is required`);
                    return;
                }
                if (!input.type) {
                    toast.error(`Custom input ${i + 1}: Type is required`);
                    return;
                }
                if (input.required === undefined) {
                    toast.error(`Custom input ${i + 1}: Required field must be specified`);
                    return;
                }
                if (input.type === 'select' && (!input.options || input.options.length === 0)) {
                    toast.error(`Custom input ${i + 1}: At least one option is required for select type`);
                    return;
                }
            }

            const finalImages = await uploadRef.current?.uploadImageFunction();
            const galleryupload = await galleryRef.current?.uploadImageFunction();

            const fullProductData = {
                ...product,
                featuredImage: finalImages,
                galleryImage: galleryupload,
                custom_inputs: customInputs
            };

            console.log('🚀 Full custom product with images:', fullProductData);
            console.log('🔍 Custom inputs being sent:', customInputs);

            const { data: result } = await axiosInstance.post(
                '/products/edit-product',
                fullProductData
            );

            console.log('Custom product updated successfully:', result);
            toast.success('Custom Product Updated Successfully');

        } catch (error) {
            console.error('Error updating custom product:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to update custom product');
        }
    };

    if (loading) {
        return (
            <Layout active={'admin-custom-product-edit'} title={'Edit Custom Product'}>
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading product details...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout active={'admin-custom-product-edit'} title={'Edit Custom Product'}>
            <div className="grid grid-cols-6  w-full gap-2">
                <div className="col-span-4 w-full">
                    <div className="flex flex-col gap-2">
                        <Container gap={3} label={'Basic Information'}>
                            <InputUi
                                label={'Product Title'}
                                value={product.name || ''}
                                datafunction={(e) => updateFunction(e, 'name')}
                            />
                            <InputUi
                                label={'Product Description'}
                                fieldClass='h-[100px]'
                                isInput={false}
                                value={product.description || ''}
                                datafunction={(e) => updateFunction(e, 'description')}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <InputUi
                                    label={'Tab 1'}
                                    isInput={false}
                                    value={product.tab1 || ''}
                                    datafunction={(e) => updateFunction(e, 'tab1')}
                                    fieldClass='h-[100px]'
                                />
                                <InputUi
                                    label={'Tab 2'}
                                    isInput={false}
                                    value={product.tab2 || ''}
                                    datafunction={(e) => updateFunction(e, 'tab2')}
                                    fieldClass='h-[100px]'
                                />
                            </div>
                        </Container>

                        <Container gap={3} label={'Custom Input Fields'}>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium">Customer Input Fields</h3>
                                    <button
                                        type="button"
                                        onClick={addCustomInput}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                    >
                                        + Add Input Field
                                    </button>
                                </div>

                                {customInputs.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No custom input fields added yet.</p>
                                        <p className="text-sm">Click "Add Input Field" to start creating custom fields for customers.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {customInputs.map((input, index) => (
                                            <div key={input.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-medium text-gray-700">Field {index + 1}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCustomInput(input.id)}
                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Field Label *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={input.label}
                                                            onChange={(e) => updateCustomInput(input.id, 'label', e.target.value)}
                                                            placeholder="e.g., Enter Size, Enter Pattern"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Field Type *
                                                        </label>
                                                        <select
                                                            value={input.type}
                                                            onChange={(e) => updateCustomInput(input.id, 'type', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="text">Text Input</option>
                                                            <option value="textarea">Text Area</option>
                                                            <option value="select">Dropdown/Select</option>
                                                            <option value="number">Number Input</option>
                                                            <option value="email">Email Input</option>
                                                            <option value="tel">Phone Number</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Placeholder Text
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={input.placeholder}
                                                            onChange={(e) => updateCustomInput(input.id, 'placeholder', e.target.value)}
                                                            placeholder="e.g., Please enter your preferred size"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>

                                                    <div className="flex items-center space-x-4">
                                                        <label className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={input.required}
                                                                onChange={(e) => updateCustomInput(input.id, 'required', e.target.checked)}
                                                                className="mr-2"
                                                            />
                                                            <span className="text-sm font-medium text-gray-700">Required Field</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Options for select/dropdown type */}
                                                {input.type === 'select' && (
                                                    <div className="mt-4">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <label className="block text-sm font-medium text-gray-700">
                                                                Options *
                                                            </label>
                                                            <button
                                                                type="button"
                                                                onClick={() => addOption(input.id)}
                                                                className="text-blue-500 hover:text-blue-700 text-sm"
                                                            >
                                                                + Add Option
                                                            </button>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {input.options.map((option, optionIndex) => (
                                                                <div key={optionIndex} className="flex items-center space-x-2">
                                                                    <input
                                                                        type="text"
                                                                        value={option}
                                                                        onChange={(e) => updateOption(input.id, optionIndex, e.target.value)}
                                                                        placeholder={`Option ${optionIndex + 1}`}
                                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeOption(input.id, optionIndex)}
                                                                        className="text-red-500 hover:text-red-700"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            {input.options.length === 0 && (
                                                                <p className="text-sm text-gray-500">No options added yet. Click "Add Option" to start.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Container>

                        <Container gap={3} label={'Pricing & Discount'}>
                            <Pricing setProducts={setProduct} products={product} />
                        </Container>
                    </div>
                </div>
                <div className="col-span-2">
                    <div className="flex flex-col gap-2">
                        <Container label={'Categories'}>
                            <CategoryProduct
                                setProducts={setProduct}
                                products={product}
                                isEditable={true}
                                oldValue={product.categories}
                            />
                        </Container>

                        <Container gap={3} label={'Offers & Promotions'}>
                            <OfferProducts setProducts={setProduct} products={product} />
                        </Container>

                        <Container gap={3} label={'Featured Images'}>
                            <UploadImages
                                ref={uploadRef}
                                maxImages={2}
                                setProducts={setProduct}
                                products={product}
                                defaultImages={product.featuredImage}
                            />
                        </Container>

                        <Container gap={3} label={'Gallery Images'}>
                            <UploadImages
                                ref={galleryRef}
                                maxImages={8}
                                setProducts={setProduct}
                                products={product}
                                defaultImages={product.galleryImage}
                            />
                        </Container>

                        <button
                            className='primary-button w-full py-3 text-lg font-medium'
                            onClick={handleUpload}
                        >
                            Update Custom Product
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default EditCustomProduct
