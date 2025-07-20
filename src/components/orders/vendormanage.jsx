import React from 'react';
import SelectCustomLabelled from '../ui/customSelect';
import Container from '../ui/container';

const VendorManageSection = ({ orderItems }) => {
    // Extract unique vendors
    const uniqueVendors = [...new Set(orderItems.map(item => item.vendor))];

    // Format vendors for display
    const vendorOptions = uniqueVendors.map(vendor => ({
        label: vendor, // Replace with vendor name if needed
        value: vendor,
    }));

    return (
        <Container gap={10} title={'Vendor Manage'}>
            {vendorOptions.map((vendor, index) => (
                <SelectCustomLabelled
                    key={index}
                    label={`Assigned Vendor ${index + 1}`}
                    options={[vendor]} // Single option
                    value={vendor.value}
                    selectFunction={() => { }} // No-op
                    disabled={true}
                />
            ))}
            <div style={{ display: 'flex', justifyContent: 'end', gap: '10px' }}>
                <button id='vc25'>Call Vendor</button>
                <button id='vc25'>Notify Vendor</button>
            </div>
        </Container>
    );
};

export default VendorManageSection;
