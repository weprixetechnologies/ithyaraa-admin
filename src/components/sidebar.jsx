import React, { useState, useEffect } from 'react';
import './sidebar.css'
import logo from './../assets/ithyaraa-logo.png'
import { FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { RiDashboardFill } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom';
import { mainMenu } from './menus';



const SidebarMenu = ({ keymenu, activeMenu, userRole }) => {
    const [openMenu, setOpenMenu] = useState(null);
    const navigate = useNavigate();

    const navigation = (link) => {
        navigate(link);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('_at');
        sessionStorage.removeItem('_rt');
        sessionStorage.removeItem('isLoggedIn');
        navigate('/login');
    };

    useEffect(() => {
        const matched = keymenu.find(menu =>
            menu.menuID === activeMenu ||
            menu.subMenu?.some(sub => sub.menuID === activeMenu)
        );
        if (matched) setOpenMenu(matched.id);
    }, [activeMenu, keymenu]);

    const handleToggle = (menu) => {
        if (menu.subMenu && menu.subMenu?.length > 0) {
            setOpenMenu(prev => (prev === menu.id ? null : menu.id));
        } else {
            navigation(menu.url);
        }
    };

    // Filter menus based on role
    const filteredMenu = keymenu.filter(menu => {
        if (menu.allowedRoles && !menu.allowedRoles.includes(userRole)) {
            return false;
        }
        return true;
    });

    return (
        <div className='sidebar--component'>
            {filteredMenu?.map((menu) => {
                const isParentActive =
                    menu.menuID === activeMenu ||
                    menu.subMenu?.some(sub => sub.menuID === activeMenu);

                return (
                    <div key={menu.menuID} className='menu-item'>
                        <div
                            className={`border menu-title ${isParentActive ? 'active-menu' : ''}`}
                            onClick={() => handleToggle(menu)}
                        >
                            <div className="left">
                                <span className="icon">
                                    {menu.icon ? menu.icon : <RiDashboardFill />}
                                </span>
                                <span className="text-menu">{menu.title}</span>
                            </div>
                            {menu.subMenu?.length > 0 && (
                                <div className="right">
                                    {openMenu === menu.id ? <FiChevronDown /> : <FiChevronRight />}
                                </div>
                            )}
                        </div>

                        {openMenu === menu.id && menu.subMenu?.length > 0 && (
                            <div className="submenu">
                                {menu.subMenu?.map((sub) => (
                                    <div
                                        key={sub.menuID}
                                        className={`submenu-item ${activeMenu === sub.menuID ? 'active-submenu' : ''}`}
                                        onClick={() => navigation(sub.url)}
                                    >
                                        <span className="icon">{sub.icon}</span>
                                        <span className="text">{sub.title}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const Sidebar = ({ activeMenu }) => {
    const navigate = useNavigate();

    // Utility function to get cookie by name since it's not imported here
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    // Default to admin if cookie not found to prevent completely breaking on older sessions
    const userRole = getCookie('_role') || 'admin';

    const handleLogout = () => {
        document.cookie = '_at=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = '_rt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = '_iil=false; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = '_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        navigate('/login');
    };

    return (
        <aside className='sidebar'>
            <div className="logo-sidebar">
                <img src={logo} alt="logo" />
            </div>
            <div className="greet-user">
                <p className='welcome-text-gu'>Welcome Back</p>
                <p className='welcome-name'>
                    {userRole === 'admin' ? 'Ithyaraa Admin' : 'Ithyaraa Manager'}
                </p>
            </div>

            <div className="sidebar-menu">
                <p className='sidebar-p'>Main</p>
                <SidebarMenu keymenu={mainMenu} activeMenu={activeMenu} userRole={userRole} />
            </div>
            <div className="bottom-sidebar">
                <button className='primary-button-gta'>Go to Admin</button>
                <button className='logout-button' onClick={() => handleLogout()}>Logout</button>
            </div>
        </aside>
    );
};


export default Sidebar