import OfferProducts from '@/components/products/offersProducts'
import Pricing from '@/components/products/pricing'
import VariationsComponent from '@/components/products/variations'
import CrossSellModal from '@/components/products/crossSellModal'
import Container from '@/components/ui/container'
import InputUi from '@/components/ui/inputui'
import RichTextUi from '@/components/ui/RichTextUi'
import UploadImages from '@/components/ui/uploadImages'
import { getProductDetails } from '../../lib/api/productsApi'
import React, { useEffect, useRef, useState } from 'react'
import Layout from 'src/layout'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import CategoryProduct from '@/components/products/categoryProduct'
import axiosInstance from '../../lib/axiosInstance'
import { listSizeCharts } from '../../lib/api/sizeChartApi'

const EditProduct = () => {
    const { productID } = useParams()
    const uploadRef = useRef();
    const galleryRef = useRef();

    const [product, setProduct] = useState({ type: 'variable' })
    const [showCrossSellModal, setShowCrossSellModal] = useState(false)
    const [crossSells, setCrossSells] = useState([])
    const [sizeCharts, setSizeCharts] = useState([])

    useEffect(() => {
        if (!productID) return;

        const fetchProduct = async () => {
            try {
                const data = await getProductDetails(productID);
                console.log('Fetching');

                // Safely parse JSON fields
                const parsedProduct = {
                    ...data,
                    featuredImage: parseJSONSafe(data.featuredImage),
                    galleryImage: parseJSONSafe(data.galleryImage),
                    productAttributes: parseJSONSafe(data.productAttributes),
                    variations: Array.isArray(data.variations) ? data.variations?.map(variation => ({
                        ...variation,
                        variationValues: parseJSONSafe(variation.variationValues),
                    })) : [],
                    categories: parseJSONSafe(data.categories),
                };

                setProduct(parsedProduct);

                // Extract cross-sell product IDs
                if (data.crossSellProducts && Array.isArray(data.crossSellProducts)) {
                    setCrossSells(data.crossSellProducts.map(p => p.productID || p.crossSellProductID));
                }

                console.log(parsedProduct);

            } catch (error) {
                console.error('Error fetching product details:', error);
            }
        };

        fetchProduct();
    }, [productID]);

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

    // helper function
    const parseJSONSafe = (value) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return value; // return as-is if not valid JSON
            }
        }
        return value;
    };



    const updateFunction = (data, name) => {
        setProduct(prev => ({
            ...prev,
            [name]: data.target.value
        }));
        console.log(product);

    };


    const handleUpload = async () => {
        try {
            const finalImages = await uploadRef.current?.uploadImageFunction();
            const galleryupload = await galleryRef.current?.uploadImageFunction();

            // Ensure variations include variationID and variationSlug if they exist
            const variationsToSend = product.productVariations?.map(variation => {
                // Preserve all existing fields, especially variationID and variationSlug
                return {
                    ...variation,
                    // Ensure variationID is preserved if it exists
                    variationID: variation.variationID || null,
                    // Ensure variationSlug is preserved if it exists
                    variationSlug: variation.variationSlug || null,
                };
            }) || [];

            const fullProductData = {
                ...product,
                featuredImage: finalImages,
                galleryImage: galleryupload,
                crossSells: crossSells,
                productVariations: variationsToSend
            };

            console.log('🚀 Full product with images:', fullProductData);
            console.log('📦 Variations being sent:', variationsToSend.map(v => ({
                variationID: v.variationID,
                variationSlug: v.variationSlug,
                variationName: v.variationName
            })));

            // Use axiosInstance for POST request
            const response = await axiosInstance.post('/products/edit-product', fullProductData);

            console.log('Product edited successfully:', response.data);
            if (response.data?.success) {
                toast.success(response.data.message || 'Product updated successfully!');
            } else {
                toast.error(response.data?.message || 'Failed to update product');
            }

        } catch (error) {
            console.error('Error uploading or posting product:', error.message);
            toast.error(error.response?.data?.message || `Error: ${error.message}`);
        }
    };




    return (
        <Layout active={'admin-products-add'} title={'Add Product'}>
            <div className="grid grid-cols-6 gap-2">
                <div className="col-span-4 gap-2">
                    <div className="flex flex-col gap-2">
                        <Container gap={3} label={'Basic Information'}>

                            <InputUi label={'Product Title'} value={product.name ?? ''} datafunction={(e) => updateFunction(e, 'name')} />
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
                            <VariationsComponent defaultValue={product.productAttributes} defaultVariation={product.variations} setProducts={setProduct} products={product} />
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
                        {/* <Container containerclass={'bg-dark-text'}>
                            <div className="overflow-x-auto">
                                <pre className="col-span-2 mt-4 p-2 text-white rounded text-xs whitespace-pre max-w-full">
                                    {JSON.stringify(product, null, 3)}
                                </pre>
                            </div>
                        </Container> */}

                        <Container label={'Categories'}>
                            <CategoryProduct setProducts={setProduct} products={product} isEditable={true} oldValue={product.categories} />
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
                            <UploadImages ref={uploadRef} maxImages={2} defaultImages={product.featuredImage} />
                        </Container>
                        <Container gap={3} label={'Gallery Images'}>
                            <UploadImages ref={galleryRef} maxImages={8} defaultImages={product.galleryImage} />
                        </Container>
                        <button className='primary-button' onClick={handleUpload}>Update Product</button>

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

export default EditProduct
