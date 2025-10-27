import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Layout from 'src/layout';
import Container from '@/components/ui/container';
import InputUi from '@/components/ui/inputui';
import UploadImages from '@/components/ui/uploadImages';
import SelectProducts from '@/components/ui/selectProducts';
import { toast } from 'react-toastify';
import axiosInstance from 'src/lib/axiosInstance';

const EditOffer = () => {
    const { offerID } = useParams();
    const [loading, setLoading] = useState(true);
    const [selectedProducts, setSelectedProductsState] = useState([])

    const [offer, setOffer] = useState({
        offerName: '',
        offerType: 'buy_x_get_y',
        buyCount: '',
        buyAt: '',
        getCount: '',
        products: []
    });

    const mobileBannerRef = useRef();
    const desktopBannerRef = useRef();

    useEffect(() => {
        console.log(selectedProducts);
    }, [selectedProducts])

    useEffect(() => {
        const fetchOffer = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.get(`offer/detail/${offerID}`);
                const data = res.data;

                if (data.success) {
                    const fetched = data.data;
                    const parsedProducts = Array.isArray(fetched.products)
                        ? fetched.products
                        : typeof fetched.products === 'string'
                            ? JSON.parse(fetched.products)
                            : [];
                    setOffer({
                        offerType: 'buy_x_get_y', // fallback default
                        ...fetched,
                        products: parsedProducts,
                    });
                    setSelectedProductsState(parsedProducts);
                } else {
                    toast.error('Failed to fetch offer');
                }
            } catch (error) {
                console.error('❌ Error fetching offer:', error);
                toast.error('Error loading offer');
            } finally {
                setLoading(false);
            }
        };
        fetchOffer();
    }, [offerID]);


    const handleChange = (field) => (e) => {
        setOffer((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));
    };
    useEffect(() => {
        console.log(selectedProducts);
    }, [selectedProducts])

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const [mobileBanner, desktopBanner] = await Promise.all([
                mobileBannerRef.current?.uploadImageFunction(),
                desktopBannerRef.current?.uploadImageFunction(),
            ]);
            const payload = {
                ...offer,
                offerID,
                buyCount: Number(offer.buyCount),
                buyAt: offer.offerType === 'buy_x_at_x' ? Number(offer.buyAt) : null,
                getCount: Number(offer.getCount),
                offerMobileBanner: mobileBanner?.[0]?.imgUrl || '',
                offerBanner: desktopBanner?.[0]?.imgUrl || '',
                products: selectedProducts
            };
            const res = await axiosInstance.put(`/offer/edit-offer/${offerID}`, payload);
            const data = res.data;
            if (data.success) {
                toast.success('Offer updated successfully');
            } else {
                toast.error(data.message || 'Failed to update offer');
            }
        } catch (error) {
            console.error('Error updating offer:', error);
            toast.error(error.response?.data?.message || 'Failed to update offer');
        } finally {
            setLoading(false);
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




    if (loading) return <div className="p-5 text-lg">Loading offer...</div>;

    return (
        <Layout active={'admin-offers-edit'} title={'Edit Offer'}>
            <div className="grid grid-cols-6 gap-2">
                <div className="col-span-4">
                    <div className="flex flex-col gap-2">
                        <Container label={'Basic Information'}>
                            <InputUi
                                label="Offer Name"
                                value={offer.offerName}
                                datafunction={handleChange('offerName')}
                            />
                        </Container>
                        <Container label={'Select Products'}>
                            <SelectProducts
                                onProductToggle={handleToggleProductParent}
                                initialSelected={selectedProducts}
                            />                        </Container>
                    </div>
                </div>

                <div className="col-span-2">
                    <div className="flex flex-col gap-2">
                        <Container label={'Offer Details'}>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Offer Type</label>
                                <select
                                    value={offer.offerType}
                                    onChange={handleChange('offerType')}
                                    className="border border-gray-300 rounded px-3 py-2"
                                >
                                    <option value="buy_x_get_y">Buy X Get Y</option>
                                    <option value="buy_x_at_x">Buy X at ₹X</option>
                                </select>

                                <InputUi
                                    label="Buy Count"
                                    value={offer.buyCount}
                                    datafunction={handleChange('buyCount')}
                                />
                                {offer.offerType === 'buy_x_at_x' && (
                                    <InputUi
                                        label="Buy At"
                                        value={offer.buyAt}
                                        datafunction={handleChange('buyAt')}
                                    />
                                )}
                                <InputUi
                                    label="Get Count"
                                    value={offer.getCount}
                                    datafunction={handleChange('getCount')}
                                />
                            </div>
                        </Container>

                        <Container label={'Offer Mobile Banner'}>
                            <UploadImages
                                ref={mobileBannerRef}
                                defaultImages={offer.offerMobileBanner ? [{ imgUrl: offer.offerMobileBanner, imgAlt: 'Mobile Banner' }] : []}
                            />
                        </Container>
                        <Container label={'Offer Desktop Banner'}>
                            <UploadImages
                                ref={desktopBannerRef}
                                defaultImages={offer.offerBanner ? [{ imgUrl: offer.offerBanner, imgAlt: 'Desktop Banner' }] : []}
                            />
                        </Container>

                        <button onClick={handleSubmit} className="primary-button">
                            Update Offer
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EditOffer;
