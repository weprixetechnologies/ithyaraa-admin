// sidebarMenus.js
import { RiDashboardHorizontalFill } from "react-icons/ri";

export const mainMenu = [
    {
        menuID: 'main-1',
        id: 1,
        url: '/',
        icon: null,
        title: 'Home',
        subMenu: [
            {
                menuID: 'main-1-1',
                id: 11,
                url: '/',
                icon: null,
                title: 'Overview',
            },
            {
                menuID: 'main-1-2',
                id: 12,
                url: '/latest-news',
                icon: null,
                title: 'Latest News',
            },
        ],
    },
    {
        menuID: 'main-2',
        id: 2,
        url: '/about',
        icon: null,
        title: 'About Us',
        subMenu: [
            {
                menuID: 'main-2-1',
                id: 21,
                url: '/about/mission',
                icon: null,
                title: 'Our Mission',
            },
            {
                menuID: 'main-2-2',
                id: 22,
                url: '/about/team',
                icon: null,
                title: 'Our Team',
            },
        ],
    },
    {
        menuID: 'main-3',
        id: 3,
        url: '/services',
        icon: null,
        title: 'Services',
        subMenu: [
            {
                menuID: 'main-3-1',
                id: 31,
                url: '/services/web-development',
                icon: null,
                title: 'Web Development',
            },
            {
                menuID: 'main-3-2',
                id: 32,
                url: '/services/seo',
                icon: null,
                title: 'SEO Optimization',
            },
        ],
    },
    {
        menuID: 'main-4',
        id: 4,
        url: '/contact',
        icon: null,
        title: 'Contact',
        subMenu: [],
    },
];

export const productMenu = [
    {
        menuID: 'product-1',
        id: 1,
        url: '/',
        icon: <RiDashboardHorizontalFill />,
        title: 'Product',
        subMenu: [
            {
                menuID: 'product-1-1',
                id: 11,
                url: '/',
                icon: null,
                title: 'Overview',
            },
            {
                menuID: 'product-1-2',
                id: 12,
                url: '/latest-news',
                icon: null,
                title: 'Latest News',
            },
        ],
    },
    {
        menuID: 'product-2',
        id: 2,
        url: '/about',
        icon: null,
        title: 'Category',
        subMenu: [
            {
                menuID: 'product-2-1',
                id: 21,
                url: '/about/mission',
                icon: null,
                title: 'Our Mission',
            },
            {
                menuID: 'product-2-2',
                id: 22,
                url: '/about/team',
                icon: null,
                title: 'Our Team',
            },
        ],
    },
];
