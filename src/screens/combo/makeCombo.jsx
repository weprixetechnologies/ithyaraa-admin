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
import ComboConditions from '../../components/combo/comboCondition';



const MakeCombo = () => {

    //States
    const [selectedProduct, setSelectedProduct] = useState()

    //identifier
    const [comboID, setComboID] = useState(`ITHYCOMBO_${Date.now()}`); //will be passed on the main table
    const [itemsTableID, setItemsTableID] = useState(`ITHYCOMBO_${Date.now()}`); //will be passed to the table of items of combo


    // (Basic Information)
    const [comboName, setComboName] = useState('')
    const [comboDescription, setComboDescription] = useState('')


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

    //Combo Offer
    const [mcType, setMcType] = useState()
    const [includeProduct, setIncludeProduct] = useState()
    const [includeCategory, setIncludeCategory] = useState()

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
        <Layout active={'admin-5b'} title={'Make Combo'} >
            <div className="add-combo-page-wrapper">
                <div className="section-left-acpw">

                    <Container gap={'10'} title={'Basic Information'}>
                        <InputCustomLabelled label={'Add Combo Name'} inputFunction={handleInputChange(setComboName)} type='text' placeholder={'Please Enter Your Combo Name'} />
                        <InputCustomLabelled label={'Enter Combo Description'} isInput={false} height={200} inputFunction={handleInputChange(setComboDescription)} type='text' placeholder={'Please Enter Your Combo Description (Not more than 500 Words for more performance)'} />
                    </Container>

                    <ComboPricing onChange={(pricingState) => setComboPricing(pricingState)} />
                    <Container gap={'10'} title={'Gallery Images'} >
                        <ImageUpload ref={galleryRef} maxImages={'200'} />
                    </Container>
                </div>
                <div className="section-right-acpw">
                    <Container gap={'10'} title={'Offers Section'}>
                        <ProductOffer onChange={(e) => setOfferID(e)} offers={[{ label: 'Offer_1', value: 'Offer_1' }]} />
                    </Container>
                    <Container gap={'10'} title={'Category Conditions'}>
                        <ComboConditions />
                        
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

export default MakeCombo