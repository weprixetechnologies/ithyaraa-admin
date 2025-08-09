import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from 'src/layout';
import Container from '@/components/ui/container';
import InputUi from '@/components/ui/inputui';
import UploadImages from '@/components/ui/uploadImages';
import SelectProducts from '@/components/ui/selectProducts';
import OfferProducts from '@/components/products/offersProducts';
import Pricing from '@/components/products/pricing';
import CategoryProduct from '@/components/products/categoryProduct';
import { getMakeComboDetail } from '../../lib/api/makeComboApi';
import { toast } from 'react-toastify';

const EditMakeCombo = () => {
    const { comboID } = useParams();
    const uploadRef = useRef();
    const galleryRef = useRef();

    const [loading, setLoading] = useState(true);
    const [selectedProductIDs, setSelectedProductIDs] = useState([]);

    const [product, setProduct] = useState({
        name: '',
        description: '',
        tab1: '',
        tab2: '',
        type: 'variable',
        featuredImage: [],
        galleryImage: [],
        categories: [],
        products: [],
       
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await getMakeComboDetail(comboID);

                const parsedProduct = {
                    ...data,
                    name: data.name ?? '',
                    description: data.description ?? '',
                    tab1: data.tab1 ?? '',
                    tab2: data.tab2 ?? '',
                    featuredImage: parseJSONSafe(data.featuredImage) ?? [],
                    productAttributes: parseJSONSafe(data.productAttributes) ?? [],
                    variations: Array.isArray(data.variations)
                        ? data.variations.map(variation => ({
                            ...variation,
                            variationValues: parseJSONSafe(variation.variationValues),
                        }))
                        : [],
                    categories: parseJSONSafe(data.categories) ?? [],
                    products: parseJSONSafe(data.products) ?? [],
                };

                setProduct(parsedProduct);
                setSelectedProductIDs(parsedProduct.products);
                console.log(parsedProduct);

            } catch (error) {
                console.error('Error fetching product details:', error);
                toast.error('Failed to load combo details');
            } finally {
                setLoading(false);
            }
        };

        if (comboID) fetchProduct();
    }, [comboID]);

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

    const updateFunction = (e, name) => {
        setProduct(prev => ({
            ...prev,
            [name]: e.target.value
        }));
    };

    const handleToggleProductParent = (productID) => {
        setSelectedProductIDs(prev =>
            prev.includes(productID)
                ? prev.filter(id => id !== productID)
                : [...prev, productID]
        );
    };

    const handleUpload = async () => {
        try {
            const [featuredImage, galleryImage] = await Promise.all([
                uploadRef.current?.uploadImageFunction(),
                galleryRef.current?.uploadImageFunction(),
            ]);

            const fullProductData = {
                ...product,
                featuredImage,
                galleryImage,
                products: selectedProductIDs,
                comboID, // include comboID for editing
            };

            const response = await fetch(`http://localhost:3300/api/make-combo/edit/${comboID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fullProductData),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message || 'Failed to edit product');

            toast.success('Combo updated successfully!');
        } catch (error) {
            console.error('Error uploading or posting product:', error.message);
            toast.error(`Error: ${error.message}`);
        }
    };

    if (loading) return <div className="p-5 text-lg">Loading combo...</div>;

    return (
        <Layout active={'admin-products-add'} title={'Edit Make Combo'}>
            <div className="grid grid-cols-6 gap-2">
                <div className="col-span-4 flex flex-col gap-2">
                    <Container gap={3} label={'Basic Information'}>
                        <InputUi
                            label={'Product Title'}
                            value={product.name ?? ''}
                            datafunction={(e) => updateFunction(e, 'name')}
                        />
                        <InputUi
                            label={'Product Description'}
                            isInput={false}
                            value={product.description ?? ''}
                            datafunction={(e) => updateFunction(e, 'description')}
                            fieldClass="h-[200px]"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <InputUi
                                label={'Tab 1'}
                                isInput={false}
                                value={product.tab1 ?? ''}
                                datafunction={(e) => updateFunction(e, 'tab1')}
                                fieldClass="h-[100px]"
                            />
                            <InputUi
                                label={'Tab 2'}
                                isInput={false}
                                value={product.tab2 ?? ''}
                                datafunction={(e) => updateFunction(e, 'tab2')}
                                fieldClass="h-[100px]"
                            />
                        </div>
                    </Container>

                    <Container gap={3} label={'Pricing & Discount'}>
                        <Pricing setProducts={setProduct} products={product} />
                    </Container>

                    <Container gap={3} label={'Select Products'}>
                        <SelectProducts
                            initialSelected={selectedProductIDs}
                            onProductToggle={handleToggleProductParent}
                        />
                    </Container>
                </div>

                <div className="col-span-2 flex flex-col gap-2">
                    <Container containerclass={'bg-dark-text'}>
                        <div className="overflow-x-auto">
                            <pre className="col-span-2 mt-4 p-2 text-white rounded text-xs whitespace-pre max-w-full">
                                {JSON.stringify(product, null, 3)}
                            </pre>
                        </div>
                    </Container>

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
                        <UploadImages ref={uploadRef} maxImages={2} defaultImages={product.featuredImage} />
                    </Container>

                    <Container gap={3} label={'Gallery Images'}>
                        <UploadImages ref={galleryRef} maxImages={8} defaultImages={product.galleryImage ?? []} />
                    </Container>

                    <button className="primary-button" onClick={handleUpload}>
                        Upload Product
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default EditMakeCombo;
