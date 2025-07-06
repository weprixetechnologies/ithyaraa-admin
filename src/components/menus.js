// Remix Icons (RI) – react-icons/ri
import {
    RiDashboardFill,
    RiBarChart2Line,
    RiUser3Line,
    RiUserAddLine,
    RiTeamLine,
    RiPriceTag3Line,
    RiGift2Line,
    RiCouponLine,
    RiFlashlightLine,
    RiStockLine,
    RiFileList2Line,
    RiShoppingBag3Line,
    RiMoneyDollarCircleLine,
    RiMegaphoneLine,
    RiAddLine,
    RiListUnordered,
    RiUpload2Line,
    RiRefund2Line,
    RiMoneyDollarBoxLine,
    RiFileUserLine,
    RiFileChartLine,
} from 'react-icons/ri';

// Material Design Icons (MD) – react-icons/md
import {
    MdOutlineGroups,
    MdOutlinePersonAdd,
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
} from 'react-icons/md';


export const mainMenu = [
    {
        menuID: 'admin-1',
        id: 1,
        url: '/dashboard',
        icon: <RiDashboardFill />,
        title: 'Dashboard',
        subMenu: [],
    },
    {
        menuID: 'admin-2',
        id: 2,
        url: '/analytics',
        icon: <RiBarChart2Line />,
        title: 'Analytics',
        subMenu: [],
    },
    {
        menuID: 'admin-3',
        id: 3,
        url: '/users',
        icon: <RiUser3Line />,
        title: 'Users',
        subMenu: [
            { menuID: 'admin-3a', url: '/add-user', icon: <RiUserAddLine />, title: 'Add User' },
            { menuID: 'admin-3b', url: '/all-users', icon: <RiTeamLine />, title: 'All Users' },
        ],
    },
    {
        menuID: 'admin-4',
        id: 4,
        url: '/brands',
        icon: <RiPriceTag3Line />,
        title: 'Brand',
        subMenu: [
            { menuID: 'admin-4a', url: '/brands/add', icon: <RiAddLine />, title: 'Add Brands' },
            { menuID: 'admin-4b', url: '/brands/all', icon: <RiListUnordered />, title: 'All Brands' },
        ],
    },
    {
        menuID: 'admin-5',
        id: 5,
        url: '/combo',
        icon: <RiGift2Line />,
        title: 'Combo',
        subMenu: [
            { menuID: 'admin-5a', url: '/combo/add', icon: <RiAddLine />, title: 'Add Combo' },
            { menuID: 'admin-5b', url: '/combo/make', icon: <RiAddLine />, title: 'Add Make Combo' },
            { menuID: 'admin-5c', url: '/combo/all-make', icon: <RiListUnordered />, title: 'All Make Combos' },
            { menuID: 'admin-5d', url: '/combo/prebuilt', icon: <RiListUnordered />, title: 'All Prebuilt Combo' },
        ],
    },
    {
        menuID: 'category-add',
        id: 19,
        url: '/',
        icon: <RiGift2Line />,
        title: 'category',

    },
    {
        menuID: 'admin-6',
        id: 6,
        url: '/giftcards',
        icon: <RiGift2Line />,
        title: 'Giftcards',
        subMenu: [
            { menuID: 'admin-6a', url: '/giftcards/add', icon: <RiAddLine />, title: 'Add Giftcard' },
            { menuID: 'admin-6b', url: '/giftcards/all', icon: <RiListUnordered />, title: 'All Giftcards' },
            { menuID: 'admin-6c', url: '/giftcards/bulk', icon: <RiUpload2Line />, title: 'Bulk Giftcards' },
        ],
    },
    {
        menuID: 'admin-7',
        id: 7,
        url: '/offers',
        icon: <RiCouponLine />,
        title: 'Offers',
        subMenu: [
            { menuID: 'admin-7a', url: '/offers/add', icon: <RiAddLine />, title: 'Add Offers' },
            { menuID: 'admin-7b', url: '/offers/all', icon: <RiListUnordered />, title: 'All Offers' },
        ],
    },
    {
        menuID: 'admin-8',
        id: 8,
        url: '/flash-sale',
        icon: <RiFlashlightLine />,
        title: 'Flash Sale',
        subMenu: [
            { menuID: 'admin-8a', url: '/flash-sale/add', icon: <RiAddLine />, title: 'Add Flash Sale' },
            { menuID: 'admin-8b', url: '/flash-sale/all', icon: <RiListUnordered />, title: 'All Flash Sale' },
        ],
    },
    {
        menuID: 'admin-9',
        id: 9,
        url: '/stocks',
        icon: <RiStockLine />,
        title: 'Stocks',
        subMenu: [],
    },
    {
        menuID: 'admin-10',
        id: 10,
        url: '/reports',
        icon: <RiFileList2Line />,
        title: 'Reports',
        subMenu: [
            { menuID: 'admin-10a', url: '/reports/users', icon: <RiFileUserLine />, title: 'User Report' },
            { menuID: 'admin-10b', url: '/reports/sales', icon: <RiFileChartLine />, title: 'Sales Report' },
            { menuID: 'admin-10c', url: '/reports/payment', icon: <RiMoneyDollarBoxLine />, title: 'Payment Report' },
        ],
    },
    {
        menuID: 'admin-11',
        id: 11,
        url: '/orders',
        icon: <RiShoppingBag3Line />,
        title: 'Orders',
        subMenu: [
            { menuID: 'admin-11a', url: '/orders/all', icon: <RiListUnordered />, title: 'All Orders' },
            { menuID: 'admin-11b', url: '/orders/add', icon: <RiAddLine />, title: 'Add Orders' },
            { menuID: 'admin-11c', url: '/orders/returns', icon: <RiRefund2Line />, title: 'Returns' },
        ],
    },
    {
        menuID: 'admin-12',
        id: 12,
        url: '/payment',
        icon: <RiMoneyDollarCircleLine />,
        title: 'Payment',
        subMenu: [
            { menuID: 'admin-12a', url: '/payment/add', icon: <RiAddLine />, title: 'Add Payment' },
            { menuID: 'admin-12b', url: '/payment/all', icon: <RiListUnordered />, title: 'All Payment' },
        ],
    },
    {
        menuID: 'admin-13',
        id: 13,
        url: '/marketing',
        icon: <RiMegaphoneLine />,
        title: 'Marketing',
        subMenu: [
            { menuID: 'admin-13a', url: '/marketing/add-coupons', icon: <RiAddLine />, title: 'Add Coupons' },
            { menuID: 'admin-13b', url: '/marketing/all-coupons', icon: <RiListUnordered />, title: 'All Coupons' },
        ],
    },
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
        menuID: 'user-2',
        id: 2,
        url: '/add-user',
        icon: <MdOutlinePersonAdd />,
        title: 'Add Users',
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
