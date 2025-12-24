import React from 'react';
// Remix Icons (RI) – react-icons/ri
import {
    RiUser3Line,        // Users
    RiUserAddLine,      // Add User
    RiShoppingCart2Line,// Orders
    RiFileList3Line,    // Order List
    RiFileInfoLine,     // Order Details
    RiBox3Line,         // Products
    RiFolderAddLine,    // Add Product
    RiListUnordered,    // List Product / List Anything
    RiStackLine,        // Categories
    RiMoneyDollarCircleLine, // Payout
    RiSettings3Line,    // Custom Products
    RiStarSmileLine,    // Reviews
    RiStarLine,         // Brands
    RiAccountBoxLine,   // Bank Accounts
} from 'react-icons/ri';


export const mainMenu = [
    {
        menuID: 'dashboard-m',
        id: 6,
        url: '/',
        icon: <RiUser3Line />,
        title: 'Dashboard',
    },
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
        menuID: 'brand-m',
        id: 19,
        url: '/brands',
        icon: <RiStarLine />,
        title: 'Brands',
        subMenu: [
            { menuID: 'admin-brands-list', url: '/brands/list', icon: <RiListUnordered />, title: 'All Brands' },
            { menuID: 'admin-brands-add', url: '/brands/add', icon: <RiFolderAddLine />, title: 'Add Brand' },
            { menuID: 'admin-bank-details', url: '/banks/list', icon: <RiMoneyDollarCircleLine />, title: 'Bank Details' },
        ],
    },
    {
        menuID: 'orders-m',
        id: 9,
        url: '/orders',
        icon: <RiShoppingCart2Line />,
        title: 'Orders',
        subMenu: [
            // { menuID: 'admin-orders-detail', url: '/orders/details', icon: <RiFileInfoLine />, title: 'Order Details' },
            { menuID: 'admin-orders-list', url: '/orders/list', icon: <RiFileList3Line />, title: 'Order List' },
            { menuID: 'admin-brand-orders', url: '/orders/brand-orders', icon: <RiFileList3Line />, title: 'Brand Orders' },
            { menuID: 'admin-orders-pending', url: '/orders/list?status=pending', icon: <RiFileList3Line />, title: 'Pending Order' },
            { menuID: 'admin-orders-prepared', url: '/orders/list?status=preparing', icon: <RiFileList3Line />, title: 'Prepared' },
            { menuID: 'admin-orders-shipped', url: '/orders/list?status=shipping', icon: <RiFileList3Line />, title: 'Shipped' },
            { menuID: 'admin-orders-delivered', url: '/orders/list?status=delivered', icon: <RiFileList3Line />, title: 'Delivered' },
            { menuID: 'admin-orders-returned', url: '/orders/list?status=returned', icon: <RiFileList3Line />, title: 'Returned' },
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
        menuID: 'coins-m',
        id: 20,
        url: '/coins',
        icon: <RiMoneyDollarCircleLine />,
        title: 'Coins',
        subMenu: [
            { menuID: 'admin-coins-list', url: '/coins/list', icon: <RiListUnordered />, title: 'Transactions' },
        ],
    }, {
        menuID: 'flash-sale-m',
        id: 21,
        url: '/flash-sale',
        icon: <RiListUnordered />,
        title: 'Flash Sale',
        subMenu: [
            { menuID: 'admin-flash-sale-add', url: '/flash-sale/add', icon: <RiFolderAddLine />, title: 'Add Flash Sale' },
            { menuID: 'admin-flash-sale-list', url: '/flash-sale/list', icon: <RiListUnordered />, title: 'List Flash Sale' },
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
    }, {
        menuID: 'combo-m',
        id: 15,
        url: '/combo',
        icon: <RiStackLine />,
        title: 'Combo',
        subMenu: [
            { menuID: 'admin-combo-add', url: '/combo/add', icon: <RiFolderAddLine />, title: 'Add Combo' },
            { menuID: 'admin-combo-list', url: '/combo/list', icon: <RiListUnordered />, title: 'List Combo' },
        ],
    }, {
        menuID: 'custom-product-m',
        id: 16,
        url: '/custom-product',
        icon: <RiSettings3Line />,
        title: 'Custom Product',
        subMenu: [
            { menuID: 'admin-custom-product-add', url: '/custom-product/add', icon: <RiFolderAddLine />, title: 'Add Custom Product' },
            { menuID: 'admin-custom-product-list', url: '/custom-product/list', icon: <RiListUnordered />, title: 'List Custom Product' },
        ],
    }, {
        menuID: 'payout-m',
        id: 17,
        url: '/payout',
        icon: <RiMoneyDollarCircleLine />,
        title: 'Payout Approval',
        subMenu: [
            { menuID: 'admin-payout-list', url: '/payout/list', icon: <RiListUnordered />, title: 'Payout Requests' },
            { menuID: 'admin-affiliate-bank-accounts', url: '/affiliate-bank-accounts/list', icon: <RiAccountBoxLine />, title: 'Affiliate Bank Accounts' },
        ],
    }, {
        menuID: 'reviews-m',
        id: 18,
        url: '/reviews',
        icon: <RiStarSmileLine />,
        title: 'Reviews',
        subMenu: [
            { menuID: 'admin-reviews-list', url: '/reviews/list', icon: <RiListUnordered />, title: 'All Reviews' },
        ],
    },
    {
        menuID: 'presale-m',
        id: 22,
        url: '/presale',
        icon: <RiBox3Line />,
        title: 'Pre-Sale',
        subMenu: [
            { menuID: 'admin-presale-add', url: '/presale/products/add', icon: <RiFolderAddLine />, title: 'Add Pre-Sale Product' },
            { menuID: 'admin-presale-list', url: '/presale/products/list', icon: <RiListUnordered />, title: 'List Pre-Sale Products' },
            { menuID: 'admin-presale-group-add', url: '/presale/groups/add', icon: <RiFolderAddLine />, title: 'Create Pre-Sale Group' },
            { menuID: 'admin-presale-group-list', url: '/presale/groups/list', icon: <RiListUnordered />, title: 'List Pre-Sale Groups' },
        ],
    },
    {
        menuID: 'prebooking-orders-m',
        id: 23,
        url: '/prebooking-orders',
        icon: <RiShoppingCart2Line />,
        title: 'Pre-Booking Orders',
        subMenu: [
            { menuID: 'admin-prebooking-all', url: '/prebooking-orders/all', icon: <RiFileList3Line />, title: 'All Orders' },
            { menuID: 'admin-prebooking-pending', url: '/prebooking-orders/pending', icon: <RiFileList3Line />, title: 'Pending Orders' },
            { menuID: 'admin-prebooking-processing', url: '/prebooking-orders/processing', icon: <RiFileList3Line />, title: 'Processing' },
            { menuID: 'admin-prebooking-delivered', url: '/prebooking-orders/delivered', icon: <RiFileList3Line />, title: 'Delivered' },
        ],
    }
];
