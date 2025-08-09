import React, { useState, useRef } from 'react'
import Layout from 'src/layout'
import Container from '@/components/ui/container'
import InputUi from '@/components/ui/inputui'
import UploadImages from '@/components/ui/uploadImages'
import SelectProducts from '@/components/ui/selectProducts'

import { toast } from 'react-toastify'

const AddOffer = () => {
    const [offerType, setOfferType] = useState('buy_x_get_y')
    const [selectedProducts, setSelectedProductsState] = useState([])
    const [offerName, setOfferName] = useState('')
    const [buyCount, setBuyCount] = useState('')
    const [buyAt, setBuyAt] = useState('')
    const [getCount, setGetCount] = useState('')

    const mobileBannerRef = useRef()
    const desktopBannerRef = useRef()

    const handleOfferTypeChange = (e) => {
        setOfferType(e.target.value)
    }

    const handleToggleProductParent = (productID) => {

        setSelectedProductsState((prev) =>
            prev.includes(productID)
                ? prev.filter((id) => id !== productID)
                : [...prev, productID]
        );
        console.log(selectedProducts);
    };


    const handleSubmit = async () => {
        try {
            // Wait for both image uploads
            const [mobileBanner, desktopBanner] = await Promise.all([
                mobileBannerRef.current?.uploadImageFunction(),
                desktopBannerRef.current?.uploadImageFunction()
            ]);

            // Prepare clean payload
            const payload = {
                offerName,
                offerType,
                buyCount: Number(buyCount),
                buyAt: offerType === 'buy_x_at_x' ? Number(buyAt) : null,
                getCount: Number(getCount),
                offerMobileBanner: mobileBanner?.[0]?.imgUrl || '',
                offerBanner: desktopBanner?.[0]?.imgUrl || '',
                products: selectedProducts
            };

            console.log('Submitting offer:', payload);

            const res = await fetch('http://localhost:3300/api/offer/add-offer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                console.log('Offer created successfully');
                console.log(data);
                toast.success('Offer is Live')
                // Optionally reset form or show toast
            } else {
                console.error('Failed to create offer:', data.message);
                toast.success('Offer Upload Issue')

            }
        } catch (error) {
            console.error('Error submitting offer:', error);
            toast.success('Offer Upload Issue')

        }
    };


    return (
        <Layout active={'admin-offers-add'} title={'Add Offer'}>
            <div className="grid grid-cols-6 gap-2">
                <div className="col-span-4">
                    <div className="flex flex-col gap-2">
                        <Container label={'Basic Information'}>
                            {/* <InputUi label={'Offer ID'} datafunction={(val) => setOfferID(val.target.value)} /> */}
                            <InputUi label={'Offer Name'} datafunction={(val) => setOfferName(val.target.value)} />
                        </Container>
                        <Container label={'Select Products'}>
                            <SelectProducts
                                onProductToggle={handleToggleProductParent}
                                initialSelected={selectedProducts}
                            />
                            {selectedProducts.length > 0 && (
                                <div className="mt-4 text-sm text-gray-700">
                                    <strong>Selected Product IDs:</strong>{' '}
                                    {selectedProducts.join(', ')}
                                </div>
                            )}
                        </Container>

                    </div>
                </div>

                <div className="col-span-2">
                    <div className="flex flex-col gap-2">
                        <Container label={'Offer Details'}>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Offer Type</label>
                                <select
                                    value={offerType}
                                    onChange={handleOfferTypeChange}
                                    className="border border-gray-300 rounded px-3 py-2"
                                >
                                    <option value="buy_x_get_y">Buy X Get Y</option>
                                    <option value="buy_x_at_x">Buy X at ₹X</option>
                                </select>

                                <InputUi label={'Buy Count'} datafunction={(val) => setBuyCount(val.target.value)} />
                                {offerType === 'buy_x_at_x' && (
                                    <InputUi label={'Buy At'} datafunction={(val) => setBuyAt(val.target.value)} />
                                )}
                                <InputUi label={'Get Count'} datafunction={(val) => setGetCount(val.target.value)} />
                            </div>
                        </Container>

                        <Container label={'Offer Mobile Banner'}>
                            <UploadImages ref={mobileBannerRef} />
                        </Container>
                        <Container label={'Offer Desktop Banner'}>
                            <UploadImages ref={desktopBannerRef} />
                        </Container>

                        <button onClick={handleSubmit} className="primary-button">
                            Add Offer
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default AddOffer
