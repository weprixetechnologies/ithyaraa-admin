
export const orderItems = [
    {
        id: 1,

        status: 'pending',
        sku: 'ITHY13', productID: 'cde223',
        vendor: 'vendor_4',
        featuredImage: 'https://picsum.photos/400/300?random=1',
        categoryName: 'Biking',
        orderItemID: 'vvid24', // common
        name: 'Classic Biker T-Shirt - Black',
        discount: 200, // flat ₹200 off
        regularPrice: 799,
        quantity: 2,
        total: 1398, // (799 * 2) - 200
        variationID: 'var-001',
        variationSlug: 'black-m'
    },
    {
        id: 2,
        vendor: 'vendor_4',

        status: 'shipped',
        sku: 'ITHY13', productID: 'xdfg23',

        featuredImage: 'https://picsum.photos/400/300?random=1',
        categoryName: 'Biking',
        orderItemID: 'vvid24',
        name: 'Classic Biker T-Shirt - White',
        discount: 0, // no discount
        regularPrice: 799,
        quantity: 1,
        total: 799, // (799 * 1) - 0
        variationID: 'var-002',
        variationSlug: 'white-l'
    },
    {
        id: 3,
        vendor: 'vendor_3',
        status: 'delivered',
        sku: 'ITHY13', productID: 'nbg2344',
        featuredImage: 'https://picsum.photos/400/300?random=1',
        categoryName: 'Biking',

        orderItemID: 'vvid24',
        name: 'Custom Patch Jacket',
        discount: 100, // flat ₹100 off
        regularPrice: 2499,
        quantity: 1,
        total: 2399, // (2499 * 1) - 100
        variationID: 'var-003',
        variationSlug: 'black-xl'
    }
];