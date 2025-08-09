import Container from '@/components/ui/container';
import InputUi from '@/components/ui/inputui';
import React, { useEffect, useState } from 'react';
import Layout from 'src/layout';
import { getCouponByID, updateCoupon } from '../../lib/api/couponsApi';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const EditCoupon = () => {
    const { couponID } = useParams(); // Assuming you're using react-router
    const [formData, setFormData] = useState({
        couponCode: '',
        assignedUser: '',
        usageLimit: '',
        discountType: '',
        discountValue: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoupon = async () => {
            try {
                const res = await getCouponByID(couponID);
                if (res.success && res.result) {
                    const {
                        couponCode,
                        assignedUser,
                        usageLimit,
                        discountType,
                        discountValue,
                    } = res.result;
                    console.log(couponCode,
                        assignedUser,
                        usageLimit,
                        discountType,
                        discountValue,);


                    setFormData({
                        couponCode,
                        assignedUser: assignedUser || '',
                        usageLimit: usageLimit?.toString() || '',
                        discountType,
                        discountValue: discountValue?.toString() || '',
                    });
                } else {
                    toast.error('Failed to load coupon');
                }
            } catch (err) {
                toast.error('Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchCoupon();
    }, [couponID]);

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async () => {
        if (
            !formData.couponCode.trim() ||
            !formData.discountType.trim() ||
            !formData.discountValue ||
            !formData.usageLimit
        ) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            const payload = {
                ...formData,
                usageLimit: Number(formData.usageLimit),
                discountValue: Number(formData.discountValue),
            };

            if (!formData.assignedUser) {
                delete payload.assignedUser;
            }

            const response = await updateCoupon(payload, couponID);
            console.log(response);


            if (response?.success) {
                toast.success('Coupon updated successfully!');
            } else {
                toast.error(response.result?.message || 'Update failed');
            }
        } catch (err) {
            toast.error('Something went wrong');
        }
    };

    if (loading) return <p className="p-4">Loading coupon details...</p>;

    return (
        <Layout title={'Edit Coupon'} active={'admin-coupons-edit'}>
            <div className="flex flex-col gap-2">
                <Container label={'Edit Coupon Information'}>
                    <InputUi
                        label={'Coupon Code'}
                        value={formData.couponCode}
                        datafunction={handleChange('couponCode')}
                    />
                    <div className="grid-cols-2 grid gap-4">
                        <InputUi
                            label={'Assign User'}
                            value={formData.assignedUser}
                            datafunction={handleChange('assignedUser')}
                        />
                        <InputUi
                            label={'Usage Limit'}
                            value={formData.usageLimit}
                            datafunction={handleChange('usageLimit')}
                        />
                        <div className="flex flex-col justify-start">
                            <p className="my-1">Discount Type</p>
                            <select
                                className="w-full p-2 bg-white border rounded-lg text-xs"
                                value={formData.discountType}
                                onChange={handleChange('discountType')}
                            >
                                <option value="" disabled>
                                    Select Discount Type
                                </option>
                                <option value="percentage">Percentage</option>
                                <option value="flat">Flat Discount</option>
                            </select>
                        </div>
                        <InputUi
                            label={'Discount Value'}
                            value={formData.discountValue}
                            datafunction={handleChange('discountValue')}
                        />
                    </div>
                    <div className="primary-button cursor-pointer" onClick={handleSubmit}>
                        Update Coupon
                    </div>
                </Container>
            </div>
        </Layout>
    );
};

export default EditCoupon;
