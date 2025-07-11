/* eslint-disable */


import React, { useRef, useState } from 'react'
import Layout from '../../layout'
import './addproduct.css'
import Container from '../../components/ui/container'
import InputCustomLabelled from '../../components/ui/customLabelledField'
import ProductAttributes from '../../components/product/productattributes'
import ProductVariation from '../../components/product/productVariations'
import ImageUpload from '../../components/ui/imageUpload'
import SelectCustomLabelled from '../../components/ui/customSelect'
import ProductCategories from '../../components/product/productcategories'
import ProductTags from '../../components/product/producttags'
import ProductOffer from '../../components/product/productoffer'
import ScheduleSale from '../../components/product/productScheduleSale'
const offerArr = [
    { label: 'Summer Sale', value: 'summer2025' },
    { label: 'Diwali Deal', value: 'diwali2025' }
]


const dummyCategories = [
    {
        _id: 'cat1',
        c_name: 'electronics',
        c_label: 'Electronics',
        c_imgurl: '',
        product_ids: [],
    },
    {
        _id: 'cat2',
        c_name: 'fashion',
        c_label: 'Fashion',
        c_imgurl: '',
        product_ids: [],
    },
];
const AddProduct = () => {
    const [productName, setName] = useState('');
    const [productDescription, setDescription] = useState('');
    const [finalAttr, setFinalAtttr] = useState(null)
    const [finalVariations, setFinalVariations] = useState(null)
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categories, setCategories] = useState(dummyCategories); // you may fetch this from server
    const [overrideObj, setOverrideObj] = useState({
        amount: '',
        flat: '',
        percent: '',
    });

    const featuredImageRef = useRef()
    const galleryImageRef = useRef()
    const [regularPrice, setRegularPrice] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [discountPercent, setDiscountPercent] = useState('');
    const [discountFlat, setDiscountFlat] = useState('');
    const [stock, setStock] = useState('');
    const [tags, setTags] = useState({
        newArrival: 'No',
        bestSeller: 'No',
        buyersChoice: 'No',
    });

    const updateName = (data) => {
        setName(data);
        // console.log(data);
    };

    const updateDescription = (data) => {
        setDescription(data);
    };

    const getFinalAttr = (data) => {
        setFinalAtttr(data)
        // console.log(data);

    }

    const options = [
        { label: 'Colors', value: 'color', innerValues: ['Red', 'Green'] },
        { label: 'Sizes', value: 'size', innerValues: ['S', 'M', 'L'] },
        { label: 'Style', value: 'style', innerValues: ['Padded', 'Non-Padded'] }
    ]

    // const uploadProduct = () => {
    //     featuredImageRef.current.uploadImagetoDatabase()
    //     galleryImageRef.current.uploadImagetoDatabase()
    // }

    const handleRegularPriceChange = (val) => {
        const reg = parseFloat(val) || 0;
        setRegularPrice(val);

        const sp = parseFloat(salePrice);
        const perc = parseFloat(discountPercent);
        const flat = parseFloat(discountFlat);

        if (discountPercent) {
            const calculatedSP = reg - (reg * perc) / 100;
            setSalePrice(calculatedSP.toFixed(2));
            setDiscountFlat((reg - calculatedSP).toFixed(2));
        } else if (discountFlat) {
            const calculatedSP = reg - flat;
            setSalePrice(calculatedSP.toFixed(2));
            setDiscountPercent(((flat / reg) * 100).toFixed(2));
        } else if (sp) {
            setDiscountFlat((reg - sp).toFixed(2));
            setDiscountPercent(((reg - sp) / reg * 100).toFixed(2));
        }
    };

    const handleSalePriceChange = (val) => {
        const sale = parseFloat(val) || 0;
        setSalePrice(val);

        const reg = parseFloat(regularPrice);
        if (reg) {
            const flat = reg - sale;
            const perc = (flat / reg) * 100;
            setDiscountFlat(flat.toFixed(2));
            setDiscountPercent(perc.toFixed(2));
        } else if (discountFlat) {
            setRegularPrice((sale + parseFloat(discountFlat)).toFixed(2));
        } else if (discountPercent) {
            setRegularPrice((sale / (1 - parseFloat(discountPercent) / 100)).toFixed(2));
        }
    };

    const handleDiscountPercentChange = (val) => {
        const perc = parseFloat(val) || 0;
        setDiscountPercent(val);

        const reg = parseFloat(regularPrice);
        if (reg) {
            const sp = reg - (reg * perc) / 100;
            setSalePrice(sp.toFixed(2));
            setDiscountFlat((reg - sp).toFixed(2));
        } else if (salePrice) {
            const sale = parseFloat(salePrice);
            const reg = sale / (1 - perc / 100);
            setRegularPrice(reg.toFixed(2));
            setDiscountFlat((reg - sale).toFixed(2));
        }
    };

    const handleDiscountFlatChange = (val) => {
        const flat = parseFloat(val) || 0;
        setDiscountFlat(val);

        const reg = parseFloat(regularPrice);
        if (reg) {
            const sp = reg - flat;
            setSalePrice(sp.toFixed(2));
            setDiscountPercent(((flat / reg) * 100).toFixed(2));
        } else if (salePrice) {
            const sale = parseFloat(salePrice);
            const reg = sale + flat;
            setRegularPrice(reg.toFixed(2));
            setDiscountPercent(((flat / reg) * 100).toFixed(2));
        }
    };


    const handleSave = () => {
        if (!finalVariations) return;

        const updated = finalVariations?.map((v) => ({
            ...v,
            regularPrice: parseFloat(regularPrice) || 0,
            salePrice: parseFloat(salePrice) || 0,
            stock: parseInt(stock) || 0,
        }));

        setFinalVariations(updated);
        console.log("✅ Final Saved Variations:", updated);
    };
    return (
        <Layout title={'Add Product'} active={'ecom-4'}>
            <div className="addproducts-layout">
                <div className="left-layout--product">
                    <Container classContainer={'basicinfo'} title={'Basic Information'}>
                        <InputCustomLabelled
                            value={productName}
                            inputFunction={updateName}
                            type={'text'}
                            placeholder={'Enter Your Product Title (Max 100 Character)'}
                            label={'Add Product Title'}
                            htmlFor="product-title"
                        />

                        <InputCustomLabelled
                            value={productDescription}
                            inputFunction={updateDescription}
                            type={'text'}
                            placeholder={'Enter your product description'}
                            isInput={false}
                            height={200}
                            label={'Product Description'}
                            htmlFor="product-description"
                        />


                    </Container>
                    <Container gap={'10'} title={'Product Attributes'}>
                        <ProductAttributes getData={getFinalAttr} options={options}></ProductAttributes>
                    </Container>
                    <Container gap={'10'} title={'Product Variations'}>
                        <ProductVariation attributes={finalAttr}
                            variations={finalVariations}
                            sendVariations={setFinalVariations} />
                    </Container>
                    <Container gap={'10'} title={'Product Data'}>
                        <div className="wrapper--productdata" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                            <InputCustomLabelled
                                label={'Regular Pricing'}
                                value={regularPrice}
                                inputFunction={handleRegularPriceChange}
                                placeholder={'Enter Product Regular Price'}
                                type='number'
                            />
                            <InputCustomLabelled
                                label={'Sale Price'}
                                value={salePrice}
                                inputFunction={handleSalePriceChange}
                                placeholder={'Enter Product Sale Price'}
                                type='number'
                            />
                            <InputCustomLabelled
                                label={'Discount Percentage'}
                                value={discountPercent}
                                placeholder={'Enter Discount Percentage'}
                                inputFunction={handleDiscountPercentChange}
                                type='number'
                            />
                            <InputCustomLabelled
                                label={'Discount Flat'}
                                placeholder={'Enter Discount Flat'}
                                value={discountFlat}
                                inputFunction={handleDiscountFlatChange}
                                type='number'
                            />
                            <InputCustomLabelled
                                label={'Stock'}
                                value={stock}
                                placeholder={'Enter Stock Numbers'}
                                type='number'
                                inputFunction={setStock}
                            />


                            <InputCustomLabelled placeholder={'Enter Min Quantity'}
                                type='number' label={'Min Quantity'} />


                        </div>



                        <div className="wrapper--productdata" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                            <SelectCustomLabelled
                                label="NEW ARRIVAL"
                                value={tags.newArrival}
                                options={[
                                    { label: 'Yes', value: 'Yes' },
                                    { label: 'No', value: 'No' }
                                ]}
                                selectFunction={(val) => setTags(prev => ({ ...prev, newArrival: val }))}
                            />

                            <SelectCustomLabelled
                                label="BEST SELLER"
                                value={tags.bestSeller}
                                options={[
                                    { label: 'Yes', value: 'Yes' },
                                    { label: 'No', value: 'No' }
                                ]}
                                selectFunction={(val) => setTags(prev => ({ ...prev, bestSeller: val }))}
                            />

                            <SelectCustomLabelled
                                label="BUYER'S CHOICE"
                                value={tags.buyersChoice}
                                options={[
                                    { label: 'Yes', value: 'Yes' },
                                    { label: 'No', value: 'No' }
                                ]}
                                selectFunction={(val) => setTags(prev => ({ ...prev, buyersChoice: val }))}
                            />

                        </div>

                        <div className="save-attributes-wrap" style={{ marginTop: '10px' }}>
                            <button className="save-attributes" onClick={handleSave}>
                                Save & Validate Data
                            </button>

                        </div>
                    </Container>
                    <Container gap={'10'} title={'Schedule Sale'}>
                        <ScheduleSale regularPrice={regularPrice} setOverrideObj={setOverrideObj} />
                    </Container>

                </div>
                <div className="right-layout--product">
                    <Container gap={'10'} title={'Featured Images'}>
                        <ImageUpload ref={featuredImageRef} maxImages={2} placeholder={'Click to Upload Featured Images'} />
                    </Container>
                    <Container gap={'10'} title={'Gallery Images'}>
                        <ImageUpload ref={galleryImageRef} maxImages={5} placeholder={'Click to Add Gallery Images'} />
                    </Container>
                    <Container title={'Gallery Video'}></Container>
                    <Container gap={'10'} title={'Product Categories'}>
                        <ProductCategories
                            categoryList={categories}
                            onCategoryChange={(selectedIds) => {
                                setSelectedCategories(selectedIds);
                                console.log('✅ Selected category IDs:', selectedIds);
                            }}
                        />
                    </Container>
                    <Container gap={'10'} title={'Product Tags'}>
                        <ProductTags />
                    </Container>
                    <Container gap={'10'} title={'Offer Section'}>
                        <ProductOffer offers={offerArr} />
                    </Container>

                </div>


            </div>
        </Layout>
    )
}

export default AddProduct