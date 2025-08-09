// Remix Icons (RI) – react-icons/ri
import {
    RiUser3Line,        // Users
    RiUserAddLine,      // Add User
    RiTeamLine,         // Vendors
    RiStore2Line,       // Add Vendor
    RiShoppingCart2Line,// Orders
    RiFileList3Line,    // Order List
    RiFileInfoLine,     // Order Details
    RiBox3Line,         // Products
    RiFolderAddLine,    // Add Product
    RiListUnordered,    // List Product / List Anything
    RiStackLine,        // Categories
} from 'react-icons/ri';


export const mainMenu = [
    {
        menuID: 'users-m',
        id: 7,
        url: '/users',
        icon: <RiUser3Line />,
        title: 'Users',
        subMenu: [
            { menuID: 'admin-users-all', url: '/users/list', icon: <RiListUnordered />, title: 'List Users' },
            { menuID: 'admin-users-add', url: '/users/add', icon: <RiUserAddLine />, title: 'Add Users' },
        ],
    },
    {
        menuID: 'vendor-m',
        id: 8,
        url: '/vendor',
        icon: <RiTeamLine />,
        title: 'Vendors',
        subMenu: [
            { menuID: 'vendors-users-add', url: '/vendors/add', icon: <RiStore2Line />, title: 'Add Vendor' },
        ],
    },
    {
        menuID: 'orders-m',
        id: 9,
        url: '/orders',
        icon: <RiShoppingCart2Line />,
        title: 'Orders',
        subMenu: [
            { menuID: 'admin-orders-detail', url: '/orders/details', icon: <RiFileInfoLine />, title: 'Order Details' },
            { menuID: 'admin-orders-list', url: '/orders/list', icon: <RiFileList3Line />, title: 'Order List' },
        ],
    },
    {
        menuID: 'products-m',
        id: 10,
        url: '/products',
        icon: <RiBox3Line />,
        title: 'Products',
        subMenu: [
            { menuID: 'admin-products-add', url: '/products/add', icon: <RiFolderAddLine />, title: 'Add Products' },
            { menuID: 'admin-products-list', url: '/products/list', icon: <RiListUnordered />, title: 'List Products' },
        ],
    },
    {
        menuID: 'category-m',
        id: 11,
        url: '/category',
        icon: <RiStackLine />,
        title: 'Category',
        subMenu: [
            { menuID: 'admin-category-add', url: '/categories/add', icon: <RiFolderAddLine />, title: 'Add Category' },
            { menuID: 'admin-category-list', url: '/categories/list', icon: <RiListUnordered />, title: 'List Category' },
        ],
    },
    {
        menuID: 'offers-m',
        id: 12,
        url: '/offers',
        icon: <RiStackLine />,
        title: 'Offers',
        subMenu: [
            { menuID: 'admin-offers-add', url: '/offer/add', icon: <RiFolderAddLine />, title: 'Add Offers' },
            { menuID: 'admin-offers-list', url: '/offer/list', icon: <RiListUnordered />, title: 'List Offers' },
        ],
    }, {
        menuID: 'coupons-m',
        id: 13,
        url: '/coupons',
        icon: <RiStackLine />,
        title: 'Coupons',
        subMenu: [
            { menuID: 'admin-coupons-add', url: '/coupons/add', icon: <RiFolderAddLine />, title: 'Add Coupons' },
            { menuID: 'admin-coupons-list', url: '/coupons/list', icon: <RiListUnordered />, title: 'List Coupons' },
        ],
    }, {
        menuID: 'mcombo-m',
        id: 14,
        url: '/mcombo',
        icon: <RiStackLine />,
        title: 'Make Combo',
        subMenu: [
            { menuID: 'admin-mcombo-add', url: '/make-combo/add', icon: <RiFolderAddLine />, title: 'Add Make Combo' },
            { menuID: 'admin-mcombo-list', url: '/make-combo/list', icon: <RiListUnordered />, title: 'List Make Combo' },
        ],
    }
];
