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
    RiImageLine,        // Homepage Sections
    RiQuestionLine,     // FAQ
    RiGroupLine,        // Affiliates
    RiCheckLine,        // Approval
    RiVideoLine,        // Reels
    RiCustomerService2Line, // Support
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
        menuID: 'cache-m',
        id: 100,
        url: '/admin/cache',
        icon: <RiSettings3Line />,
        title: 'Cache Management',
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
        menuID: 'admin-delivery-feedback',
        url: '/delivery-feedback/list',
        icon: <RiStarLine />,
        title: 'Delivery Feedback',
    },
    {
        menuID: 'brands-m',
        id: 19,
        url: '/brands',
        icon: <RiStarLine />,
        title: 'Brands',
        subMenu: [
            { menuID: 'admin-brands-list', url: '/brands/list', icon: <RiListUnordered />, title: 'All Brands' },
            { menuID: 'admin-brands-add', url: '/brands/add', icon: <RiFolderAddLine />, title: 'Add Brand' },
            { menuID: 'brand-applications', url: '/brands/applications', icon: <RiCheckLine />, title: 'Brand Applications' },
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
            { menuID: 'admin-refund-queries', url: '/orders/refund-queries', icon: <RiFileInfoLine />, title: 'Return Queries' },
            { menuID: 'admin-resolved-queries', url: '/orders/resolved-queries', icon: <RiCheckLine />, title: 'Return Resolved' },
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
            { menuID: 'admin-category-featured', url: '/categories/featured', icon: <RiListUnordered />, title: 'Featured Categories' },
        ],
    },
    {
        menuID: 'offers-m',
        id: 12,
        url: '/offers',
        icon: <RiStackLine />,
        title: 'Offers',
        allowedRoles: ['admin'],
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
        allowedRoles: ['admin'],
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
    },
    {
        menuID: 'affiliates-m',
        id: 28,
        url: '/affiliates',
        icon: <RiGroupLine />,
        title: 'Affiliates',
        subMenu: [
            { menuID: 'admin-affiliates-list', url: '/affiliates/list', icon: <RiListUnordered />, title: 'List Affiliate Users' },
            { menuID: 'admin-affiliates-approval', url: '/affiliates/approval', icon: <RiCheckLine />, title: 'Affiliate Approval' },
        ],
    },
    {
        menuID: 'payout-m',
        id: 17,
        url: '/payout',
        icon: <RiMoneyDollarCircleLine />,
        title: 'Payout Approval',
        subMenu: [
            { menuID: 'admin-payout-list', url: '/payout/list', icon: <RiListUnordered />, title: 'Payout Requests' },
            { menuID: 'admin-affiliate-bank-accounts', url: '/affiliate-bank-accounts/list', icon: <RiAccountBoxLine />, title: 'Affiliate Bank Accounts' },
        ],
    },
    {
        menuID: 'settlement-m',
        id: 29,
        url: '/admin/settlements',
        icon: <RiMoneyDollarCircleLine />,
        title: 'Brand Settlements',
        allowedRoles: ['admin'],
        subMenu: [
            { menuID: 'admin-settlement-list', url: '/admin/settlements', icon: <RiListUnordered />, title: 'Monthly Settlements' },
        ],
    },
    {
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
    },
    {
        menuID: 'homepage-sections-m',
        id: 24,
        url: '/homepage-sections',
        icon: <RiImageLine />,
        title: 'Homepage Sections',
        subMenu: [
            { menuID: 'admin-homepage-sections-add', url: '/homepage-sections/add', icon: <RiFolderAddLine />, title: 'Add Section' },
            { menuID: 'admin-homepage-sections-list', url: '/homepage-sections/list', icon: <RiListUnordered />, title: 'List Sections' },
            { menuID: 'admin-homepage-sections-tags', url: '/homepage-sections/tags', icon: <RiTagLine />, title: 'Section Tag Manager' },
            { menuID: 'admin-home-slider', url: '/home-slider', icon: <RiImageLine />, title: 'Home Slider Banners' },
            { menuID: 'admin-featured-blocks', url: '/featured-blocks/add', icon: <RiImageLine />, title: 'Add Featured Block' },
        ],
    },
    {
        menuID: 'home-categories-m',
        id: 34,
        url: '/home-categories',
        icon: <RiStackLine />,
        title: 'Home Categories',
        subMenu: [
            { menuID: 'admin-home-categories-list', url: '/home-categories/list', icon: <RiListUnordered />, title: 'List Home Categories' },
            { menuID: 'admin-home-categories-add', url: '/home-categories/add', icon: <RiFolderAddLine />, title: 'Add Home Category Tile' },
            { menuID: 'admin-custom-tabbed-categories', url: '/custom-tabbed-categories', icon: <RiListUnordered />, title: 'Custom Tabbed Section' },
        ],
    },
    {
        menuID: 'product-groups-m',
        id: 30,
        url: '/product-groups',
        icon: <RiBox3Line />,
        title: 'Product Groups',
        subMenu: [
            { menuID: 'admin-product-groups-add', url: '/product-groups/add', icon: <RiFolderAddLine />, title: 'Add Group' },
            { menuID: 'admin-product-groups-list', url: '/product-groups/list', icon: <RiListUnordered />, title: 'List Groups' },
        ],
    },
    {
        menuID: 'presale-section-groups-m',
        id: 38,
        url: '/presale-section-groups',
        icon: <RiBox3Line />,
        title: 'Presale Group App',
        subMenu: [
            { menuID: 'admin-presale-section-groups-add', url: '/presale-section-groups/add', icon: <RiFolderAddLine />, title: 'Add Group' },
            { menuID: 'admin-presale-section-groups-list', url: '/presale-section-groups/list', icon: <RiListUnordered />, title: 'List Groups' },
        ],
    },
    {
        menuID: 'custom-images-m',
        id: 31,
        url: '/custom-image-sections',
        icon: <RiImageLine />,
        title: 'Custom Image Sections',
        subMenu: [
            { menuID: 'admin-custom-images-add', url: '/custom-image-sections/add', icon: <RiFolderAddLine />, title: 'Add Section' },
            { menuID: 'admin-custom-images-list', url: '/custom-image-sections/list', icon: <RiListUnordered />, title: 'List Sections' },
        ],
    },
    {
        menuID: 'section-items-m',
        id: 32,
        url: '/section-items',
        icon: <RiImageLine />,
        title: 'Section Items',
        subMenu: [
            { menuID: 'admin-section-items-add', url: '/section-items/add', icon: <RiFolderAddLine />, title: 'Add Item' },
            { menuID: 'admin-section-items-list', url: '/section-items/list', icon: <RiListUnordered />, title: 'List Items' },
        ],
    },
    {
        menuID: 'combo-groups-m',
        id: 39,
        url: '/combo-groups',
        icon: <RiBox3Line />,
        title: 'Combo Groups App',
        subMenu: [
            { menuID: 'admin-combo-groups-add', url: '/combo-groups/add', icon: <RiFolderAddLine />, title: 'Add Group' },
            { menuID: 'admin-combo-groups-list', url: '/combo-groups/list', icon: <RiListUnordered />, title: 'List Groups' },
        ],
    },
    {
        menuID: 'offer-section-items-m',
        id: 40,
        url: '/offer-section-items',
        icon: <RiImageLine />,
        title: 'Offer Page Customise App',
        subMenu: [
            { menuID: 'admin-offer-section-items-add', url: '/offer-section-items/add', icon: <RiFolderAddLine />, title: 'Add Item' },
            { menuID: 'admin-offer-section-items-list', url: '/offer-section-items/list', icon: <RiListUnordered />, title: 'List Items' },
        ],
    },
    {
        menuID: 'staff-m',
        id: 101,
        url: '/staff',
        icon: <RiUser3Line />,
        title: 'Staff Management',
        allowedRoles: ['admin'],
        subMenu: [
            { menuID: 'admin-staff-list', url: '/staff/list', icon: <RiListUnordered />, title: 'List Staff' },
            { menuID: 'admin-staff-add', url: '/staff/add', icon: <RiUserAddLine />, title: 'Add Staff' },
        ],
    },
    {
        menuID: 'size-charts-m',
        id: 26,
        url: '/size-charts',
        icon: <RiImageLine />,
        title: 'Size Charts',
        subMenu: [
            { menuID: 'admin-size-charts-list', url: '/size-charts', icon: <RiListUnordered />, title: 'Manage Size Charts' },
        ],
    },
    {
        menuID: 'faq-m',
        id: 27,
        url: '/faq',
        icon: <RiQuestionLine />,
        title: 'FAQ',
        subMenu: [
            { menuID: 'admin-faq-list', url: '/faq/list', icon: <RiListUnordered />, title: 'List FAQs' },
            { menuID: 'admin-faq-add', url: '/faq/add', icon: <RiFolderAddLine />, title: 'Add FAQ' },
        ],
    },
    {
        menuID: 'newsletter-m',
        id: 25,
        url: '/admin/newsletters',
        icon: <RiStackLine />,
        title: 'Newsletters & Notifications',
        subMenu: [
            { menuID: 'admin-newsletter-subscribers', url: '/admin/newsletters/subscribers', icon: <RiListUnordered />, title: 'Subscribers' },
            { menuID: 'admin-newsletters-list', url: '/admin/newsletters', icon: <RiListUnordered />, title: 'Newsletters' },
            { menuID: 'admin-newsletters-create', url: '/admin/newsletters/create', icon: <RiFolderAddLine />, title: 'Create Newsletter' },
            { menuID: 'admin-notifications-list', url: '/admin/notifications', icon: <RiListUnordered />, title: 'Brand Notifications' },
            { menuID: 'admin-notifications-create', url: '/admin/notifications/create', icon: <RiFolderAddLine />, title: 'Create Notification' },
        ],
    },
    {
        menuID: 'reels-m',
        id: 35,
        url: '/reels',
        icon: <RiVideoLine />,
        title: 'Reels Management',
        subMenu: [
            { menuID: 'admin-reels-add', url: '/reels/add', icon: <RiFolderAddLine />, title: 'Add Reel' },
            { menuID: 'admin-reels-list', url: '/reels/list', icon: <RiListUnordered />, title: 'List Reels' },
        ],
    },
    {
        menuID: 'support-m',
        id: 36,
        url: '/support/tickets',
        icon: <RiCustomerService2Line />,
        title: 'Support System',
        subMenu: [
            { menuID: 'admin-support-tickets', url: '/support/tickets', icon: <RiListUnordered />, title: 'Ticket Queue' },
            { menuID: 'admin-support-topics', url: '/support/topics', icon: <RiStackLine />, title: 'Topic Manager' },
        ],
    }
];
