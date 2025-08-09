import Container from '@/components/ui/container';
import InputUi from '@/components/ui/inputui';
import React, { useState } from 'react';
import Layout from 'src/layout';
import { createCoupon } from '../../lib/api/couponsApi';
import { toast } from 'react-toastify';
const AddCoupon = () => {
    const [formData, setFormData] = useState({
        couponCode: '',
        assignedUser: '',
        usageLimit: '',
        discountType: '',
        discountValue: '',
    });

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        // console.log(formData);

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

            const response = await createCoupon(payload);

            if (response.result?.success) {
                toast.success('Coupon created successfully!');
                setFormData({
                    couponCode: '',
                    assignedUser: '',
                    usageLimit: '',
                    discountType: '',
                    discountValue: '',
                });
            } else {
                toast.error(response.result?.message || 'Something went wrong');
            }
        } catch (err) {
            toast.error('Failed to create coupon');
        }
    };

    return (
        <Layout title={'Add Coupon'} active={'admin-coupons-add'}>
            <div className="flex flex-col gap-2">
                <Container label={'Coupon Information'}>
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
                        Create Coupon
                    </div>
                </Container>
            </div>
        </Layout>
    );
};

export default AddCoupon;
