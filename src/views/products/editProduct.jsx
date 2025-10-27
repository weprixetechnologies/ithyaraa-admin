import OfferProducts from '@/components/products/offersProducts'
import Pricing from '@/components/products/pricing'
import VariationsComponent from '@/components/products/variations'
import Container from '@/components/ui/container'
import InputUi from '@/components/ui/inputui'
import UploadImages from '@/components/ui/uploadImages'
import { getProductDetails } from '../../lib/api/productsApi'
import React, { useEffect, useRef, useState } from 'react'
import Layout from 'src/layout'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import CategoryProduct from '@/components/products/categoryProduct'
import axiosInstance from '../../lib/axiosInstance'

const EditProduct = () => {
    const { productID } = useParams()
    const uploadRef = useRef();
    const galleryRef = useRef();

    const [product, setProduct] = useState({ type: 'variable' })

    useEffect(() => {
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
                console.log(parsedProduct);

            } catch (error) {
                console.error('Error fetching product details:', error);
            }
        };

        fetchProduct();
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

            const fullProductData = {
                ...product,
                featuredImage: finalImages,
                galleryImage: galleryupload
            };

            console.log('🚀 Full product with images:', fullProductData);

            // Use axiosInstance for POST request
            const response = await axiosInstance.post('/products/edit-product', fullProductData);

            console.log('Product edited successfully:', response.data);
            toast.success('Product updated successfully!');

        } catch (error) {
            console.error('Error uploading or posting product:', error.message);
            toast.error(`Error: ${error.message}`);
        }
    };




    return (
        <Layout active={'admin-products-add'} title={'Add Product'}>
            <div className="grid grid-cols-6 gap-2">
                <div className="col-span-4 gap-2">
                    <div className="flex flex-col gap-2">
                        <Container gap={3} label={'Basic Information'}>

                            <InputUi label={'Product Title'} value={product.name ?? ''} datafunction={(e) => updateFunction(e, 'name')} />
                            <InputUi label={'Product Description'} value={product.description ?? ''} isInput={false} datafunction={(e) => updateFunction(e, 'description')} fieldClass='h-[200px]' />
                            <div className="grid grid-cols-2 gap-2">
                                <InputUi label={'Tab 1'} isInput={false} value={product.tab1 ?? ''} datafunction={(e) => updateFunction(e, 'tab1')} fieldClass='h-[100px]' />

                                <InputUi label={'Tab 2'} isInput={false} value={product.tab2 ?? ''} datafunction={(e) => updateFunction(e, 'tab2')} fieldClass='h-[100px]' />

                            </div>
                        </Container>
                        <Container gap={3} label={'Pricing & Discount'}>
                            <Pricing setProducts={setProduct} products={product} />
                        </Container>
                        <Container gap={3} label={'Variation & Stocking'}>
                            <VariationsComponent defaultValue={product.productAttributes} defaultVariation={product.variations} setProducts={setProduct} products={product} />
                        </Container>
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
                        <Container gap={3} label={'Featured Images'}>
                            <UploadImages ref={uploadRef} maxImages={2} defaultImages={product.featuredImage} />
                        </Container>
                        <Container gap={3} label={'Gallery Images'}>
                            <UploadImages ref={galleryRef} maxImages={8} defaultImages={product.galleryImage} />
                        </Container>
                        <button className='primary-button' onClick={handleUpload}>Upload Product</button>

                    </div>
                </div>
            </div>
        </Layout >
    )
}

export default EditProduct