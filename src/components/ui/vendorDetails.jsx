import React from 'react';
import Container from './container';

const VendorDetails = ({ vendor }) => {
    return (
        <Container gap={10} title={'Vendor Details'}>
            {
                vendor && <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '15px' }}>
                    <p>
                        <strong>Shop Name:</strong> {vendor.vendorName || 'N/A'}
                    </p>
                    <p>
                        <strong>Contact:</strong> {vendor.contactPhone || 'N/A'}
                    </p>
                    <p>
                        <strong>Email:</strong> {vendor.contactEmail || 'N/A'}
                    </p>
                    <p>
                        <strong>Address:</strong> {vendor.address || 'N/A'}
                    </p>
                </div>
            }
            {
                !vendor && <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '15px' }}>
                    <p>
                        <strong>Shop Name:</strong> In House
                    </p>
                    <p>
                        <strong>Contact:</strong> 000000000
                    </p>
                    <p>
                        <strong>Email:</strong> info@ithyaraa.com
                    </p>
                    <p>
                        <strong>Address:</strong> ITHYARAA.COM
                    </p>
                </div>
            }

        </Container>
    );
};

export default VendorDetails;
