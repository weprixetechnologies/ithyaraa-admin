import CategoryProduct from '@/components/products/categoryProduct'
import OfferProducts from '@/components/products/offersProducts'
import Pricing from '@/components/products/pricing'
import VariationsComponent from '@/components/products/variations'
import CrossSellModal from '@/components/products/crossSellModal'
import Container from '@/components/ui/container'
import InputUi from '@/components/ui/inputui'
import RichTextUi from '@/components/ui/RichTextUi'
import UploadImages from '@/components/ui/uploadImages'
import axiosInstance from '../../lib/axiosInstance'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import Layout from 'src/layout'
import { listSizeCharts } from '../../lib/api/sizeChartApi'
import { useNavigate } from 'react-router-dom'

const AddProduct = () => {
    const uploadRef = useRef();
    const galleryRef = useRef();

    const [product, setProduct] = useState({ type: 'variable', brand: 'INHOUSE', brandID: 'INHOUSE' })
    const [showCrossSellModal, setShowCrossSellModal] = useState(false)
    const [crossSells, setCrossSells] = useState([])
    const [sizeCharts, setSizeCharts] = useState([])

    const updateFunction = (data, name) => {
        setProduct(prev => ({
            ...prev,
            [name]: data.target.value
        }));
        console.log(product);

    };


    useEffect(() => {
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

    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    const handleUpload = async () => {
        if (isUploading) return;
        try {
            // For variable products, ensure all variations have stock, price, and sale price filled
            if (product.type === 'variable') {
                const variations = Array.isArray(product.productVariations) ? product.productVariations : [];
                if (variations.length === 0) {
                    toast.error('Please generate at least one variation before uploading this product.');
                    return;
                }

                const isEmpty = (val) =>
                    val === null ||
                    val === undefined ||
                    (typeof val === 'string' && val.trim() === '');

                const invalid = variations.find(v =>
                    !v ||
                    isEmpty(v.variationStock) ||
                    isEmpty(v.variationPrice) ||
                    isEmpty(v.variationSalePrice)
                );

                if (invalid) {
                    toast.error('Please fill Stock, Regular Price, and Sale Price for all variations before uploading.');
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
                crossSells: crossSells
            };

            const response = await axiosInstance.post(
                '/products/add-product',
                fullProductData
            );

            const result = response.data;
            toast.success(result?.message || 'Product added successfully');

            if (result.productID) {
                navigate(`/products/details/${result.productID}`);
            } else {
                navigate('/products/list');
            }

        } catch (error) {
            console.error('Error uploading or posting product:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to add product');
        } finally {
            setIsUploading(false);
        }
    };



    return (
        <Layout active={'admin-products-add'} title={'Add Product'}>
            <div className="grid grid-cols-6 gap-2">
                <div className="col-span-4 gap-2">
                    <div className="flex flex-col gap-2">
                        <Container gap={3} label={'Basic Information'}>

                            <InputUi label={'Product Title'} datafunction={(e) => updateFunction(e, 'name')} />
                            <RichTextUi label={'Product Description'} value={product.description ?? ''} onChange={(val) => updateFunction({ target: { value: val } }, 'description')} />
                            <div className="grid grid-cols-3 gap-2">
                                <RichTextUi label={'Tab 1 - Material Care'} value={product.tab1 ?? ''} onChange={(val) => updateFunction({ target: { value: val } }, 'tab1')} />
                                <RichTextUi label={'Tab 2 - Styling and Suggestion'} value={product.tab2 ?? ''} onChange={(val) => updateFunction({ target: { value: val } }, 'tab2')} />
                                <RichTextUi label={'Tab 3 - Product Specifications'} value={product.tab3 ?? ''} onChange={(val) => updateFunction({ target: { value: val } }, 'tab3')} />
                            </div>
                        </Container>
                        <Container gap={3} label={'Pricing & Discount'}>
                            <Pricing setProducts={setProduct} products={product} />
                        </Container>
                        <Container gap={3} label={'Variation & Stocking'}>
                            <VariationsComponent setProducts={setProduct} products={product} />
                        </Container>
                        {product.type === 'variable' && (
                            <Container gap={3} label={'Size Chart (Variable Products Only)'}>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-medium text-secondary-text">
                                        Select Size Chart
                                    </label>
                                    <select
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        value={product.sizeChartUrl || ''}
                                        onChange={(e) =>
                                            setProduct(prev => ({ ...prev, sizeChartUrl: e.target.value || null }))
                                        }
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
                        )}
                    </div>

                </div>
                <div className="col-span-2">
                    <div className="flex flex-col gap-2">
                        <Container containerclass={'bg-dark-text'}>
                            <div className="overflow-x-auto">
                                <pre className="col-span-2 mt-4 p-2 text-white rounded text-xs whitespace-pre max-w-full">
                                    {JSON.stringify(product, null, 2)}
                                </pre>
                            </div>
                        </Container>
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
                            className='primary-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                            onClick={handleUpload}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                "Upload Product"
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
        </Layout >
    )
}

export default AddProduct