import React, { useState, useRef } from 'react';
import Layout from '../../layout';
import Container from '../../components/ui/container';
import SelectCustomLabelled from '../../components/ui/customSelect';
import InputCustomLabelled from '../../components/ui/customLabelledField';
import ImageUpload from '../../components/ui/imageUpload';
import './offer.css'
import ProductSearchSpecial from '../../components/ui/productSearch';
import SelectedProductList from '../../components/ui/selectedProduct';
const AddOffer = () => {
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

    const imageUploadRef = useRef();
    const [selectedProducts, setSelectedProducts] = useState([]);

    const handleSelectionUpdate = (updatedList) => {
        setSelectedProducts(updatedList);
        console.log("Selected Products:", updatedList);
    };
    const handleChange = (field) => (value) => {
        setOffer((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        const uploadedImages = await imageUploadRef.current.uploadImagetoDatabase();
        const bannerUrl = uploadedImages?.[0]?.imgUrl || '';

        const selectedProductIds = selectedProducts.map((product) => product.productId); // or product.productId

        const finalOfferData = {
            ...offer,
            offerBanner: bannerUrl,
            buyProducts: selectedProductIds, // ⬅️ Add the product IDs here
        };
        console.log(selectedProducts);

        console.log("✅ Final Offer to Submit:", finalOfferData);

        // You can now post finalOfferData to your database
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

export default AddOffer;
