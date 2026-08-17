import CategoryProduct from '@/components/products/categoryProduct';
import OfferProducts from '@/components/products/offersProducts';
import Pricing from '@/components/products/pricing';
import CrossSellModal from '@/components/products/crossSellModal';
import Container from '@/components/ui/container';
import InputUi from '@/components/ui/inputui';
import UploadImages from '@/components/ui/uploadImages';
import axiosInstance from '../../lib/axiosInstance';
import React, { useRef, useState } from 'react'
import { toast } from 'react-toastify';
import Layout from 'src/layout'
import { listSizeCharts } from '../../lib/api/sizeChartApi';
import { useNavigate } from 'react-router-dom';

const AddCustomProduct = () => {
  const [product, setProduct] = useState({ type: 'customproduct', brand: 'INHOUSE', brandID: 'INHOUSE', allowCustomerImageUpload: false })
  const [customInputs, setCustomInputs] = useState([])
  const [dressTypes, setDressTypes] = useState([])
  const [showCrossSellModal, setShowCrossSellModal] = useState(false)
  const [crossSells, setCrossSells] = useState([])
  const [sizeCharts, setSizeCharts] = useState([])
  const uploadRef = useRef();
  const galleryRef = useRef();

  // Fetch size charts
  React.useEffect(() => {
    const fetchSizeCharts = async () => {
      try {
        const res = await listSizeCharts();
        if (res.success) {
          setSizeCharts(res.data || []);
        }
      } catch (err) {
        console.error('Error fetching size charts:', err);
      }
    };
    fetchSizeCharts();
  }, []);

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


  // --- Dress Types Handlers ---
  const addDressType = () => {
    setDressTypes(prev => [...prev, { label: '', price: '' }]);
  };

  const removeDressType = (index) => {
    setDressTypes(prev => prev.filter((_, i) => i !== index));
  };

  const updateDressType = (index, field, value) => {
    setDressTypes(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (isUploading) return;
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

      // Validate dress types
      for (let i = 0; i < dressTypes.length; i++) {
        if (!dressTypes[i].label || !dressTypes[i].label.trim()) {
          toast.error(`Dress Type ${i + 1}: Label is required`);
          return;
        }
        if (!dressTypes[i].price || isNaN(dressTypes[i].price)) {
          toast.error(`Dress Type ${i + 1}: Valid price is required`);
          return;
        }
      }

      setIsUploading(true);

      const finalImages = await uploadRef.current?.uploadImageFunction();
      const galleryupload = await galleryRef.current?.uploadImageFunction();

      const fullProductData = {
        ...product,
        featuredImage: finalImages,
        galleryImage: galleryupload,
        custom_inputs: customInputs,
        dressTypes: dressTypes,
        crossSells: crossSells
      };

      const response = await axiosInstance.post(
        '/products/add-custom-product',
        fullProductData
      );

      const result = response.data;
      toast.success(result?.message || 'Custom product added successfully');

      if (result.productID) {
        navigate(`/custom-product/edit/${result.productID}`);
      } else {
        navigate('/custom-product/list');
      }

    } catch (error) {
      console.error('Error uploading or posting custom product:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to add custom product');
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <Layout active={'admin-custom-product-add'} title={'Add Customisable Product'}>
      <div className="grid grid-cols-6  w-full gap-2">
        <div className="col-span-4 w-full">
          <div className="flex flex-col gap-2">
            <Container gap={3} label={'Basic Information'}>
              <InputUi label={'Product Title'} datafunction={(e) => updateFunction(e, 'name')} />
              <InputUi label={'Product Description'} fieldClass='h-[100px]' isInput={false} datafunction={(e) => updateFunction(e, 'description')} />
              <div className="grid grid-cols-3 gap-2">
                <InputUi label={'Tab 1'} isInput={false} datafunction={(e) => updateFunction(e, 'tab1')} fieldClass='h-[100px]' />
                <InputUi label={'Tab 2'} isInput={false} datafunction={(e) => updateFunction(e, 'tab2')} fieldClass='h-[100px]' />
                <InputUi label={'Tab 3 - Product Specifications'} isInput={false} datafunction={(e) => updateFunction(e, 'tab3')} fieldClass='h-[100px]' />
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

                {/* Allow Customer Image Upload Checkbox */}
                <div className="border border-gray-200 rounded-lg p-4 bg-background">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={product.allowCustomerImageUpload || false}
                      onChange={(e) => setProduct(prev => ({ ...prev, allowCustomerImageUpload: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-secondary-text">Allow Customer to Upload Photo</span>
                      <p className="text-xs text-gray-500 mt-1">Enable this to allow customers to upload images when ordering this custom product</p>
                    </div>
                  </label>
                </div>

                {customInputs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No custom input fields added yet.</p>
                    <p className="text-sm">Click "Add Input Field" to start creating custom fields for customers.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customInputs.map((input, index) => (
                      <div key={input.id} className="border border-gray-200 rounded-lg p-4 bg-background">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-secondary-text">Field {index + 1}</h4>
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
                            <label className="block text-sm font-medium text-secondary-text mb-1">
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
                            <label className="block text-sm font-medium text-secondary-text mb-1">
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
                            <label className="block text-sm font-medium text-secondary-text mb-1">
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
                              <span className="text-sm font-medium text-secondary-text">Required Field</span>
                            </label>
                          </div>
                        </div>

                        {/* Options for select/dropdown type */}
                        {input.type === 'select' && (
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium text-secondary-text">
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

            <Container gap={3} label={'Dress Types & Pricing (Optional Overrides)'}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Dress Types</h3>
                    <p className="text-xs text-gray-500 mt-1">Add dress types if you want the price to change based on customer selection (e.g. Saree vs Lehenga)</p>
                  </div>
                  <button
                    type="button"
                    onClick={addDressType}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    + Add Dress Type
                  </button>
                </div>

                {dressTypes.length === 0 ? (
                  <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-500">
                    <p className="text-sm">No dress types added. Base pricing will be used.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dressTypes.map((item, index) => (
                      <div key={index} className="flex gap-4 items-end bg-background p-3 border border-gray-100 rounded-lg">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-secondary-text mb-1">Label (e.g. Saree)</label>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => updateDressType(index, 'label', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="Type Name"
                          />
                        </div>
                        <div className="w-32">
                          <label className="block text-xs font-medium text-secondary-text mb-1">Price (₹)</label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateDressType(index, 'price', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="0"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDressType(index)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Container>

            <Container gap={3} label={'Pricing & Discount (Base Price)'}>
              <Pricing setProducts={setProduct} products={product} />
            </Container>

            <Container gap={3} label={'Size Chart (Optional)'}>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-secondary-text">Select Size Chart</label>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-background"
                  value={product.sizeChartUrl || ''}
                  onChange={(e) => setProduct(prev => ({ ...prev, sizeChartUrl: e.target.value || null }))}
                >
                  <option value="">None</option>
                  {sizeCharts.map(chart => (
                    <option key={chart.id} value={chart.imgUrl}>
                      {chart.chartName}
                    </option>
                  ))}
                </select>
                {product.sizeChartUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-secondary-text mb-1">Preview:</p>
                    <div className="w-40 h-40 border rounded overflow-hidden bg-background">
                      <img
                        src={product.sizeChartUrl}
                        alt="Size chart preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Container>
          </div>
        </div>
        <div className="col-span-2">
          <div className="flex flex-col gap-2">
            <Container label={'Categories'}>
              <CategoryProduct setProducts={setProduct} products={product} />
            </Container>

            <Container gap={3} label={'Offers & Promotions'}>
              <OfferProducts setProducts={setProduct} products={product} />
            </Container>
            <Container gap={3} label={'Cross-Sell Products'}>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowCrossSellModal(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Select Cross-Sell Products
                </button>
                {crossSells.length > 0 && (
                  <div className="text-sm text-secondary-text">
                    {crossSells.length} product{crossSells.length !== 1 ? 's' : ''} selected
                  </div>
                )}
              </div>
            </Container>
            <Container gap={3} label={'Featured Images'}>
              <UploadImages ref={uploadRef} maxImages={2} setProducts={setProduct} products={product} />
            </Container>

            <Container gap={3} label={'Gallery Images'}>
              <UploadImages ref={galleryRef} maxImages={8} setProducts={setProduct} products={product} />
            </Container>

            <button
              className='primary-button w-full py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                "Create Custom Product"
              )}
            </button>
          </div>
        </div>
      </div>
      <CrossSellModal
        isOpen={showCrossSellModal}
        onClose={() => setShowCrossSellModal(false)}
        onSave={(selected) => setCrossSells(selected)}
        initialSelected={crossSells}
      />
    </Layout>
  )
}

export default AddCustomProduct
