// Remix Icons (RI) – react-icons/ri
import {
    RiDashboardFill,
    RiGift2Line,
    RiAddLine,
    RiListUnordered,
} from 'react-icons/ri';

// Material Design Icons (MD) – react-icons/md
import {
    MdOutlineGroups,
    MdOutlinePersonOff,
    MdOutlineBlock,
    MdOutlineInventory2,
    MdOutlineAddBox,
    MdOutlineListAlt,
    MdOutlineCategory,
    MdOutlineLocalOffer,
    MdOutlineCardGiftcard,
    MdOutlineConfirmationNumber,
    MdOutlineCampaign,
    MdOutlineRateReview,
} from 'react-icons/md';


export const mainMenu = [
    {
        menuID: 'orders-m',
        id: 1,
        url: '/',
        icon: <RiDashboardFill />,
        title: 'Orders',
        subMenu: [
            { menuID: 'admin-orders-all', url: '/orders?status=all&limit=10', icon: <RiAddLine />, title: 'All Orders' },
            { menuID: 'admin-orders-pending', url: '/orders?status=pending&limit=10', icon: <RiAddLine />, title: 'Pending Orders' },
            { menuID: 'admin-orders-readytoship', url: '/orders?status=readytoship&limit=10', icon: <RiAddLine />, title: 'Ready to Ship' },
            { menuID: 'admin-orders-shipped', url: '/orders?status=shipped&limit=10', icon: <RiAddLine />, title: 'Shipped Orders' },
            { menuID: 'admin-orders-delivered', url: '/orders?status=delivered&limit=10', icon: <RiAddLine />, title: 'Delivered Orders' },
            { menuID: 'admin-orders-returned', url: '/orders?status=returned&limit=10', icon: <RiAddLine />, title: 'Returned Orders' },
            { menuID: 'admin-orders-cancelled', url: '/orders?status=cancelled&limit=10', icon: <RiAddLine />, title: 'Add Orders' },

        ],
    },
    {
        menuID: 'returns-m',
        id: 6,
        url: '/returns',
        icon: <RiGift2Line />,
        title: 'Return',
        subMenu: [
            { menuID: 'admin-returns-all', url: '/returns', icon: <RiAddLine />, title: 'All Returns' },
            // { menuID: 'admin-6b', url: '/giftcards/all', icon: <RiListUnordered />, title: 'All Giftcards' },
            // { menuID: 'admin-6c', url: '/giftcards/bulk', icon: <RiUpload2Line />, title: 'Bulk Giftcards' },
        ],
    }
];


export const userManagementMenu = [
    {
        menuID: 'user-1',
        id: 1,
        url: '/all-users',
        icon: <MdOutlineGroups />,
        title: 'All Users',
    },
    {
        menuID: 'admin-6',
        id: 6,
        url: '/giftcards',
        icon: <RiGift2Line />,
        title: 'Giftcards',
        subMenu: [
            { menuID: 'admin-6a', url: '/giftcard', icon: <RiAddLine />, title: 'Add Giftcard' },
            { menuID: 'admin-6b', url: '/giftcards/all', icon: <RiListUnordered />, title: 'All Giftcards' },
            // { menuID: 'admin-6c', url: '/giftcards/bulk', icon: <RiUpload2Line />, title: 'Bulk Giftcards' },
        ],
    },
    {
        menuID: 'user-3',
        id: 3,
        url: '/deleted-users',
        icon: <MdOutlinePersonOff />,
        title: 'Deleted Users',
    },
    {
        menuID: 'user-4',
        id: 4,
        url: '/suspended-users',
        icon: <MdOutlineBlock />,
        title: 'Suspended Users',
    },
];

export const ecommerceMenu = [
    {
        menuID: 'ecom-1',
        id: 1,
        url: '/all-orders',
        icon: <MdOutlineListAlt />,
        title: 'All Orders',
    },
    {
        menuID: 'ecom-2',
        id: 2,
        url: '/add-order',
        icon: <MdOutlineAddBox />,
        title: 'Add Orders',
    },
    {
        menuID: 'ecom-3',
        id: 3,
        url: '/all-stock',
        icon: <MdOutlineInventory2 />,
        title: 'All Stock',
    },
    {
        menuID: 'ecom-4',
        id: 4,
        url: '/add-product',
        icon: <MdOutlineAddBox />,
        title: 'Add Products',
    },
    {
        menuID: 'ecom-5',
        id: 5,
        url: '/all-products',
        icon: <MdOutlineCategory />,
        title: 'All Products',
    },
];

export const marketingMenu = [
    {
        menuID: 'mkt-1',
        id: 1,
        url: '/all-coupons',
        icon: <MdOutlineLocalOffer />,
        title: 'All Coupons',
    },
    {
        menuID: 'mkt-2',
        id: 2,
        url: '/add-coupon',
        icon: <MdOutlineAddBox />,
        title: 'Add Coupons',
    },
    {
        menuID: 'mkt-3',
        id: 3,
        url: '/add-giftcard',
        icon: <MdOutlineCardGiftcard />,
        title: 'Add Giftcard',
    },
    {
        menuID: 'mkt-4',
        id: 4,
        url: '/all-giftcard',
        icon: <MdOutlineCardGiftcard />,
        title: 'All Giftcard',
    },
    {
        menuID: 'mkt-5',
        id: 5,
        url: '/all-offers',
        icon: <MdOutlineConfirmationNumber />,
        title: 'All Offers',
    },
    {
        menuID: 'mkt-6',
        id: 6,
        url: '/add-offer',
        icon: <MdOutlineCampaign />,
        title: 'Add Offers',
    },
];
