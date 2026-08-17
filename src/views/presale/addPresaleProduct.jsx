import CategoryProduct from '@/components/products/categoryProduct'
import OfferProducts from '@/components/products/offersProducts'
import Pricing from '@/components/products/pricing'
import VariationsComponent from '@/components/products/variations'
import Container from '@/components/ui/container'
import InputUi from '@/components/ui/inputui'
import UploadImages from '@/components/ui/uploadImages'
import axiosInstance from '../../lib/axiosInstance'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import Layout from 'src/layout'
import { listSizeCharts } from '../../lib/api/sizeChartApi'

const AddPresaleProduct = () => {
    const uploadRef = useRef();
    const galleryRef = useRef();

    const [product, setProduct] = useState({
        type: 'variable',
        brand: 'inhouse',
        status: 'active',
        minOrderQuantity: 1
    })
    const [sizeCharts, setSizeCharts] = useState([])

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

    const updateFunction = (data, name) => {
        setProduct(prev => ({
            ...prev,
            [name]: data.target.value
        }));
    };

    const formatDateTimeForInput = (dateValue) => {
        if (!dateValue) return '';

        let val = dateValue;
        if (typeof val === 'string') {
            if (val.includes(' ') && !val.includes('T') && !val.includes('Z')) {
                val = val.replace(' ', 'T') + 'Z';
            }
            else if (val.includes('T') && !val.includes('Z') && !val.includes('+') && !val.includes('-')) {
                val = val + 'Z';
            }
        }

        const date = new Date(val);
        if (isNaN(date.getTime())) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const formatDateForInput = (dateValue) => {
        if (!dateValue) return '';

        let val = dateValue;
        if (typeof val === 'string') {
            if (val.includes(' ') && !val.includes('T') && !val.includes('Z')) {
                val = val.replace(' ', 'T') + 'Z';
            }
            else if (val.includes('T') && !val.includes('Z') && !val.includes('+') && !val.includes('-')) {
                val = val + 'Z';
            }
        }

        const date = new Date(val);
        if (isNaN(date.getTime())) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleUpload = async () => {
        try {
            const finalImages = await uploadRef.current?.uploadImageFunction();
            const galleryupload = await galleryRef.current?.uploadImageFunction();

            const convertToMySQL = (dateStr) => {
                if (!dateStr) return null;
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return null;

                const pad = (n) => n.toString().padStart(2, '0');
                // Format to LOCAL YYYY-MM-DD HH:mm:ss
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            };

            const fullProductData = {
                ...product,
                featuredImage: finalImages,
                galleryImage: galleryupload,
                preSaleStartDate: convertToMySQL(product.preSaleStartDate),
                preSaleEndDate: convertToMySQL(product.preSaleEndDate),
                earlyBirdEndDate: convertToMySQL(product.earlyBirdEndDate),
                expectedDeliveryDate: convertToMySQL(product.expectedDeliveryDate)
            };

            console.log('🚀 Full presale product with images:', fullProductData);

            const { data: result } = await axiosInstance.post(
                '/admin/presale-products/add',
                fullProductData
            );

            if (result.success) {
                toast.success('Pre-Sale Product Added Successfully!');
                // Reset form
                setProduct({ type: 'variable', brand: 'inhouse', status: 'active', minOrderQuantity: 1 });
            }
        } catch (error) {
            console.error('Error uploading presale product:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to add pre-sale product');
        }
    };

    return (
        <Layout active={'admin-presale-add'} title={'Add Pre-Sale Product'}>
            <div className="grid grid-cols-6 gap-2">
                <div className="col-span-4 gap-2">
                    <div className="flex flex-col gap-2">
                        <Container gap={3} label={'Basic Information'}>
                            <InputUi label={'Product Title'} datafunction={(e) => updateFunction(e, 'name')} />
                            <InputUi label={'Product Description'} isInput={false} datafunction={(e) => updateFunction(e, 'description')} />
                            <div className="grid grid-cols-3 gap-2">
                                <InputUi label={'Tab 1'} isInput={false} datafunction={(e) => updateFunction(e, 'tab1')} fieldClass='h-[100px]' />
                                <InputUi label={'Tab 2'} isInput={false} datafunction={(e) => updateFunction(e, 'tab2')} fieldClass='h-[100px]' />
                                <InputUi label={'Tab 3 - Product Specifications'} isInput={false} datafunction={(e) => updateFunction(e, 'tab3')} fieldClass='h-[100px]' />
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
                        <Container gap={3} label={'Pre-Sale Settings'}>
                            <div className="grid grid-cols-2 gap-3">
                                <InputUi
                                    label={'Expected Delivery Date'}
                                    type="date"
                                    value={formatDateForInput(product.expectedDeliveryDate)}
                                    datafunction={(e) => updateFunction(e, 'expectedDeliveryDate')}
                                />
                                <InputUi
                                    label={'Pre-Sale Start Date'}
                                    type="datetime-local"
                                    value={formatDateTimeForInput(product.preSaleStartDate)}
                                    datafunction={(e) => updateFunction(e, 'preSaleStartDate')}
                                />
                                <InputUi
                                    label={'Pre-Sale End Date'}
                                    type="datetime-local"
                                    value={formatDateTimeForInput(product.preSaleEndDate)}
                                    datafunction={(e) => updateFunction(e, 'preSaleEndDate')}
                                />
                                <InputUi
                                    label={'Min Order Quantity'}
                                    type="number"
                                    value={product.minOrderQuantity || 1}
                                    datafunction={(e) => updateFunction(e, 'minOrderQuantity')}
                                />
                                <InputUi
                                    label={'Max Order Quantity'}
                                    type="number"
                                    datafunction={(e) => updateFunction(e, 'maxOrderQuantity')}
                                />
                                <InputUi
                                    label={'Total Available Quantity'}
                                    type="number"
                                    datafunction={(e) => updateFunction(e, 'totalAvailableQuantity')}
                                />
                                <InputUi
                                    label={'Early Bird Discount'}
                                    type="number"
                                    datafunction={(e) => updateFunction(e, 'earlyBirdDiscount')}
                                />
                                <InputUi
                                    label={'Early Bird End Date'}
                                    type="datetime-local"
                                    value={formatDateTimeForInput(product.earlyBirdEndDate)}
                                    datafunction={(e) => updateFunction(e, 'earlyBirdEndDate')}
                                />
                            </div>
                        </Container>
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
                        <Container gap={3} label={'Featured Images'}>
                            <UploadImages ref={uploadRef} maxImages={2} setProducts={setProduct} products={product} />
                        </Container>
                        <Container gap={3} label={'Gallery Images'}>
                            <UploadImages ref={galleryRef} maxImages={8} setProducts={setProduct} products={product} />
                        </Container>
                        <button className='primary-button' onClick={handleUpload}>Upload Pre-Sale Product</button>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default AddPresaleProduct
