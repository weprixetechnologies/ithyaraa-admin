import React, { useCallback, useRef, useState } from 'react'
import Layout from 'src/layout'
import Container from '@/components/ui/container'
import InputUi from '@/components/ui/inputui'
import UploadImages from '@/components/ui/uploadImages'
import { toast } from 'react-toastify'
import Pricing from '@/components/products/pricing'
import CategoryProduct from '@/components/products/categoryProduct'
import OfferProducts from '@/components/products/offersProducts'
import SelectProducts from '@/components/ui/selectProducts'

const AddMakeCombo = () => {
    const uploadRef = useRef();
    const galleryRef = useRef();

    const [selectedProducts, setSelectedProductsState] = useState([])
    const [product, setProduct] = useState({ type: 'make_combo' })

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
                galleryImage: galleryupload,
                products: selectedProducts
            };
            console.log(fullProductData);


            console.log('🚀 Full product with images:', fullProductData); // ✅ this has images

            const response = await fetch('http://localhost:3300/api/make-combo/create-make-combo', {
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
            toast.success('Product Added')

        } catch (error) {
            console.error('Error uploading or posting product:', error.message);
        }
    };
    const handleToggleProductParent = (productID) => {

        setSelectedProductsState((prev) =>
            prev.includes(productID)
                ? prev.filter((id) => id !== productID)
                : [...prev, productID]
        );
        console.log(selectedProducts);
    };


    return (
        <Layout active={'admin-mcombo-add'} title={'Create Make Combo'}>
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
                        <Container>
                            <SelectProducts
                                onProductToggle={handleToggleProductParent}
                                initialSelected={selectedProducts}
                            />

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
                        <button className='primary-button' onClick={handleUpload}>Upload Product</button>

                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default AddMakeCombo