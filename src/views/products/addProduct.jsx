import OfferProducts from '@/components/products/offersProducts'
import Pricing from '@/components/products/pricing'
import VariationsComponent from '@/components/products/variations'
import Container from '@/components/ui/container'
import InputUi from '@/components/ui/inputui'
import UploadImages from '@/components/ui/uploadImages'
import React, { useRef, useState } from 'react'
import Layout from 'src/layout'

const AddProduct = () => {
    const uploadRef = useRef();
    const galleryRef = useRef();

    const [product, setProduct] = useState({ type: 'variable' })

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

            console.log('🚀 Full product with images:', fullProductData); // ✅ this has images

            const response = await fetch('http://localhost:3300/api/products/add-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(fullProductData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add product');
            }

            const result = await response.json();
            console.log('Product added successfully:', result);

        } catch (error) {
            console.error('Error uploading or posting product:', error.message);
        }
    };



    return (
        <Layout active={'admin-products-add'} title={'Add Product'}>
            <div className="grid grid-cols-6 gap-2">
                <div className="col-span-4 gap-2">
                    <div className="flex flex-col gap-2">
                        <Container gap={10} label={'Basic Information'}>

                            <InputUi label={'Product Title'} datafunction={(e) => updateFunction(e, 'name')} />
                            <InputUi label={'Product Description'} isInput={false} datafunction={(e) => updateFunction(e, 'description')} />
                            <div className="grid grid-cols-2 gap-2">
                                <InputUi label={'Tab 1'} isInput={false} datafunction={(e) => updateFunction(e, 'tab1')} fieldClass='h-[100px]' />

                                <InputUi label={'Tab 2'} isInput={false} datafunction={(e) => updateFunction(e, 'tab2')} fieldClass='h-[100px]' />

                            </div>
                        </Container>
                        <Container gap={10} label={'Pricing & Discount'}>
                            <Pricing setProducts={setProduct} products={product} />
                        </Container>
                        <Container gap={10} label={'Variation & Stocking'}>
                            <VariationsComponent setProducts={setProduct} products={product} />
                        </Container>
                    </div>

                </div>
                <div className="col-span-2">
                    <div className="flex flex-col gap-2">
                        {/* <Container containerclass={'bg-dark-text'}>
                            <div className="overflow-x-auto">
                                <pre className="col-span-2 mt-4 p-2 text-white rounded text-xs whitespace-pre max-w-full">
                                    {JSON.stringify(product, null, 2)}
                                </pre>
                            </div>
                        </Container> */}


                        <Container gap={10} label={'Offers & Promotions'}>
                            <OfferProducts setProducts={setProduct} products={product} />
                        </Container>
                        <Container gap={10} label={'Featured Images'}>
                            <UploadImages ref={uploadRef} maxImages={2} setProducts={setProduct} products={product} providedName='featuredImages' />
                        </Container>
                        <Container gap={10} label={'Gallery Images'}>
                            <UploadImages ref={galleryRef} maxImages={8} setProducts={setProduct} products={product} providedName='galleryImages' />
                        </Container>
                        <button className='primary-button' onClick={handleUpload}>Upload Product</button>

                    </div>
                </div>
            </div>
        </Layout >
    )
}

export default AddProduct