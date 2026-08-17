import Container from '@/components/ui/container'
import InputUi from '@/components/ui/inputui'
import UploadImages from '@/components/ui/uploadImages'
import axiosInstance from '../../lib/axiosInstance'
import React, { useRef, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Layout from 'src/layout'
import { useParams } from 'react-router-dom'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const EditPresaleGroup = () => {
    const { presaleGroupID } = useParams()
    const bannerRef = useRef();
    const featuredRef = useRef();

    const [group, setGroup] = useState({
        status: 'upcoming',
        showOnHomepage: true,
        isFeatured: false,
        displayOrder: 0
    })
    const [presaleProducts, setPresaleProducts] = useState([])
    const [selectedProducts, setSelectedProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPresaleProducts();
        if (presaleGroupID) {
            fetchGroup();
        }
    }, [presaleGroupID]);

    const fetchPresaleProducts = async () => {
        try {
            const { data } = await axiosInstance.get('/admin/presale-products/all');
            if (data.success) {
                setPresaleProducts(data.data);
            }
        } catch (error) {
            console.error('Error fetching presale products:', error);
        }
    };

    const fetchGroup = async () => {
        try {
            const { data } = await axiosInstance.get(`/admin/presale-groups/${presaleGroupID}`);
            if (data.success) {
                const groupData = {
                    ...data.data,
                    bannerImage: parseJSONSafe(data.data.bannerImage),
                    featuredImage: parseJSONSafe(data.data.featuredImage),
                };
                setGroup(groupData);
                if (data.data.products && Array.isArray(data.data.products)) {
                    setSelectedProducts(data.data.products.map(p => p.presaleProductID));
                }
            }
        } catch (error) {
            console.error('Error fetching presale group:', error);
            toast.error('Failed to load presale group');
        } finally {
            setLoading(false);
        }
    };

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

    const formatDateTimeForInput = (dateValue) => {
        if (!dateValue) return '';

        let val = dateValue;
        if (typeof val === 'string') {
            if (val.includes(' ') && !val.includes('T') && !val.includes('Z')) {
                val = val.replace(' ', 'T') + 'Z';
            }
            else if (val.includes('T') && !val.includes('Z') && !val.includes('+') && !val.includes('-')) {
                val = val + 'Z';
            }
        }

        const date = new Date(val);
        if (isNaN(date.getTime())) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const formatDateForInput = (dateValue) => {
        if (!dateValue) return '';

        let val = dateValue;
        if (typeof val === 'string') {
            if (val.includes(' ') && !val.includes('T') && !val.includes('Z')) {
                val = val.replace(' ', 'T') + 'Z';
            }
            else if (val.includes('T') && !val.includes('Z') && !val.includes('+') && !val.includes('-')) {
                val = val + 'Z';
            }
        }

        const date = new Date(val);
        if (isNaN(date.getTime())) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const updateFunction = (data, name) => {
        setGroup(prev => ({
            ...prev,
            [name]: data.target.value
        }));
    };

    const handleUpload = async () => {
        try {
            const bannerImages = await bannerRef.current?.uploadImageFunction();
            const featuredImages = await featuredRef.current?.uploadImageFunction();

            const convertToMySQL = (dateStr) => {
                if (!dateStr) return null;
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return null;
                
                const pad = (n) => n.toString().padStart(2, '0');
                // Format to LOCAL YYYY-MM-DD HH:mm:ss
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            };

            const fullGroupData = {
                ...group,
                bannerImage: bannerImages,
                featuredImage: featuredImages,
                productIDs: selectedProducts,
                startDate: convertToMySQL(group.startDate),
                endDate: convertToMySQL(group.endDate),
                earlyBirdEndDate: convertToMySQL(group.earlyBirdEndDate),
                expectedDeliveryDate: convertToMySQL(group.expectedDeliveryDate)
            };

            const { data: result } = await axiosInstance.put(
                `/admin/presale-groups/${presaleGroupID}`,
                fullGroupData
            );

            if (result.success) {
                toast.success('Pre-Sale Group Updated Successfully!');
            }
        } catch (error) {
            console.error('Error updating presale group:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to update pre-sale group');
        }
    };

    if (loading) {
        return (
            <Layout active={'admin-presale-group-edit'} title={'Edit Pre-Sale Group'}>
                <div className="flex items-center justify-center h-64">
                    <p>Loading...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout active={'admin-presale-group-edit'} title={'Edit Pre-Sale Group'}>
            <div className="grid grid-cols-6 gap-2">
                <div className="col-span-4 gap-2">
                    <div className="flex flex-col gap-2">
                        <Container gap={3} label={'Basic Information'}>
                            <InputUi label={'Group Name'} value={group.groupName || ''} datafunction={(e) => updateFunction(e, 'groupName')} />
                            <InputUi label={'Description'} value={group.description || ''} isInput={false} datafunction={(e) => updateFunction(e, 'description')} />
                        </Container>
                        <Container gap={3} label={'Pre-Sale Dates'}>
                            <div className="grid grid-cols-2 gap-3">
                                <InputUi
                                    label={'Start Date'}
                                    type="datetime-local"
                                    value={formatDateTimeForInput(group.startDate)}
                                    datafunction={(e) => updateFunction(e, 'startDate')}
                                />
                                <InputUi
                                    label={'End Date'}
                                    type="datetime-local"
                                    value={formatDateTimeForInput(group.endDate)}
                                    datafunction={(e) => updateFunction(e, 'endDate')}
                                />
                                <InputUi
                                    label={'Expected Delivery Date'}
                                    type="date"
                                    value={formatDateForInput(group.expectedDeliveryDate)}
                                    datafunction={(e) => updateFunction(e, 'expectedDeliveryDate')}
                                />
                            </div>
                        </Container>
                        <Container gap={3} label={'Discount Settings'}>
                            <div className="grid grid-cols-2 gap-3">
                                <Select
                                    onValueChange={(value) => setGroup(prev => ({ ...prev, groupDiscountType: value }))}
                                    value={group.groupDiscountType || ''}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Discount Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage</SelectItem>
                                        <SelectItem value="flat">Flat</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputUi
                                    label={'Group Discount Value'}
                                    type="number"
                                    value={group.groupDiscountValue || ''}
                                    datafunction={(e) => updateFunction(e, 'groupDiscountValue')}
                                />
                                <InputUi
                                    label={'Early Bird Discount'}
                                    type="number"
                                    value={group.earlyBirdDiscount || ''}
                                    datafunction={(e) => updateFunction(e, 'earlyBirdDiscount')}
                                />
                                <InputUi
                                    label={'Early Bird End Date'}
                                    type="datetime-local"
                                    value={formatDateTimeForInput(group.earlyBirdEndDate)}
                                    datafunction={(e) => updateFunction(e, 'earlyBirdEndDate')}
                                />
                            </div>
                        </Container>
                        <Container gap={3} label={'Display Settings'}>
                            <div className="grid grid-cols-2 gap-3">
                                <Select
                                    onValueChange={(value) => setGroup(prev => ({ ...prev, status: value }))}
                                    value={group.status}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="upcoming">Upcoming</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputUi
                                    label={'Display Order'}
                                    type="number"
                                    value={group.displayOrder || 0}
                                    datafunction={(e) => updateFunction(e, 'displayOrder')}
                                />
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={group.showOnHomepage}
                                        onChange={(e) => setGroup(prev => ({ ...prev, showOnHomepage: e.target.checked }))}
                                    />
                                    <label>Show on Homepage</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={group.isFeatured}
                                        onChange={(e) => setGroup(prev => ({ ...prev, isFeatured: e.target.checked }))}
                                    />
                                    <label>Featured</label>
                                </div>
                            </div>
                        </Container>
                    </div>
                </div>
                <div className="col-span-2">
                    <div className="flex flex-col gap-2">
                        <Container containerclass={'bg-dark-text'}>
                            <div className="overflow-x-auto">
                                <pre className="col-span-2 mt-4 p-2 text-white rounded text-xs whitespace-pre max-w-full">
                                    {JSON.stringify(group, null, 2)}
                                </pre>
                            </div>
                        </Container>
                        <Container gap={3} label={'Banner Image'}>
                            <UploadImages ref={bannerRef} maxImages={1} setProducts={setGroup} products={group} defaultValue={group.bannerImage} />
                        </Container>
                        <Container gap={3} label={'Featured Image'}>
                            <UploadImages ref={featuredRef} maxImages={1} setProducts={setGroup} products={group} defaultValue={group.featuredImage} />
                        </Container>
                        <Container gap={3} label={'Select Pre-Sale Products'}>
                            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                                {presaleProducts.map(product => (
                                    <div key={product.presaleProductID} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product.presaleProductID)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedProducts(prev => [...prev, product.presaleProductID]);
                                                } else {
                                                    setSelectedProducts(prev => prev.filter(id => id !== product.presaleProductID));
                                                }
                                            }}
                                        />
                                        <label className="text-sm">{product.name}</label>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-secondary-text mt-2">
                                {selectedProducts.length} product(s) selected
                            </p>
                        </Container>
                        <button className='primary-button' onClick={handleUpload}>Update Pre-Sale Group</button>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default EditPresaleGroup

