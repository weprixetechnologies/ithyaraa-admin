import React, { useEffect, useRef, useState } from 'react'
import Layout from '../../layout'
import './combo.css'
import Container from '../../components/ui/container';
import InputCustomLabelled from '../../components/ui/customLabelledField';
import ComboPricing from '../../components/combo/comboPricing';
import ProductOffer from '../../components/product/productoffer';
import SelectCustomLabelled from '../../components/ui/customSelect';
import { RxCross2 } from 'react-icons/rx';
import ImageUpload from '../../components/ui/imageUpload';

const productData = [
    {
        productId: "P001",
        productName: "ITYARAA Exclusive 1Exclusive 1Exclusive 1",
        productFeaturedImage: [
            { imgUrl: "https://picsum.photos/seed/featured-1-1/300/200", imgAlt: "Featured Image 1-1" },
            { imgUrl: "https://picsum.photos/seed/featured-1-2/300/200", imgAlt: "Featured Image 1-2" },
        ],
        productVariationID: "VVi3241",
        galleryImages: [
            { imgUrl: "https://picsum.photos/seed/gallery-1-1/300/200", imgAlt: "Gallery Image 1-1" },
            { imgUrl: "https://picsum.photos/seed/gallery-1-2/300/200", imgAlt: "Gallery Image 1-2" },
            { imgUrl: "https://picsum.photos/seed/gallery-1-3/300/200", imgAlt: "Gallery Image 1-3" },
            { imgUrl: "https://picsum.photos/seed/gallery-1-4/300/200", imgAlt: "Gallery Image 1-4" },
        ],
    },
    {
        productId: "P002",
        productName: "ITYARAA Exclusive 2",
        productFeaturedImage: [
            { imgUrl: "https://picsum.photos/seed/featured-2-1/300/200", imgAlt: "Featured Image 2-1" },
            { imgUrl: "https://picsum.photos/seed/featured-2-2/300/200", imgAlt: "Featured Image 2-2" },
        ],
        productVariationID: "VVi7284",
        galleryImages: [
            { imgUrl: "https://picsum.photos/seed/gallery-2-1/300/200", imgAlt: "Gallery Image 2-1" },
            { imgUrl: "https://picsum.photos/seed/gallery-2-2/300/200", imgAlt: "Gallery Image 2-2" },
            { imgUrl: "https://picsum.photos/seed/gallery-2-3/300/200", imgAlt: "Gallery Image 2-3" },
            { imgUrl: "https://picsum.photos/seed/gallery-2-4/300/200", imgAlt: "Gallery Image 2-4" },
        ],
    },
    {
        productId: "P003",
        productName: "ITYARAA Exclusive 3",
        productFeaturedImage: [
            { imgUrl: "https://picsum.photos/seed/featured-3-1/300/200", imgAlt: "Featured Image 3-1" },
            { imgUrl: "https://picsum.photos/seed/featured-3-2/300/200", imgAlt: "Featured Image 3-2" },
        ],
        productVariationID: "VVi8512",
        galleryImages: [
            { imgUrl: "https://picsum.photos/seed/gallery-3-1/300/200", imgAlt: "Gallery Image 3-1" },
            { imgUrl: "https://picsum.photos/seed/gallery-3-2/300/200", imgAlt: "Gallery Image 3-2" },
            { imgUrl: "https://picsum.photos/seed/gallery-3-3/300/200", imgAlt: "Gallery Image 3-3" },
            { imgUrl: "https://picsum.photos/seed/gallery-3-4/300/200", imgAlt: "Gallery Image 3-4" },
        ],
    },
    {
        productId: "P004",
        productName: "ITYARAA Exclusive 4",
        productFeaturedImage: [
            { imgUrl: "https://picsum.photos/seed/featured-4-1/300/200", imgAlt: "Featured Image 4-1" },
            { imgUrl: "https://picsum.photos/seed/featured-4-2/300/200", imgAlt: "Featured Image 4-2" },
        ],
        productVariationID: "VVi9733",
        galleryImages: [
            { imgUrl: "https://picsum.photos/seed/gallery-4-1/300/200", imgAlt: "Gallery Image 4-1" },
            { imgUrl: "https://picsum.photos/seed/gallery-4-2/300/200", imgAlt: "Gallery Image 4-2" },
            { imgUrl: "https://picsum.photos/seed/gallery-4-3/300/200", imgAlt: "Gallery Image 4-3" },
            { imgUrl: "https://picsum.photos/seed/gallery-4-4/300/200", imgAlt: "Gallery Image 4-4" },
        ],
    },
];



