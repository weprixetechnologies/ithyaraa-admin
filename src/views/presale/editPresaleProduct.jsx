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
import { useParams } from 'react-router-dom'

const EditPresaleProduct = () => {
    const { presaleProductID } = useParams()
    const uploadRef = useRef();
    const galleryRef = useRef();

    const [product, setProduct] = useState({ type: 'variable' })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axiosInstance.get(`/admin/presale-products/${presaleProductID}`);

                if (data.success) {
                    const parsedProduct = {
                        ...data.data,
                        featuredImage: parseJSONSafe(data.data.featuredImage),
                        galleryImage: parseJSONSafe(data.data.galleryImage),
                        productAttributes: parseJSONSafe(data.data.productAttributes),
                        categories: parseJSONSafe(data.data.categories),
                    };
                    setProduct(parsedProduct);
                }
            } catch (error) {
                console.error('Error fetching presale product:', error);
                toast.error('Failed to load presale product');
            } finally {
                setLoading(false);
            }
        };

        if (presaleProductID) {
            fetchProduct();
        }
    }, [presaleProductID]);

    const parseJSONSafe = (value) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        return value;
    };

    const updateFunction = (data, name) => {
        setProduct(prev => ({
            ...prev,
            [name]: data.target.value
        }));
    };

    const handleUpload = async () => {
        try {
            const finalImages = await uploadRef.current?.uploadImageFunction();
            const galleryupload = await galleryRef.current?.uploadImageFunction();

            const fullProductData = {
                ...product,
                featuredImage: finalImages,
                galleryImage: galleryupload
            };

            const { data: result } = await axiosInstance.put(
                `/admin/presale-products/${presaleProductID}`,
                fullProductData
            );

            if (result.success) {
                toast.success('Pre-Sale Product Updated Successfully!');
            }
        } catch (error) {
            console.error('Error updating presale product:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to update pre-sale product');
        }
    };

    if (loading) {
        return (
            <Layout active={'admin-presale-edit'} title={'Edit Pre-Sale Product'}>
                <div className="flex items-center justify-center h-64">
                    <p>Loading...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout active={'admin-presale-edit'} title={'Edit Pre-Sale Product'}>
            <div className="grid grid-cols-6 gap-2">
                <div className="col-span-4 gap-2">
                    <div className="flex flex-col gap-2">
                        <Container gap={3} label={'Basic Information'}>
                            <InputUi label={'Product Title'} value={product.name || ''} datafunction={(e) => updateFunction(e, 'name')} />
                            <InputUi label={'Product Description'} value={product.description || ''} isInput={false} datafunction={(e) => updateFunction(e, 'description')} />
                            <div className="grid grid-cols-2 gap-2">
                                <InputUi label={'Tab 1'} value={product.tab1 || ''} isInput={false} datafunction={(e) => updateFunction(e, 'tab1')} fieldClass='h-[100px]' />
                                <InputUi label={'Tab 2'} value={product.tab2 || ''} isInput={false} datafunction={(e) => updateFunction(e, 'tab2')} fieldClass='h-[100px]' />
                            </div>
                        </Container>
                        <Container gap={3} label={'Pricing & Discount'}>
                            <Pricing setProducts={setProduct} products={product} />
                        </Container>
                        <Container gap={3} label={'Variation & Stocking'}>
                            <VariationsComponent
                                defaultValue={product.productAttributes}
                                defaultVariation={product.variations}
                                setProducts={setProduct}
                                products={product}
                            />
                        </Container>
                        <Container gap={3} label={'Pre-Sale Settings'}>
                            <div className="grid grid-cols-2 gap-3">
                                <InputUi
                                    label={'Expected Delivery Date'}
                                    type="date"
                                    value={product.expectedDeliveryDate ? product.expectedDeliveryDate.split('T')[0] : ''}
                                    datafunction={(e) => updateFunction(e, 'expectedDeliveryDate')}
                                />
                                <InputUi
                                    label={'Pre-Sale Start Date'}
                                    type="datetime-local"
                                    value={product.preSaleStartDate ? new Date(product.preSaleStartDate).toISOString().slice(0, 16) : ''}
                                    datafunction={(e) => updateFunction(e, 'preSaleStartDate')}
                                />
                                <InputUi
                                    label={'Pre-Sale End Date'}
                                    type="datetime-local"
                                    value={product.preSaleEndDate ? new Date(product.preSaleEndDate).toISOString().slice(0, 16) : ''}
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
                                    value={product.maxOrderQuantity || ''}
                                    datafunction={(e) => updateFunction(e, 'maxOrderQuantity')}
                                />
                                <InputUi
                                    label={'Total Available Quantity'}
                                    type="number"
                                    value={product.totalAvailableQuantity || ''}
                                    datafunction={(e) => updateFunction(e, 'totalAvailableQuantity')}
                                />
                                <InputUi
                                    label={'Early Bird Discount'}
                                    type="number"
                                    value={product.earlyBirdDiscount || ''}
                                    datafunction={(e) => updateFunction(e, 'earlyBirdDiscount')}
                                />
                                <InputUi
                                    label={'Early Bird End Date'}
                                    type="datetime-local"
                                    value={product.earlyBirdEndDate ? new Date(product.earlyBirdEndDate).toISOString().slice(0, 16) : ''}
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
                            <UploadImages ref={uploadRef} maxImages={2} defaultImages={product.featuredImage || []} />
                        </Container>
                        <Container gap={3} label={'Gallery Images'}>
                            <UploadImages ref={galleryRef} maxImages={8} defaultImages={product.galleryImage || []} />
                        </Container>
                        <button className='primary-button' onClick={handleUpload}>Update Pre-Sale Product</button>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default EditPresaleProduct

