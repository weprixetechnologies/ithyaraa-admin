// Remix Icons (RI) – react-icons/ri
import {
    RiGift2Line,
    RiAddLine,
} from 'react-icons/ri';




export const mainMenu = [
    {
        menuID: 'users-m',
        id: 7,
        url: '/users',
        icon: <RiGift2Line />,
        title: 'Users',
        subMenu: [
            { menuID: 'admin-users-all', url: '/users/list', icon: <RiAddLine />, title: 'List Users' },
            { menuID: 'admin-users-add', url: '/users/add', icon: <RiAddLine />, title: 'Add Users' },
        ],
    }, {
        menuID: 'vendor-m',
        id: 8,
        url: '/vendor',
        icon: <RiGift2Line />,
        title: 'Vendors',
        subMenu: [
            { menuID: 'vendors-users-add', url: '/vendors/add', icon: <RiAddLine />, title: 'Add Vendor' },

        ],
    }, {
        menuID: 'orders-m',
        id: 9,
        url: '/orders',
        icon: <RiGift2Line />,
        title: 'Orders',
        subMenu: [
            { menuID: 'admin-orders-detail', url: '/orders/details', icon: <RiAddLine />, title: 'Order Details' },
            { menuID: 'admin-orders-list', url: '/orders/list', icon: <RiAddLine />, title: 'Order List' },

        ],
    },
    {
        menuID: 'products-m',
        id: 9,
        url: '/products',
        icon: <RiGift2Line />,
        title: 'Products',
        subMenu: [
            { menuID: 'admin-products-add', url: '/products/add', icon: <RiAddLine />, title: 'Add Products' },


        ],
    }
];