const AddCombo = () => {

    //States
    const [selectedProduct, setSelectedProduct] = useState()

    //identifier
    const [comboID, setComboID] = useState(`ITHYCOMBO_${Date.now()}`); //will be passed on the main table
    const [itemsTableID, setItemsTableID] = useState(`ITHYCOMBO_${Date.now()}`); //will be passed to the table of items of combo


    // (Basic Information)
    const [comboName, setComboName] = useState('')
    const [comboDescription, setComboDescription] = useState('')
    const [slug, setSlug] = useState('')

    //Images
    // const [comboFeatured, setComboFeatured] = useState([])
    // const [comboGallery, setGallery] = useState([])

    //Product Pricing
    const [comboPricing, setComboPricing] = useState({
        regularPrice: '',
        salePrice: '',
        discountFlat: '',
        discountPercent: '',
        discountType: ''
    });

    //Offer
    const [offerID, setOfferID] = useState()

    //Product Funtionalities (secondary table)
    // const [productID, setProductID] = useState()
    // const [productVariationID, setProductVariationID] = useState()
    const [productArray, setProductArray] = useState([])


    // In Page States
    const [productFetched, setProductFetched] = useState()


    // Refs 
    const featuredRef = useRef()
    const galleryRef = useRef()

    useEffect(() => {

        const timeout = setTimeout(() => {
            //api call

            //updation function 
            const updatedProducts = addLabelAndValue(productData)

            setProductFetched(updatedProducts)
            console.log(updatedProducts);

        }, 3000)

        return () => clearTimeout(timeout);
    }, [])

    useEffect(() => {
        if (!selectedProduct) return;

        const product = productFetched?.find((i) => i.productId === selectedProduct);

        if (product) {
            setProductArray((prev) => {
                // Prevent duplicates
                const alreadyExists = prev?.some(p => p.productId === selectedProduct);
                if (alreadyExists) return prev;

                console.log([...prev, product]);

                return [...prev, product];
            });
            if (featuredRef.current?.appendPrefilledImage) {
                featuredRef.current.appendPrefilledImage(product.productFeaturedImage[0]);
            }
            if (galleryRef?.current?.appendPrefilledImage) {

                galleryRef?.current?.appendPrefilledImage(product.galleryImages)
            }

        }
    }, [selectedProduct]);


    //Functions
    const handleInputChange = (setter) => (data) => {
        setter(data);
    };

    // Function to add { label, value } fields
    const addLabelAndValue = (products) => {
        return products.map(product => ({
            ...product,
            label: product.productName,
            value: product.productId
        }));
    };


    const removeSelectedProduct = ({ productId, productFeaturedImage, galleryImages }) => {
        setProductArray(prev => prev.filter(i => i.productId !== productId));
        featuredRef.current?.removePrefilledImage?.(productFeaturedImage[0]);
        galleryRef.current?.removePrefilledImage?.(galleryImages);
    };

    const handleSave = async () => {
        try {
            const featuredObj = await featuredRef.current.uploadImagetoDatabase();
            const galleryObj = await galleryRef.current.uploadImagetoDatabase();

            const comboData = {
                comboName,
                comboID,
                itemsTableID,
                offerID,
                regularPrice: comboPricing.regularPrice,
                salePrice: comboPricing.salePrice,
                discountFlat: comboPricing.discountFlat,
                discountPercent: comboPricing.discountPercent,
                discountType: comboPricing.discountType,
                comboDescription,
                productArray,
                featuredImages: featuredObj,
                galleryImages: galleryObj
            };

            console.log(comboData);

            // optionally save to DB here

        } catch (error) {
            console.error("Failed to upload images:", error);
        }
    };





    return (
        <Layout active={'admin-5'} title={'Create Combo'} >
            <div className="add-combo-page-wrapper">
                <div className="section-left-acpw">

                    <Container gap={'10'} title={'Basic Information'}>
                        <InputCustomLabelled label={'Add Combo Name'} inputFunction={handleInputChange(setComboName)} type='text' placeholder={'Please Enter Your Combo Name'} />
                        <InputCustomLabelled label={'Enter Combo Description'} isInput={false} height={200} inputFunction={handleInputChange(setComboDescription)} type='text' placeholder={'Please Enter Your Combo Description (Not more than 500 Words for more performance)'} />
                    </Container>

                    <ComboPricing onChange={(pricingState) => setComboPricing(pricingState)} />

                </div>
                <div className="section-right-acpw">
                    <Container gap={'10'} title={'Offers Section'}>
                        <ProductOffer onChange={(e) => setOfferID(e)} offers={[{ label: 'Offer_1', value: 'Offer_1' }]} />
                    </Container>
                    <Container gap={'10'} title={'Select Products'}>
                        {
                            productArray && <div>
                                {/* <p>Selected Products</p> */}
                                {
                                    productArray?.map((i, index) => (
                                        <section className='productArraymap--selected' key={index}>
                                            <img src={i.productFeaturedImage[0].imgUrl} style={{ height: '40px', width: '40px' }} alt="" />
                                            <p>{i.productName}</p>
                                            <button onClick={() => { removeSelectedProduct(i) }} className="remove-icon--selected-pam">
                                                <RxCross2 />
                                            </button>
                                        </section>
                                    ))
                                }

                            </div>
                        }

                        <SelectCustomLabelled label='Choose Product From Below' selectFunction={setSelectedProduct} value={selectedProduct} options={productFetched ? productFetched : null} />
                    </Container>
                    <Container gap={'10'} title={'Featured Images'} >
                        <ImageUpload ref={featuredRef} />
                    </Container>
                    <div className="product-save-upload" style={{ marginTop: '20px' }}>
                        <button onClick={handleSave}>
                            Save & Update
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default AddCombo