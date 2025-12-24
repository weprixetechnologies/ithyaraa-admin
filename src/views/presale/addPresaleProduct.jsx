import CategoryProduct from '@/components/products/categoryProduct'
import OfferProducts from '@/components/products/offersProducts'
import Pricing from '@/components/products/pricing'
import VariationsComponent from '@/components/products/variations'
import Container from '@/components/ui/container'
import InputUi from '@/components/ui/inputui'
import UploadImages from '@/components/ui/uploadImages'
import axiosInstance from '../../lib/axiosInstance'
import React, { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import Layout from 'src/layout'

const AddPresaleProduct = () => {
    const uploadRef = useRef();
    const galleryRef = useRef();

    const [product, setProduct] = useState({
        type: 'variable',
        brand: 'inhouse',
        status: 'active',
        minOrderQuantity: 1
    })

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
                            <div className="grid grid-cols-2 gap-2">
                                <InputUi label={'Tab 1'} isInput={false} datafunction={(e) => updateFunction(e, 'tab1')} fieldClass='h-[100px]' />
                                <InputUi label={'Tab 2'} isInput={false} datafunction={(e) => updateFunction(e, 'tab2')} fieldClass='h-[100px]' />
                            </div>
                        </Container>
                        <Container gap={3} label={'Pricing & Discount'}>
                            <Pricing setProducts={setProduct} products={product} />
                        </Container>
                        <Container gap={3} label={'Variation & Stocking'}>
                            <VariationsComponent setProducts={setProduct} products={product} />
                        </Container>
                        <Container gap={3} label={'Pre-Sale Settings'}>
                            <div className="grid grid-cols-2 gap-3">
                                <InputUi
                                    label={'Expected Delivery Date'}
                                    type="date"
                                    datafunction={(e) => updateFunction(e, 'expectedDeliveryDate')}
                                />
                                <InputUi
                                    label={'Pre-Sale Start Date'}
                                    type="datetime-local"
                                    datafunction={(e) => updateFunction(e, 'preSaleStartDate')}
                                />
                                <InputUi
                                    label={'Pre-Sale End Date'}
                                    type="datetime-local"
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

