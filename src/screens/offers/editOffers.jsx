import React, { useState, useRef, useEffect } from 'react';
import Layout from '../../layout';
import Container from '../../components/ui/container';
import SelectCustomLabelled from '../../components/ui/customSelect';
import InputCustomLabelled from '../../components/ui/customLabelledField';
import ImageUpload from '../../components/ui/imageUpload';
import './offer.css'
import ProductSearchSpecial from '../../components/ui/productSearch';
import SelectedProductList from '../../components/ui/selectedProduct';
import { useParams } from 'react-router-dom';

const offerData = [
    {
        offerId: 'OFF001',
        offerName: 'Buy 2 Get 1 Free - Stationery Special',
        offerBanner: 'https://picsum.photos/seed/stationery/200/100',
        offerLogic: 'Buy 2 products and get 1 free',
        offerSlug: 'buy-2-get-1-free-stationery',
        buyProducts: 'stationery',
        buyAt: '',
        buyNumber: '2',
        getNumbers: '1',
        promotionType: 'buyXgetY'
    },
    {
        offerId: 'OFF002',
        offerName: 'Notebooks @ ₹49 Each - Limited Time',
        offerBanner: 'https://picsum.photos/seed/notebooks/200/100',
        offerLogic: 'Buy up to 5 notebooks at ₹49 each',
        offerSlug: 'notebooks-at-49-each',
        buyProducts: 'notebooks',
        buyAt: '49',
        buyNumber: '5',
        getNumbers: '',
        promotionType: 'buyXgetFixed'
    },
    {
        offerId: 'OFF003',
        offerName: 'Get 2 Markers Free with Every 3 Pens',
        offerBanner: 'https://picsum.photos/seed/pens/200/100',
        offerLogic: 'Buy 3 pens and get 2 markers free',
        offerSlug: 'buy-3-pens-get-2-markers',
        buyProducts: 'pens',
        buyAt: '',
        buyNumber: '3',
        getNumbers: '2',
        promotionType: 'buyXgetY'
    },
    {
        offerId: 'OFF004',
        offerName: 'Color Pencils @ ₹99 for 3 Packs',
        offerBanner: 'https://picsum.photos/seed/colorpencils/200/100',
        offerLogic: 'Buy 3 color pencil packs at ₹99 each',
        offerSlug: 'color-pencils-99-for-3',
        buyProducts: 'color-pencils',
        buyAt: '99',
        buyNumber: '3',
        getNumbers: '',
        promotionType: 'buyXgetFixed'
    },
    {
        offerId: 'OFF005',
        offerName: 'Buy 4 Folders, Get 2 Free',
        offerBanner: 'https://picsum.photos/seed/folders/200/100',
        offerLogic: 'Buy 4 folders and get 2 more free',
        offerSlug: 'buy-4-get-2-folders-free',
        buyProducts: 'folders',
        buyAt: '',
        buyNumber: '4',
        getNumbers: '2',
        promotionType: 'buyXgetY'
    }
];
const EditOffers = () => {
    const [offer, setOffer] = useState({
        offerName: '',
        offerBanner: '',
        offerLogic: '',
        offerSlug: '',
        buyProducts: '',
        buyAt: '',
        buyNumber: '',
        getNumbers: '',
        promotionType: '',
        description: ''
    });

    const { id } = useParams()
    const imageUploadRef = useRef();
    const [selectedProducts, setSelectedProducts] = useState([]);

    useEffect(() => {
        const existingOffer = offerData.find((i) => i.offerId === id);
        console.log(id);

        if (existingOffer) {
            setOffer(existingOffer);
            imageUploadRef.current?.appendPrefilledImage(existingOffer.offerBanner); // ✅ Append existing banner
        }

        console.log(offer);
        console.log(existingOffer);
    }, [id]);



    const handleSelectionUpdate = (updatedList) => {
        setSelectedProducts(updatedList);
        console.log("Selected Products:", updatedList);
    };
    const handleChange = (field) => (value) => {
        setOffer((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        const uploadedImages = await imageUploadRef.current.uploadImagetoDatabase();
        const bannerUrl = uploadedImages?.[0]?.imgUrl || offer.offerBanner;

        const selectedProductIds = selectedProducts.map((product) => product.productId);

        const finalOfferData = {
            ...offer,
            offerBanner: bannerUrl,
            buyProducts: selectedProductIds,
        };

        console.log("✅ Final Offer to Submit:", finalOfferData);
        // Submit to backend here
    };

    const handleRemoveProduct = (productId) => {
        setSelectedProducts((prev) => prev.filter((p) => p.productId !== productId));
    };


    return (
        <Layout active={'admin-7a'} title={'Add Offer'}>
            <div className="pregrid-wrapper" style={{ gridTemplateColumns: '6fr 4fr', alignItems: 'start' }}>
                <div className="left96534">
                    <Container gap={10} title={'Basic Information'}>
                        <InputCustomLabelled
                            label="Offer Name"
                            htmlFor="offerName"
                            value={offer.offerName}
                            inputFunction={handleChange('offerName')}
                        />

                        <InputCustomLabelled
                            label="Offer Slug"
                            htmlFor="offerSlug"
                            value={offer.offerSlug}
                            inputFunction={handleChange('offerSlug')}
                        />
                        <InputCustomLabelled
                            isInput={false}
                            label="Offer Description"
                            htmlFor="offerDescription"
                            height={100}
                            value={offer.description}
                            inputFunction={handleChange('description')}
                        />
                        <ImageUpload

                            ref={imageUploadRef}
                            maxImages={1}
                            placeholder="Upload Offer Banner"
                            layout="boxed"
                        />

                    </Container>
                </div>
                <div className="right7523b">
                    <Container gap={10} title={'Logic'}>
                        <InputCustomLabelled
                            label="Offer Logic"
                            htmlFor="offerLogic"
                            value={offer.offerLogic}
                            inputFunction={handleChange('offerLogic')}
                        />

                        <InputCustomLabelled
                            label="Buy Products"
                            htmlFor="buyProducts"
                            value={offer.buyProducts}
                            inputFunction={handleChange('buyProducts')}
                        />

                        <InputCustomLabelled
                            label="Buy Number"
                            htmlFor="buyNumber"
                            type="number"
                            value={offer.buyNumber}
                            inputFunction={handleChange('buyNumber')}
                        />

                        {offer.promotionType === 'buyXgetFixed' && (
                            <InputCustomLabelled
                                label="Buy At Price"
                                htmlFor="buyAt"
                                type="number"
                                value={offer.buyAt}
                                inputFunction={handleChange('buyAt')}
                            />
                        )}

                        {offer.promotionType === 'buyXgetY' && (
                            <InputCustomLabelled
                                label="Get Numbers"
                                htmlFor="getNumbers"
                                type="number"
                                value={offer.getNumbers}
                                inputFunction={handleChange('getNumbers')}
                            />
                        )}

                        <SelectCustomLabelled
                            label="Promotion Type"
                            htmlFor="promotionType"
                            value={offer.promotionType}
                            selectFunction={handleChange('promotionType')}
                            options={[
                                { value: 'buyXgetY', label: 'Buy X Get Y Free' },
                                { value: 'buyXgetFixed', label: 'Buy X at Fixed Price' },
                            ]}
                        />

                        {/* 🖼️ Image Upload */}
                        {/* <p className="p-customlabbelled">Offer Banner</p> */}

                    </Container>
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'row', justifyContent: 'end' }}>
                        <button style={{
                            background: 'var(--primary-color)', padding: '10px 20px',
                            color: '#fff', border: 'none', borderRadius: '10px'
                        }} onClick={handleSubmit}>Save Offer</button>
                    </div>
                </div>


                {/* Optionally add a Save button */}
            </div>
            <SelectedProductList
                selectedProducts={selectedProducts}
                onRemove={(productId) => {
                    const updatedList = selectedProducts.filter(p => p.productId !== productId);
                    setSelectedProducts(updatedList);
                }}
            />

            <ProductSearchSpecial
                onSelectionUpdate={setSelectedProducts}
                selectedProducts={selectedProducts}
            />


        </Layout>
    );
};

export default EditOffers;
