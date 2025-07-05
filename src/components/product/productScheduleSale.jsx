import React, { useState, useEffect } from 'react';
import DatePickerComponent from '../ui/datepicker';
import InputCustomLabelled from '../ui/customLabelledField';

const ScheduleSale = ({
    regularPrice,
    setOverrideObj,
    prefillSalePrice = '',
    prefillDiscountFlat = '',
    prefillDiscountPercent = '',
    prefillScheduleDate = null
}) => {
    const [scheduleDate, setScheduleDate] = useState(null);
    const [salePrice, setSalePrice] = useState('');
    const [discountPercent, setDiscountPercent] = useState('');
    const [discountFlat, setDiscountFlat] = useState('');

    useEffect(() => {
        if (prefillSalePrice) setSalePrice(prefillSalePrice.toString());
        if (prefillDiscountFlat) setDiscountFlat(prefillDiscountFlat.toString());
        if (prefillDiscountPercent) setDiscountPercent(prefillDiscountPercent.toString());
        if (prefillScheduleDate) setScheduleDate(new Date(prefillScheduleDate));
    }, [prefillSalePrice, prefillDiscountFlat, prefillDiscountPercent, prefillScheduleDate]);

    const handleSalePriceChange = (val) => {
        const sale = parseFloat(val) || 0;
        setSalePrice(val);

        if (regularPrice) {
            const flat = regularPrice - sale;
            const perc = (flat / regularPrice) * 100;
            setDiscountFlat(flat.toFixed(2));
            setDiscountPercent(perc.toFixed(2));

            setOverrideObj({
                amount: sale.toFixed(2),
                flat: flat.toFixed(2),
                percent: perc.toFixed(2),
                scheduleDate: scheduleDate ? scheduleDate.toISOString() : null
            });
        }
    };

    const handleDiscountPercentChange = (val) => {
        const perc = parseFloat(val) || 0;
        setDiscountPercent(val);

        if (regularPrice) {
            const sp = regularPrice - (regularPrice * perc) / 100;
            const flat = regularPrice - sp;

            setSalePrice(sp.toFixed(2));
            setDiscountFlat(flat.toFixed(2));

            setOverrideObj({
                amount: sp.toFixed(2),
                flat: flat.toFixed(2),
                percent: perc.toFixed(2),
                scheduleDate: scheduleDate ? scheduleDate.toISOString() : null
            });
        }
    };

    const handleDiscountFlatChange = (val) => {
        const flat = parseFloat(val) || 0;
        setDiscountFlat(val);

        if (regularPrice) {
            const sp = regularPrice - flat;
            const perc = (flat / regularPrice) * 100;

            setSalePrice(sp.toFixed(2));
            setDiscountPercent(perc.toFixed(2));

            setOverrideObj({
                amount: sp.toFixed(2),
                flat: flat.toFixed(2),
                percent: perc.toFixed(2),
                scheduleDate: scheduleDate ? scheduleDate.toISOString() : null
            });
        }
    };

    const handleScheduleClick = () => {
        setOverrideObj({
            amount: parseFloat(salePrice).toFixed(2),
            flat: parseFloat(discountFlat).toFixed(2),
            percent: parseFloat(discountPercent).toFixed(2),
            scheduleDate: scheduleDate ? scheduleDate.toISOString() : null
        });

        console.log('✅ Sale Scheduled');
    };

    return (
        <div className="schedule-sale-section">
            <div className="wrapper--productdata" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <InputCustomLabelled
                    label="Discount %"
                    placeholder="Enter discount %"
                    value={discountPercent}
                    inputFunction={handleDiscountPercentChange}
                    isLabel={true}
                    type='number'
                />
                <InputCustomLabelled
                    label="Discount Flat"
                    placeholder="Enter flat discount"
                    value={discountFlat}
                    inputFunction={handleDiscountFlatChange}
                    isLabel={true}
                    type='number'
                />
                <InputCustomLabelled
                    label="Override Price"
                    placeholder="Enter sale price"
                    value={salePrice}
                    inputFunction={handleSalePriceChange}
                    isLabel={true}
                    type='number'
                />
            </div>

            <div className="save-attributes-wrap" style={{ marginTop: '10px' }}>
                <DatePickerComponent
                    selectedDate={scheduleDate}
                    onDateChange={setScheduleDate}
                    disableFutureDates={false}
                    minDate={new Date()}
                />

                <button className="save-attributes" onClick={handleScheduleClick}>
                    Schedule Sale
                </button>
            </div>
        </div>
    );
};

export default ScheduleSale;
